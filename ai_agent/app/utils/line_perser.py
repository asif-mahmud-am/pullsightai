import re

def extract_review_info(text: str) -> dict:
    result = {}
    
    # Extract estimated code review effort (robust: handles ~, minutes, etc.)
    effort_match = re.search(
        r"Estimated code review time[^0-9]*(\d+)", text, re.IGNORECASE
    )
    if effort_match:
        result["estimated_code_review_time"] = int(effort_match.group(1))
    
    # Extract potential issue count (robust: handles ~, issues, etc.)
    issue_match = re.search(
        r"Potential issues[^0-9]*(\d+)", text, re.IGNORECASE
    )
    if issue_match:
        result["potential_issue_count"] = int(issue_match.group(1))
    
    return result
