from anthropic import AsyncAnthropic
from config.settings import settings
from app.services.llm_base import BaseLLMService
import json

class ClaudeService(BaseLLMService):
    """
    Claude LLM service for PR summary and code review generation.
    Implements the BaseLLMService interface for easy swapping.
    """
    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.CLAUDE_API_KEY)

    async def generate_pr_summary(self, prompt: str) -> str:
        try:
            response = await self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=5000,
                temperature=0.5,
                system="You are a code review assistant. Summarize the pull request for a developer audience.",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text if response.content else "No summary generated."
        except Exception as e:
            print(f"Error calling Claude API for summary: {e}")
            return "Could not generate PR summary."

    async def generate_code_review(self, prompt: str) -> str:
        try:
            # Prompt-only approach: ask Claude to return ONLY a JSON array of review items
            response = await self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2048,
                temperature=0.2,
                system=(
                    "You are a code review assistant. Provide actionable, line-by-line feedback on code changes. "
                    "Output must be ONLY a JSON array (no prose) with items containing: lineStart, lineEnd, issue, "
                    "codeSnippet, codeSnippetLineStart, severity, category, suggestion."
                ),
                messages=[{"role": "user", "content": prompt}],
            )

            # Concatenate all text blocks
            text = "".join(
                [getattr(b, "text", "") for b in response.content if getattr(b, "type", "") == "text"]
            ).strip()

            # Try to parse as JSON directly; if it succeeds and is a list, wrap in code fence
            try:
                parsed = json.loads(text)
                if isinstance(parsed, list):
                    return f"```json\n{json.dumps(parsed, ensure_ascii=False)}\n```"
            except Exception:
                pass

            # If the text already contains a fenced JSON array, keep it as-is; otherwise extract the first array
            if text.startswith("```json") and text.rstrip().endswith("```"):
                return text

            # Extract the first JSON array substring as a fallback
            import re
            match = re.search(r"\[.*\]", text, flags=re.DOTALL)
            if match:
                array_str = match.group(0)
                try:
                    json.loads(array_str)  # validate
                    return f"```json\n{array_str}\n```"
                except Exception:
                    pass

            # Last resort: return an empty JSON array in a code fence
            return "```json\n[]\n```"
        except Exception as e:
            print(f"Error calling Claude API for review: {e}")
            return "Could not perform code review."