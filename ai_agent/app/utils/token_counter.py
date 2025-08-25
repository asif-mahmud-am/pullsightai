import tiktoken
import logging

logger = logging.getLogger(__name__)

def count_tokens(text: str, model: str = "claude-3-sonnet-20240229") -> int:
    """
    Count the number of tokens in a text string.
    
    Args:
        text (str): The text to count tokens for
        model (str): The model name to use for tokenization (default: claude-3-sonnet-20240229)
    
    Returns:
        int: The number of tokens
    """
    try:
        # Use cl100k_base encoding which is compatible with Claude models
        encoding = tiktoken.get_encoding("cl100k_base")
        tokens = encoding.encode(text)
        return len(tokens)
    except Exception as e:
        logger.error(f"Error counting tokens: {str(e)}")
        # Fallback: rough estimation (1 token ≈ 4 characters for English text)
        return len(text) // 4

def estimate_tokens_for_file(file_diff: str) -> int:
    """
    Estimate the number of tokens for a file diff.
    
    Args:
        file_diff (str): The file diff content
    
    Returns:
        int: Estimated token count
    """
    return count_tokens(file_diff)

def is_file_too_large(file_diff: str, max_tokens: int = 100000) -> bool:
    """
    Check if a file diff is too large (exceeds max_tokens).
    
    Args:
        file_diff (str): The file diff content
        max_tokens (int): Maximum allowed tokens (default: 100000)
    
    Returns:
        bool: True if file is too large, False otherwise
    """
    token_count = estimate_tokens_for_file(file_diff)
    return token_count >= max_tokens 