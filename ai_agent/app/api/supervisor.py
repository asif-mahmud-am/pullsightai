from fastapi import APIRouter, Request, BackgroundTasks
from app.models.pr_event import PRPayloadV2, PRFileInfo
from app.api.summary import generate_summary_response
from app.api.review import generate_review_response
from app.services.claude_service import ClaudeService
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

@supervisor.post("/ai_agent")
async def supervisor_pr_review(payload: PRPayloadV2, background_tasks: BackgroundTasks):
    start_time = time.time()
    
    logger.info("=" * 80)
    logger.info("Starting PR review process")
    
    llm_service = ClaudeService()
    pr = payload.pullRequest

    if pr:
        logger.info("Received PR payload successfully")
        logger.info(f"PR Details: Number={pr.get('prNumber')}, Title={pr.get('prTitle', '')[:50]}...")
    else:
        logger.error("No PR data in payload")
        return {"status": "error", "message": "No PR data found"}

    provider = pr.get("provider", "unknown")
    installation_id = pr.get("installationId", "0")
    pullRequestAnalysisId = pr.get("pullRequestAnalysisId", "0")
    number_of_files = pr.get("prFilesChanged", 0)
    
    logger.info(f"Configuration: Provider={provider}, InstallationId={installation_id}, AnalysisId={pullRequestAnalysisId}")
    logger.info(f"Files to process: {number_of_files}")

    prNumber = pr["prNumber"]
    prTitle = pr["prTitle"]
    prBody = pr.get("prBody", "")
    author_name = pr.get("prUser", "")
    repo_structure_summary = pr.get("prRepoName", "")

    changed_files = []
    pr_diff = ""

    if "prFiles" in pr and isinstance(pr["prFiles"], list):
        logger.info(f"Processing {len(pr['prFiles'])} files for diff generation")
        for file_info in pr["prFiles"]:
            changed_files.append(file_info["prFileName"])
            pr_diff += f"\n\n--- File: {file_info['prFileName']} ---\n{file_info['prFileDiff']}"
        logger.info(f"Generated unified diff for files: {', '.join(changed_files)}")
    else:
        logger.warning("No prFiles found in payload")

    # Prepare summary variables
    summary_variables = {
        "prTitle": prTitle,
        "prBody": prBody,
        "author_name": author_name,
        "prNumber": prNumber,
        "changed_files": ", ".join(changed_files),
        "repo_structure_summary": repo_structure_summary,
        "pr_diff": pr_diff
    }
    
    logger.info("Generating PR summary with LLM...")
    logger.debug(f"Summary variables: {json.dumps({k: str(v)[:100] + '...' if len(str(v)) > 100 else v for k, v in summary_variables.items()}, indent=2)}")
    
    summary_start_time = time.time()
    try:
        summary = await generate_summary_response(summary_variables, llm_service)
        summary_duration = time.time() - summary_start_time
        logger.info(f"LLM summary generated successfully in {summary_duration:.2f}s")
    except Exception as e:
        logger.error(f"Failed to generate summary: {str(e)}")
        return {"status": "error", "message": f"Summary generation failed: {str(e)}"}

    # Post summary to backend
    logger.info("Posting summary to backend...")
    async with httpx.AsyncClient() as client:
        summary_payload = {
            "pullRequestAnalysisId": pullRequestAnalysisId,
            "summary": summary.pr_summary,
            "modelInfo": {},
            "usageInfo": {}
        }

        try:
            summary_post_start = time.time()
            response = await client.post(BACKEND_SUMMARY_ENDPOINT, json=summary_payload)
            summary_post_duration = time.time() - summary_post_start
            
            if response.status_code == 200:
                logger.info(f"Summary posted to backend successfully in {summary_post_duration:.2f}s")
            else:
                logger.error(f"Failed to post summary. Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            logger.error(f"Exception while posting summary: {str(e)}")

    # Process reviews in batches
    logger.info("Starting review generation process...")
    async with httpx.AsyncClient() as client:
        if "prFiles" in pr and isinstance(pr["prFiles"], list):
            pr_files = pr["prFiles"]
            total_batches = math.ceil(number_of_files / BATCH_SIZE)
            
            logger.info(f"Processing {number_of_files} files in {total_batches} batches (batch size: {BATCH_SIZE})")
            
            for batch_index in range(total_batches):
                batch_start_time = time.time()
                start_index = batch_index * BATCH_SIZE
                end_index = min(start_index + BATCH_SIZE, number_of_files)
                current_batch = pr_files[start_index:end_index]
                
                logger.info(f"Processing batch {batch_index + 1}/{total_batches} (files {start_index + 1}-{end_index})")
                
                batch_comments = []
                
                # Process files in current batch
                for file_index, file_info in enumerate(current_batch):
                    file_start_time = time.time()
                    file_name = file_info["prFileName"]
                    
                    logger.info(f"Processing file {start_index + file_index + 1}/{number_of_files}: {file_name}")
                    
                    review_variables = {
                        "prTitle": prTitle,
                        "prBody": prBody,
                        "author_name": author_name,
                        "prNumber": prNumber,
                        "changed_files": file_info["prFileName"],
                        "repo_structure_summary": repo_structure_summary,
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
                    "pullRequestAnalysisId": pullRequestAnalysisId,
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
                        logger.error(f"Failed to post batch {batch_index + 1}. Status: {response.status_code}, Response: {response.text}")
                        
                except Exception as e:
                    logger.error(f"Exception while posting batch {batch_index + 1}: {str(e)}")
                
                batch_duration = time.time() - batch_start_time
                logger.info(f"Completed batch {batch_index + 1}/{total_batches} in {batch_duration:.2f}s")
        else:
            logger.warning("No prFiles found for review processing")

    total_duration = time.time() - start_time
    logger.info(f"PR review process completed successfully in {total_duration:.2f}s")
    logger.info("=" * 80)
    
    return {"status": "completed"}