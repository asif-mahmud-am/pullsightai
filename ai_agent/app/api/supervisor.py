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

load_dotenv()

supervisor = APIRouter(prefix="", tags=["Supervisor"])

# Get backend base URL from environment variable
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://backend")
BACKEND_REVIEW_ENDPOINT = os.getenv("BACKEND_REVIEW_ENDPOINT", "http://backend/reviews")
BACKEND_SUMMARY_ENDPOINT = os.getenv("BACKEND_SUMMARY_ENDPOINT", "http://backend/summary")

def get_backend_url(provider: str, endpoint: Literal["summary", "reviews"]) -> str:
    provider = provider.lower()
    if provider not in ["github", "gitlab", "bitbucket"]:
        provider = "github"  # Default fallback
    return f"{BACKEND_BASE_URL}/v1/{provider}/{endpoint}"

@supervisor.post("/ai_agent")
async def supervisor_pr_review(payload: PRPayloadV2, background_tasks: BackgroundTasks):
    llm_service = ClaudeService()
    pr = payload.pullRequest

    provider = pr.get("provider", "unknown")
    installation_id = pr.get("installationId", "0")
    pullRequestAnalysisId = pr.get("pullRequestAnalysisId", "0")
        

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
            "pullRequestAnalysisId": pullRequestAnalysisId,
            "summary": summary.pr_summary,
            "modelInfo": {},
            "usageInfo": {}
        }

        await client.post(BACKEND_SUMMARY_ENDPOINT, json=summary_payload)

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
            "pullRequestAnalysisId": pullRequestAnalysisId,
            "comments": all_comments,
        }

        await client.post(BACKEND_REVIEW_ENDPOINT, json=review_payload)
    

    return {"status": "completed"}
