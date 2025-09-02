from anthropic import AsyncAnthropic
from config.settings import settings
from app.services.llm_base import BaseLLMService
import json

class ClaudeService(BaseLLMService):
    """
    Claude LLM service for PR summary and code review generation.
    Implements the BaseLLMService interface for easy swapping.
    """
    def __init__(self, api_key=None):
        self.client = AsyncAnthropic(api_key=api_key or settings.CLAUDE_API_KEY)
        self.model_name = "claude-opus-4-1-20250805"  # Default model

    async def generate_pr_summary(self, prompt: str, model_name: str) -> str:
        summary_usage = {}
        if model_name is None:
            model_name = self.model_name
        try:
            response = await self.client.messages.create(
                model=model_name,
                max_tokens=5000,
                temperature=0.5,
                system="You are a code review assistant. Summarize the pull request for a developer audience.",
                messages=[{"role": "user", "content": prompt}]
            )
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
            summary_usage = {"input_tokens": input_tokens, "output_tokens": output_tokens}
            model_info = response.model
            print("Summary Usage:", summary_usage)
            text = response.content[0].text if response.content else "No summary generated."
            
            return text, summary_usage, model_info
        except Exception as e:
            print(f"Error calling Claude API for summary: {e}")
            return "Could not generate PR summary."

    async def generate_code_review(self, prompt: str, model_name: str) -> str:
        review_usage = {}
        if model_name is None:
            model_name = self.model_name
        try:
            # Prompt-only approach: ask Claude to return ONLY a JSON array of review items
            response = await self.client.messages.create(
                model=model_name,
                max_tokens=5000,
                temperature=0.3,
                system=(
                    "You are a code review assistant. Provide actionable, line-by-line feedback on code changes. "
                    "Output must be ONLY a JSON array (no prose) with items containing: lineStart, lineEnd, issue, "
                    "codeSnippet, codeSnippetLineStart, severity, category, suggestion."
                ),
                messages=[{"role": "user", "content": prompt}],
            )
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
            review_usage = {"input_tokens": input_tokens, "output_tokens": output_tokens}
            model_info = response.model

            print("Review Usage:", review_usage)

            # Concatenate all text blocks
            text = "".join(
                [getattr(b, "text", "") for b in response.content if getattr(b, "type", "") == "text"]
            ).strip()

            # Try to parse as JSON directly; if it succeeds and is a list, wrap in code fence
            try:
                parsed = json.loads(text)
                if isinstance(parsed, list):
                    return f"```json\n{json.dumps(parsed, ensure_ascii=False)}\n```", review_usage, model_info
            except Exception:
                pass

            # If the text already contains a fenced JSON array, keep it as-is; otherwise extract the first array
            if text.startswith("```json") and text.rstrip().endswith("```"):
                return text, review_usage, model_info

            # Extract the first JSON array substring as a fallback
            import re
            match = re.search(r"\[.*\]", text, flags=re.DOTALL)
            if match:
                array_str = match.group(0)
                try:
                    json.loads(array_str)  # validate
                    return f"```json\n{array_str}\n```", review_usage, model_info
                except Exception:
                    pass

            # Last resort: return an empty JSON array in a code fence
            return "```json\n[]\n```", review_usage, model_info
        except Exception as e:
            print(f"Error calling Claude API for review: {e}")
            return "Could not perform code review."