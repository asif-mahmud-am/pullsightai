import json 
import re 
from typing import List, Dict


def parse_review_response(review_text: str, file_name: str):
    """
    Parse the review response to extract individual line reviews.
    The review text contains JSON embedded in markdown code blocks.
    """
    comments = []
    
    # Extract JSON from markdown code blocks
    json_match = re.search(r'```json\s*(\[.*?\])\s*```', review_text, re.DOTALL)
    if json_match:
        try:
            review_items = json.loads(json_match.group(1))
            
            for item in review_items:
                # Create a clean comment body for each line review
                comment_body = f"**{item.get('severity', 'Medium')} - {item.get('category', 'Issue')}**\n\n"
                comment_body += f"**Issue:** {item.get('issue', '')}\n\n"
                comment_body += f"**Suggestion:**\n{item.get('suggestion', '')}"
                
                comments.append({
                    "path": file_name,
                    "line": item.get('line', 1),
                    "body": comment_body
                })
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON from review response: {e}")
            # Fallback: create a single comment with the full review text
            comments.append({
                "path": file_name,
                "line": 1,
                "body": review_text
            })
    else:
        # If no JSON found, create a single comment with the full review text
        comments.append({
            "path": file_name,
            "line": 1,
            "body": review_text
        })
    
    return comments


def parse_review_response_ui(review_text: str, file_name: str):
    """
    Parse the review response to extract individual line reviews.
    The review text contains JSON embedded in markdown code blocks.
    Returns a list of structured comments with separate keys.
    """
    comments = []

    # Extract JSON array from markdown code block
    json_match = re.search(r'```json\s*(\[.*?\])\s*```', review_text, re.DOTALL)
    if json_match:
        try:
            review_items = json.loads(json_match.group(1))

            for item in review_items:
                comments.append({
                    "path": file_name,
                    "line": item.get("line", 1),
                    "severity": item.get("severity", "Medium"),
                    "category": item.get("category", "Issue"),
                    "issue": item.get("issue", ""),
                    "suggestion": item.get("suggestion", "")
                })
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON from review response: {e}")
            # Fallback to single unstructured comment
            comments.append({
                "path": file_name,
                "line": 1,
                "severity": "Unknown",
                "category": "Parsing Error",
                "issue": "Could not parse structured JSON from review response.",
                "suggestion": review_text
            })
    else:
        # Fallback if no structured JSON block is found
        comments.append({
            "path": file_name,
            "line": 1,
            "severity": "Unknown",
            "category": "Unstructured",
            "issue": "Review response did not contain structured data.",
            "suggestion": review_text
        })

    return comments