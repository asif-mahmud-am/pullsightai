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
from typing import Literal
from dotenv import load_dotenv

load_dotenv()

supervisor = APIRouter(prefix="", tags=["Supervisor"])

# Get backend base URL from environment variable
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://backend")

def get_backend_url(provider: str, endpoint: Literal["summary", "reviews"]) -> str:
    provider = provider.lower()
    if provider not in ["github", "gitlab", "bitbucket"]:
        provider = "github"  # Default fallback
    return f"{BACKEND_BASE_URL}/v1/{provider}/{endpoint}"

@supervisor.post("/ai_agent")
async def supervisor_pr_review(payload: PRPayloadV2, background_tasks: BackgroundTasks):
    llm_service = ClaudeService()
    pr = payload.pullRequest
    print("Input PR", pr)

    provider = pr.get("provider", "unknown")
    installation_id = pr.get("installationId", "0")

    try:
        installation_id_int = int(installation_id)
    except (ValueError, TypeError):
        installation_id_int = 0
        

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

    async with httpx.AsyncClient() as client:
        summary_payload = {
            "owner": pr.get("owner", ""),
            "repo": pr.get("repo", ""),
            "prNumber": prNumber,
            "provider": provider,
            "body": summary.pr_summary,
            "installationId": installation_id_int
        }

        summary_url = get_backend_url(provider, "summary")
        await client.post(summary_url, json=summary_payload)

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
                file_comments = parse_review_response(review.pr_review_and_suggestion, file_info["prFileName"])
                all_comments.extend(file_comments)

        review_payload = {
            "owner": pr.get("owner", ""),
            "repo": pr.get("repo", ""),
            "prNumber": prNumber,
            "provider": provider,
            "comments": all_comments,
            "installationId": installation_id_int
        }

        print(review_payload)
        review_url = get_backend_url(provider, "reviews")
        await client.post(review_url, json=review_payload)

    return {"status": "completed"}

@supervisor.post("/agent")
async def agent_summary_and_review(payload: PRPayloadV2):
    llm_service = ClaudeService()
    pr = payload.pullRequest

    print("Agent endpoint - Input PR structure:", pr.keys())
    print("Agent endpoint - prFiles type:", type(pr.get("prFiles")))
    if "prFiles" in pr:
        print("Agent endpoint - prFiles length:", len(pr["prFiles"]) if isinstance(pr["prFiles"], list) else "Not a list")

    provider = pr.get("provider", "unknown")
    installation_id = pr.get("installationId", "0")

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


    return response_payload
