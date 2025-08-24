import re
def extract_diff_info_from_text(text):
    """
    Extract diff header information from a larger text containing diff content.
    
    Args:
        text (str): Text containing diff content
        
    Returns:
        list: List of dictionaries with deleted/added line information
    """
    # Regex pattern to find all diff headers in the text
    pattern = r'@@\s*-(\d+),(\d+)\s*\+(\d+),(\d+)\s*@@'
    
    results = []
    for match in re.finditer(pattern, text):
        old_start, old_count, new_start, new_count = map(int, match.groups())
        
        results.append({
            'deleted': f"{old_start},{old_count}",
            'added': f"{new_start},{new_count}"
        })
    
    return results



def extract_review_info(text: str) -> dict:
    result = {}
    
    # Extract estimated code review effort (robust: handles ~, minutes, etc.)
    effort_match = re.search(
        r"Estimated code review time[^0-9]*(\d+)", text, re.IGNORECASE
    )
    if effort_match:
        result["estimated_code_review_effort"] = int(effort_match.group(1))
    
    # Extract potential issue count (robust: handles ~, issues, etc.)
    issue_match = re.search(
        r"Potential issues[^0-9]*(\d+)", text, re.IGNORECASE
    )
    if issue_match:
        result["potential_issue_count"] = int(issue_match.group(1))
    
    return result
