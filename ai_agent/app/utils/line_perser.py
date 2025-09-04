import re

def extract_summary_info(text: str) -> dict:
    result = {}
    
    effort_match = re.search(
        r"⏱️\s*~\s*(\d+)\s*minutes?", text, re.IGNORECASE
    )
    if effort_match:
        result["estimated_code_review_time"] = int(effort_match.group(1))
    
    issue_match = re.search(
        r"⚠️\s*~\s*(\d+)\s*issues?", text, re.IGNORECASE
    )
    if issue_match:
        result["potential_issue_count"] = int(issue_match.group(1))
    
    return result