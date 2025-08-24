from fastapi import APIRouter, Request, BackgroundTasks
from app.models.pr_event import PRPayloadV2, PRFileInfo
from app.api.summary import generate_summary_response
from app.api.review import generate_review_response
from app.services.claude_service import ClaudeService
from app.utils.chunking_strategy import create_summary_chunks, prepare_chunk_for_summary
from app.utils.summary_aggregator import aggregate_chunk_summaries
from app.utils.line_perser import extract_review_info
import httpx
import os
import json
import re
from app.api.review_parser import parse_review_response
from typing import Literal
from dotenv import load_dotenv
import math
import logging
import time
from logging.handlers import RotatingFileHandler

load_dotenv()

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create logs directory if it doesn't exist
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)

# Create formatter
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
)

# Create file handler with rotation (10MB max, keep 5 files)
file_handler = RotatingFileHandler(
    filename=os.path.join(log_dir, 'supervisor.log'),
    maxBytes=10 * 1024 * 1024,  # 10MB
    backupCount=5,
    encoding='utf-8'
)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)

# Create console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

# Add handlers to logger if not already added
if not logger.handlers:
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

supervisor = APIRouter(prefix="", tags=["Supervisor"])

# Get backend base URL from environment variable
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://backend")
BACKEND_REVIEW_ENDPOINT = os.getenv("BACKEND_REVIEW_ENDPOINT", "http://backend/reviews")
BACKEND_SUMMARY_ENDPOINT = os.getenv("BACKEND_SUMMARY_ENDPOINT", "http://backend/summary")
BATCH_SIZE = 10

def get_backend_url(provider: str, endpoint: Literal["summary", "reviews"]) -> str:
    provider = provider.lower()
    if provider not in ["github", "gitlab", "bitbucket"]:
        provider = "github"  # Default fallback
    return f"{BACKEND_BASE_URL}/v1/{provider}/{endpoint}"

def validate_pr_payload(payload: PRPayloadV2) -> tuple[bool, str, dict]:
    """
    Validate the PR payload format and extract essential data.
    Returns: (is_valid, error_message, extracted_data)
    """
    try:
        pr = payload.pullRequest
        if not pr:
            return False, "No pullRequest data in payload", {}
        
        # Check required fields
        required_fields = ["prNumber", "prTitle"]
        missing_fields = [field for field in required_fields if not pr.get(field)]
        if missing_fields:
            return False, f"Missing required fields: {', '.join(missing_fields)}", {}
        
        # Extract and validate data
        extracted_data = {
            "provider": pr.get("provider", "unknown"),
            "installation_id": pr.get("installationId", "0"),
            "pullRequestAnalysisId": pr.get("pullRequestAnalysisId", "0"),
            "number_of_files": pr.get("prFilesChanged", 0),
            "prNumber": pr["prNumber"],
            "prTitle": pr["prTitle"],
            "prBody": pr.get("prBody", ""),
            "author_name": pr.get("prUser", ""),
            "repo_structure_summary": pr.get("prRepoName", ""),
            "prFiles": pr.get("prFiles", [])
        }
        
        # Validate prFiles structure if present
        if extracted_data["prFiles"] and not isinstance(extracted_data["prFiles"], list):
            return False, "prFiles must be a list", {}
        
        # Check if files have required structure
        for i, file_info in enumerate(extracted_data["prFiles"]):
            if not isinstance(file_info, dict):
                return False, f"File {i} is not a valid object", {}
            if "prFileName" not in file_info:
                return False, f"File {i} missing prFileName", {}
            if "prFileDiff" not in file_info:
                return False, f"File {i} missing prFileDiff", {}
        
        logger.info(f"Payload validation successful. PR: {extracted_data['prNumber']}, Files: {len(extracted_data['prFiles'])}")
        return True, "", extracted_data
        
    except Exception as e:
        logger.error(f"Payload validation failed with exception: {str(e)}")
        return False, f"Payload validation error: {str(e)}", {}

