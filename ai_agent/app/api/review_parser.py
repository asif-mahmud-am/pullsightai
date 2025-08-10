import json 
import re 
from typing import List, Dict



def parse_review_response(review_text: str, file_name: str):
    """
    Parse LLM review output to the UI-ready Comments format.

    Expected input may be:
    - a raw JSON array string
    - a JSON array inside a ```json ... ``` code fence
    - a larger text containing a JSON array substring

    Output items schema (per comment):
    {
        "filePath": str,
        "lineStart": int,
        "lineEnd": Optional[int],
        "content": str,
        "codeSnippet": Optional[str],
        "codeSnippetLineStart": Optional[int],
        "severity": str,
        "metadata": Dict,
        "category": str,
    }
    """
    text = (review_text or "").strip()

    review_items: List[Dict] = []

    # Try 1: parse direct JSON
    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            review_items = parsed
    except Exception:
        pass

    # Try 2: fenced JSON
    if not review_items:
        fenced_match = re.search(r"```json\s*(\[.*?\])\s*```", text, flags=re.DOTALL | re.IGNORECASE)
        if fenced_match:
            array_str = fenced_match.group(1)
            try:
                parsed = json.loads(array_str)
                if isinstance(parsed, list):
                    review_items = parsed
            except Exception:
                pass

    # Try 3: first JSON array substring
    if not review_items:
        array_match = re.search(r"\[.*\]", text, flags=re.DOTALL)
        if array_match:
            array_str = array_match.group(0)
            try:
                parsed = json.loads(array_str)
                if isinstance(parsed, list):
                    review_items = parsed
            except Exception:
                pass

    # If still nothing, return empty to avoid posting junk
    if not review_items:
        return []

    comments: List[Dict] = []
    for item in review_items:
        if not isinstance(item, dict):
            continue

        severity = item.get("severity", "Medium")
        category = item.get("category", "Issue")
        line_start = int(item.get("line", item.get("lineStart", 1)) or 1)
        line_end = item.get("lineEnd")
        if isinstance(line_end, str):
            try:
                line_end = int(line_end)
            except Exception:
                line_end = None

        # Build content combining issue and suggestion when available
        issue_text = item.get("issue", "")
        suggestion_text = item.get("suggestion", "")
        if issue_text or suggestion_text:
            content = f"**Issue**: {issue_text}\n\n**Suggestion**: {suggestion_text}".strip()
        else:
            # Fallback: stringify the whole item
            content = json.dumps(item, ensure_ascii=False)

        comment: Dict = {
            "filePath": file_name,
            "lineStart": line_start,
            "lineEnd": line_end if isinstance(line_end, int) else None,
            "content": content,
            "codeSnippet": item.get("codeSnippet"),
            "codeSnippetLineStart": item.get("codeSnippetLineStart"),
            "severity": severity,
            "metadata": item.get("metadata", {}),
            "category": category,
        }

        comments.append(comment)

    return comments