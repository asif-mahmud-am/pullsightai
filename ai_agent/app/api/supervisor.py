from fastapi import APIRouter, Request, BackgroundTasks
from app.models.pr_event import PRPayloadV2, PRFileInfo
from app.api.summary import generate_summary_response
from app.api.review import generate_review_response
from app.services.claude_service import ClaudeService
import httpx
import os
import json
import re
from app.api.review_parser import parse_review_response, parse_review_response_ui
import json 

supervisor = APIRouter(prefix="", tags=["Supervisor"])

# These should be set to the backend endpoints for posting summary and review results
BACKEND_SUMMARY_ENDPOINT = os.getenv("BACKEND_SUMMARY_ENDPOINT", "http://backend/v1/github/summary")
BACKEND_REVIEW_ENDPOINT = os.getenv("BACKEND_REVIEW_ENDPOINT", "http://backend/v1/github/reviews")


@supervisor.post("/ai_agent")
async def supervisor_pr_review(payload: PRPayloadV2, background_tasks: BackgroundTasks):
    llm_service = ClaudeService()
    pr = payload.pullRequest  # Changed from pull_request to pullRequest
    print("Input PR", pr)
    
    # Extract provider and handle installationId properly
    provider = pr.get("provider", "unknown")
    installation_id = pr.get("installationId", "0")
    
    # Try to convert installationId to int, but handle string values gracefully
    try:
        installation_id_int = int(installation_id)
    except (ValueError, TypeError):
        installation_id_int = 0
        print(f"Warning: Could not convert installationId '{installation_id}' to integer, using 0")
    
    # Parse the new PR data structure
    prNumber = pr["prNumber"]
    prTitle = pr["prTitle"]
    prBody = pr.get("prBody", "")
    author_name = pr.get("prUser", "")
    repo_structure_summary = pr.get("prRepoName", "")
    
    # Handle the new file structure where prFiles is a list of file objects
    changed_files = []
    pr_diff = ""
    
    if "prFiles" in pr and isinstance(pr["prFiles"], list):
        # New structure: prFiles is a list of file objects
        for file_info in pr["prFiles"]:
            changed_files.append(file_info["prFileName"])
            pr_diff += f"\n\n--- File: {file_info['prFileName']} ---\n{file_info['prFileDiff']}"

    summary_variables = {
        "prTitle": prTitle,
        "prBody": prBody,
        "author_name": author_name,
        "prNumber": prNumber,
        "changed_files": ", ".join(changed_files),
        "repo_structure_summary": repo_structure_summary,
        "pr_diff": pr_diff
    }
    summary = await generate_summary_response(summary_variables, llm_service)
    async with httpx.AsyncClient() as client:
        # Send summary in the new format
        summary_payload = {
            "owner": pr.get("owner", ""),
            "repo": pr.get("repo", ""),
            "prNumber": prNumber,
            "provider": provider,
            "body": summary.pr_summary,
            "installationId": installation_id_int
        }

        await client.post(BACKEND_SUMMARY_ENDPOINT, json=summary_payload)
        
        # Format reviews for the new endpoint structure
        all_comments = []
        
        if "prFiles" in pr and isinstance(pr["prFiles"], list):
            # New structure: process each file object in the list
            for file_info in pr["prFiles"]:
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
                review = await generate_review_response(review_variables, llm_service)
                
                # Parse the review response to extract line-specific comments
                file_comments = parse_review_response(review.pr_review_and_suggestion, file_info["prFileName"])
                all_comments.extend(file_comments)
        
        # Send review comments in the new format
        review_payload = {
            "owner": pr.get("owner", ""),
            "repo": pr.get("repo", ""),
            "prNumber": prNumber,
            "provider": provider,
            "comments": all_comments,
            "installationId": installation_id_int
        }
        print(review_payload)

        await client.post(BACKEND_REVIEW_ENDPOINT, json=review_payload)
    return {"status": "completed"} 

@supervisor.post("/agent")
async def agent_summary_and_review(payload: PRPayloadV2):
    llm_service = ClaudeService()
    pr = payload.pullRequest  # Changed from pull_request to pullRequest
    
    print("Agent endpoint - Input PR structure:", pr.keys())
    print("Agent endpoint - prFiles type:", type(pr.get("prFiles")))
    if "prFiles" in pr:
        print("Agent endpoint - prFiles length:", len(pr["prFiles"]) if isinstance(pr["prFiles"], list) else "Not a list")

    # Extract provider and handle installationId properly
    provider = pr.get("provider", "unknown")
    installation_id = pr.get("installationId", "0")
    
    # Try to convert installationId to int, but handle string values gracefully
    try:
        installation_id_int = int(installation_id)
    except (ValueError, TypeError):
        installation_id_int = 0
        print(f"Warning: Could not convert installationId '{installation_id}' to integer, using 0")

    prNumber = pr["prNumber"]
    prTitle = pr["prTitle"]
    prBody = pr.get("prBody", "")
    author_name = pr.get("prUser", "")
    repo_structure_summary = pr.get("prRepoName", "")

    changed_files = []
    pr_diff = ""

    if "prFiles" in pr and isinstance(pr["prFiles"], list):
        for file_info in pr["prFiles"]:
            changed_files.append(file_info["prFileName"])
            pr_diff += f"\n\n--- File: {file_info['prFileName']} ---\n{file_info['prFileDiff']}"


    summary_variables = {
        "prTitle": prTitle,
        "prBody": prBody,
        "author_name": author_name,
        "prNumber": prNumber,
        "changed_files": ", ".join(changed_files),
        "repo_structure_summary": repo_structure_summary,
        "pr_diff": pr_diff
    }
    summary = await generate_summary_response(summary_variables, llm_service)

    all_comments = []

    if "prFiles" in pr and isinstance(pr["prFiles"], list):
        for file_info in pr["prFiles"]:
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
            review = await generate_review_response(review_variables, llm_service)
            print(f"Agent endpoint - Generated review for {file_info['prFileName']}:", review.pr_review_and_suggestion[:200] + "..." if len(review.pr_review_and_suggestion) > 200 else review.pr_review_and_suggestion)
            file_comments = parse_review_response_ui(review.pr_review_and_suggestion, file_info["prFileName"])
            print(f"Agent endpoint - Parsed comments for {file_info['prFileName']}:", len(file_comments), "comments")
            all_comments.extend(file_comments)

    response_payload = {
        "owner": pr.get("owner", ""),
        "repo": pr.get("repo", ""),
        "prNumber": prNumber,
        "provider": provider,
        "installationId": installation_id_int,
        "analysis": {
            "summary": summary.pr_summary,
            "comments": all_comments
        }
    }

    print("Agent endpoint - Final response payload:", response_payload)
    print("Agent endpoint - Total comments generated:", len(all_comments))

    return response_payload