async def process_pr_review_background(extracted_data: dict):
    """
    Background task to process PR review after responding to the client.
    """
    start_time = time.time()
    
    logger.info("=" * 80)
    logger.info("Starting background PR review process")
    logger.info(f"PR Details: Number={extracted_data['prNumber']}, Title={extracted_data['prTitle'][:50]}...")
    logger.info(f"Configuration: Provider={extracted_data['provider']}, InstallationId={extracted_data['installation_id']}, AnalysisId={extracted_data['pullRequestAnalysisId']}")
    logger.info(f"Files to process: {extracted_data['number_of_files']}")
    
    llm_service = ClaudeService()
    
    # Prepare summary generation with chunking strategy
    if extracted_data["prFiles"]:
        logger.info(f"Processing {len(extracted_data['prFiles'])} files for summary generation with chunking strategy")
        
        # Create chunks for summary generation
        chunks, ignored_files = create_summary_chunks(
            files=extracted_data["prFiles"],
            max_chunk_tokens=150000,  # LLM limit
            max_file_tokens=100000    # File size limit
        )
        
        if ignored_files:
            logger.warning(f"Ignored {len(ignored_files)} files for summary due to size limits")
            for ignored in ignored_files:
                logger.warning(f"  - {ignored['fileName']}: {ignored['reason']}")
        
        # Generate summaries for each chunk
        chunk_summaries = []
        total_time_estimation = 0
        total_issue_count = 0
        review_info = {}
        for chunk in chunks:
            logger.info(f"Generating summary for chunk {chunk['chunk_index'] + 1}/{len(chunks)} with {len(chunk['files'])} files")
            
            # Prepare chunk variables
            chunk_variables = prepare_chunk_for_summary(chunk, extracted_data)
            
            try:
                chunk_summary = await generate_summary_response(chunk_variables, llm_service)
                chunk_summaries.append(chunk_summary.pr_summary)
                review_info = extract_review_info(chunk_summary.pr_summary)
                logger.info(f"Review info: {review_info}")
                total_time_estimation += review_info["estimated_code_review_effort"]
                total_issue_count += review_info["potential_issue_count"]
                logger.info(f"Successfully generated summary for chunk {chunk['chunk_index'] + 1}")
            except Exception as e:
                logger.error(f"Failed to generate summary for chunk {chunk['chunk_index'] + 1}: {str(e)}")
                # Continue with other chunks
                continue
        review_info = {
            "estimated_code_review_effort": total_time_estimation,
            "potential_issue_count": total_issue_count
        }
        
        # Aggregate chunk summaries if multiple chunks
        if len(chunk_summaries) > 1:
            logger.info(f"Aggregating {len(chunk_summaries)} chunk summaries")
            try:
                
                final_summary = await aggregate_chunk_summaries(chunk_summaries, extracted_data, llm_service, review_info)
                review_info = extract_review_info(final_summary)
                logger.info(f"Review info: {review_info}")
                summary = type('Summary', (), {'pr_summary': final_summary})()
                logger.info("Successfully aggregated chunk summaries")
            except Exception as e:
                logger.error(f"Failed to aggregate summaries: {str(e)}")
                # Fallback to first chunk summary
                summary = type('Summary', (), {'pr_summary': chunk_summaries[0] if chunk_summaries else ""})()
        elif len(chunk_summaries) == 1:
            summary = type('Summary', (), {'pr_summary': chunk_summaries[0]})()
        else:
            logger.error("No summaries generated from any chunks")
            return
        
        # Prepare changed files list for backward compatibility
        changed_files = []
        for chunk in chunks:
            for file_info in chunk["files"]:
                changed_files.append(file_info["prFileName"])
        
        logger.info(f"Summary generation completed. Processed {len(changed_files)} files in {len(chunks)} chunks")
        
    else:
        logger.warning("No prFiles found in payload")
        summary = type('Summary', (), {'pr_summary': ""})()
        changed_files = []
    
    # Log summary generation completion
    logger.info("PR summary generation completed successfully")

    sumery_result=None
    review_result=[]

    # Post summary to backend
    logger.info("Posting summary to backend...")
    async with httpx.AsyncClient() as client:
        summary_payload = {
            "pullRequestAnalysisId": extracted_data["pullRequestAnalysisId"],
            "summary": summary.pr_summary,
            "modelInfo": {},
            "usageInfo": {},
            "reviewInfo": review_info
        }

        try:
            summary_post_start = time.time()
            response = await client.post(BACKEND_SUMMARY_ENDPOINT, json=summary_payload)
            summary_post_duration = time.time() - summary_post_start
            
            if response.status_code == 200:
                logger.info(f"Summary posted to backend successfully in {summary_post_duration:.2f}s")
            else:
                # Truncate response for cleaner logs
                response_text = response.text[:200] + "..." if len(response.text) > 200 else response.text
                logger.error(f"Failed to post summary. Status: {response.status_code}, Response: {response_text}")
        except Exception as e:
            logger.error(f"Exception while posting summary: {str(e)}")

    # Process reviews in batches
    logger.info("Starting review generation process...")
    async with httpx.AsyncClient() as client:
        if extracted_data["prFiles"]:
            pr_files = extracted_data["prFiles"]
            total_batches = math.ceil(extracted_data["number_of_files"] / BATCH_SIZE)
            
            logger.info(f"Processing {extracted_data['number_of_files']} files in {total_batches} batches (batch size: {BATCH_SIZE})")
            
            for batch_index in range(total_batches):
                batch_start_time = time.time()
                start_index = batch_index * BATCH_SIZE
                end_index = min(start_index + BATCH_SIZE, extracted_data["number_of_files"])
                current_batch = pr_files[start_index:end_index]
                
                logger.info(f"Processing batch {batch_index + 1}/{total_batches} (files {start_index + 1}-{end_index})")
                
                batch_comments = []
                
                # Process files in current batch
                for file_index, file_info in enumerate(current_batch):
                    file_start_time = time.time()
                    file_name = file_info["prFileName"]
                    
                    logger.info(f"Processing file {start_index + file_index + 1}/{extracted_data['number_of_files']}: {file_name}")
                    
                    review_variables = {
                        "prTitle": extracted_data["prTitle"],
                        "prBody": extracted_data["prBody"],
                        "author_name": extracted_data["author_name"],
                        "prNumber": extracted_data["prNumber"],
                        "changed_files": file_info["prFileName"],
                        "repo_structure_summary": extracted_data["repo_structure_summary"],
                        "pr_diff": file_info["prFileDiff"],
                        "prFileContentBefore": file_info.get("prFileContentBefore", "")
                    }
                                        
                    try:
                        logger.info(f"Generating review for {file_name} with LLM...")
                        llm_start_time = time.time()
                        review = await generate_review_response(review_variables, llm_service)
                        llm_duration = time.time() - llm_start_time
                        logger.info(f"LLM review generated for {file_name} in {llm_duration:.2f}s")
                        
                        logger.info(f"Parsing review response for {file_name}...")
                        parse_start_time = time.time()
                        file_comments = parse_review_response(review.pr_review_and_suggestion, file_info["prFileName"])
                        parse_duration = time.time() - parse_start_time
                        
                        logger.info(f"Parsed {len(file_comments)} comments for {file_name} in {parse_duration:.2f}s")
                        batch_comments.extend(file_comments)
                        
                        file_duration = time.time() - file_start_time
                        logger.info(f"Completed processing {file_name} in {file_duration:.2f}s")
                        
                    except Exception as e:
                        logger.error(f"Failed to process file {file_name}: {str(e)}")
                        continue
                
                # Determine if this is the last batch
                is_last_batch = batch_index == total_batches - 1
                
                review_payload = {
                    "pullRequestAnalysisId": extracted_data["pullRequestAnalysisId"],
                    "comments": batch_comments,
                    "completed": 1 if is_last_batch else 0
                }
                
                logger.info(f"Posting batch {batch_index + 1}/{total_batches} with {len(batch_comments)} comments to backend...")

                try:
                    post_start_time = time.time()
                    response = await client.post(BACKEND_REVIEW_ENDPOINT, json=review_payload)
                    post_duration = time.time() - post_start_time
                    
                    if response.status_code == 200:
                        logger.info(f"Batch {batch_index + 1} posted successfully in {post_duration:.2f}s")
                    else:
                        # Truncate response for cleaner logs
                        response_text = response.text[:200] + "..." if len(response.text) > 200 else response.text
                        logger.error(f"Failed to post batch {batch_index + 1}. Status: {response.status_code}, Response: {response_text}")
                        
                except Exception as e:
                    logger.error(f"Exception while posting batch {batch_index + 1}: {str(e)}")
                
                batch_duration = time.time() - batch_start_time
                logger.info(f"Completed batch {batch_index + 1}/{total_batches} in {batch_duration:.2f}s")
        else:
            logger.warning("No prFiles found for review processing")

    total_duration = time.time() - start_time
    logger.info(f"Background PR review process completed successfully in {total_duration:.2f}s")
    logger.info("=" * 80)

@supervisor.post("/ai_agent")
async def supervisor_pr_review(payload: PRPayloadV2, background_tasks: BackgroundTasks):
    """
    AI Agent endpoint for PR review processing.
    Validates input, responds immediately, then processes in background.
    """
    logger.info("Received PR review request")
    
    # Validate payload format
    is_valid, error_message, extracted_data = validate_pr_payload(payload)
    
    if not is_valid:
        logger.error(f"Payload validation failed: {error_message}")
        return {
            "status": "error", 
            "message": f"Invalid payload format: {error_message}"
        }
    
    # Log successful validation
    logger.info(f"Payload validation successful for PR #{extracted_data['prNumber']}")
    logger.info(f"Scheduling background processing for {extracted_data['number_of_files']} files")
    
    # Add background task for processing
    background_tasks.add_task(process_pr_review_background, extracted_data)
    
    # Return immediate response
    logger.info("Sending immediate response: Data received, review in progress")
    return {
        "status": "accepted",
        "message": "Data received, review in progress",
        "pullRequestAnalysisId": extracted_data["pullRequestAnalysisId"],
        "prNumber": extracted_data["prNumber"],
        "filesCount": extracted_data["number_of_files"]
    }
    