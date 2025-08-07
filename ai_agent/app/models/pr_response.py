from pydantic import BaseModel
from typing import Any

class PRSummaryResponse(BaseModel):
    prNumber: str
    pr_line: int
    pr_summary: str

class PRReviewResponse(BaseModel):
    prNumber: str
    pr_line: int
    pr_review_and_suggestion: str 