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

supervisor = APIRouter(prefix="", tags=["Supervisor"])

# These should be set to the backend endpoints for posting summary and review results
BACKEND_SUMMARY_ENDPOINT = os.getenv("BACKEND_SUMMARY_ENDPOINT", "http://backend/v1/github/summary")
BACKEND_REVIEW_ENDPOINT = os.getenv("BACKEND_REVIEW_ENDPOINT", "http://backend/v1/github/reviews")


@supervisor.post("/ai_agent")
async def supervisor_pr_review(payload: PRPayloadV2, background_tasks: BackgroundTasks):
    llm_service = ClaudeService()
    pr = payload.pull_request
    print("Input PR", pr)
    
    # Parse the new PR data structure
    pr_number = pr["pr_number"]
    pr_title = pr["pr_title"]
    pr_description = pr.get("pr_body", "")
    author_name = pr.get("pr_user", "")
    repo_structure_summary = pr.get("pr_repo_name", "")
    
    # Handle the new file structure where pr_files is a list of file objects
    changed_files = []
    pr_diff = ""
    
    if "pr_files" in pr and isinstance(pr["pr_files"], list):
        # New structure: pr_files is a list of file objects
        for file_info in pr["pr_files"]:
            changed_files.append(file_info["pr_file_name"])
            pr_diff += f"\n\n--- File: {file_info['pr_file_name']} ---\n{file_info['pr_file_diff']}"
    else:
        # Fallback for old structure: pr_files as dictionary
        changed_files = list(pr.get("pr_files", {}).keys())
        pr_diff = "\n\n".join([
            file_info[f"{file_key}_diff"]
            for file_key, file_info in pr.get("pr_files", {}).items()
        ])

    summary_variables = {
        "pr_title": pr_title,
        "pr_description": pr_description,
        "author_name": author_name,
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
            "prNumber": pr_number,
            "body": summary.pr_summary,
            "installationId": int(pr.get("installationId", "0"))
        }
        await client.post(BACKEND_SUMMARY_ENDPOINT, json=summary_payload)
        
        # Format reviews for the new endpoint structure
        all_comments = []
        
        if "pr_files" in pr and isinstance(pr["pr_files"], list):
            # New structure: process each file object in the list
            for file_info in pr["pr_files"]:
                review_variables = {
                    "pr_title": pr_title,
                    "pr_description": pr_description,
                    "author_name": author_name,
                    "changed_files": file_info["pr_file_name"],
                    "repo_structure_summary": repo_structure_summary,
                    "pr_diff": file_info["pr_file_diff"]
                }
                review = await generate_review_response(review_variables, llm_service)
                
                # Parse the review response to extract line-specific comments
                file_comments = parse_review_response(review.pr_review_and_suggestion, file_info["pr_file_name"])
                all_comments.extend(file_comments)
        else:
            # Fallback for old structure
            for file_key, file_info in pr.get("pr_files", {}).items():
                review_variables = {
                    "pr_title": pr_title,
                    "pr_description": pr_description,
                    "author_name": author_name,
                    "changed_files": file_info[f"{file_key}_name"],
                    "repo_structure_summary": repo_structure_summary,
                    "pr_diff": file_info[f"{file_key}_diff"]
                }
                review = await generate_review_response(review_variables, llm_service)
                
                # Parse the review response to extract line-specific comments
                file_comments = parse_review_response(review.pr_review_and_suggestion, file_info[f"{file_key}_name"])
                all_comments.extend(file_comments)
        
        # Send review comments in the new format
        review_payload = {
            "owner": pr.get("owner", ""),
            "repo": pr.get("repo", ""),
            "prNumber": pr_number,
            "comments": all_comments,
            "installationId": int(pr.get("installationId", "0"))
        }
        print(review_payload)
        await client.post(BACKEND_REVIEW_ENDPOINT, json=review_payload)
    return {"status": "completed"} 

@supervisor.post("/agent")
async def agent_summary_and_review(payload: PRPayloadV2):
    llm_service = ClaudeService()
    pr = payload.pull_request

    pr_number = pr["pr_number"]
    pr_title = pr["pr_title"]
    pr_description = pr.get("pr_body", "")
    author_name = pr.get("pr_user", "")
    repo_structure_summary = pr.get("pr_repo_name", "")

    changed_files = []
    pr_diff = ""

    if "pr_files" in pr and isinstance(pr["pr_files"], list):
        for file_info in pr["pr_files"]:
            changed_files.append(file_info["pr_file_name"])
            pr_diff += f"\n\n--- File: {file_info['pr_file_name']} ---\n{file_info['pr_file_diff']}"
    else:
        changed_files = list(pr.get("pr_files", {}).keys())
        pr_diff = "\n\n".join([
            file_info[f"{file_key}_diff"]
            for file_key, file_info in pr.get("pr_files", {}).items()
        ])

    summary_variables = {
        "pr_title": pr_title,
        "pr_description": pr_description,
        "author_name": author_name,
        "changed_files": ", ".join(changed_files),
        "repo_structure_summary": repo_structure_summary,
        "pr_diff": pr_diff
    }
    summary = await generate_summary_response(summary_variables, llm_service)

    all_comments = []

    if "pr_files" in pr and isinstance(pr["pr_files"], list):
        for file_info in pr["pr_files"]:
            review_variables = {
                "pr_title": pr_title,
                "pr_description": pr_description,
                "author_name": author_name,
                "changed_files": file_info["pr_file_name"],
                "repo_structure_summary": repo_structure_summary,
                "pr_diff": file_info["pr_file_diff"]
            }
            review = await generate_review_response(review_variables, llm_service)
            file_comments = parse_review_response_ui(review.pr_review_and_suggestion, file_info["pr_file_name"])
            all_comments.extend(file_comments)
    else:
        for file_key, file_info in pr.get("pr_files", {}).items():
            review_variables = {
                "pr_title": pr_title,
                "pr_description": pr_description,
                "author_name": author_name,
                "changed_files": file_info[f"{file_key}_name"],
                "repo_structure_summary": repo_structure_summary,
                "pr_diff": file_info[f"{file_key}_diff"]
            }
            review = await generate_review_response(review_variables, llm_service)
            file_comments = parse_review_response(review.pr_review_and_suggestion, file_info[f"{file_key}_name"])
            all_comments.extend(file_comments)

    response_payload = {
        "owner": pr.get("owner", ""),
        "repo": pr.get("repo", ""),
        "prNumber": pr_number,
        "installationId": int(pr.get("installationId", "0")),
        "analysis": {
            "summary": summary.pr_summary,
            "comments": all_comments
        }
    }

    return response_payload