import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

async def aggregate_chunk_summaries(chunk_summaries: List[str], pr_metadata: Dict, llm_service: Any, review_info: Dict) -> str:
    """
    Aggregate multiple chunk summaries into a single comprehensive summary.
    
    Args:
        chunk_summaries (List[str]): List of summaries from different chunks
        pr_metadata (Dict): PR metadata for context
        llm_service (ClaudeService): LLM service for aggregation
        review_info (Dict): Review info for context
    Returns:
        str: Aggregated summary
    """
    if not chunk_summaries:
        logger.warning("No chunk summaries to aggregate")
        return ""
    
    if len(chunk_summaries) == 1:
        logger.info("Only one chunk summary, returning as-is")
        return chunk_summaries[0]
    
    logger.info(f"Aggregating {len(chunk_summaries)} chunk summaries")
    
    # Create aggregation prompt
    aggregation_prompt = create_aggregation_prompt(chunk_summaries, pr_metadata, review_info)
    
    try:
        # Use LLM to aggregate summaries
        aggregated_summary = await llm_service.generate_pr_summary(aggregation_prompt)
        logger.info("Successfully aggregated chunk summaries")
        return aggregated_summary
    except Exception as e:
        logger.error(f"Failed to aggregate summaries with LLM: {str(e)}")
        # Fallback: simple concatenation
        logger.info("Falling back to simple concatenation")
        return fallback_aggregation(chunk_summaries)

def create_aggregation_prompt(chunk_summaries: List[str], pr_metadata: Dict, review_info: Dict) -> str:
    """
    Create a prompt for aggregating multiple chunk summaries.
    
    Args:
        chunk_summaries (List[str]): List of chunk summaries
        pr_metadata (Dict): PR metadata
        review_info (Dict): Review info for context
    Returns:
        str: Aggregation prompt
    """
    prompt = f"""You are tasked with aggregating multiple summaries of a pull request into a single comprehensive summary.

Pull Request Information:
- Title: {pr_metadata.get('prTitle', 'N/A')}
- Number: {pr_metadata.get('prNumber', 'N/A')}
- Author: {pr_metadata.get('author_name', 'N/A')}

The PR has been analyzed in {len(chunk_summaries)} chunks due to size constraints. Below are the summaries from each chunk:

"""
    
    for i, summary in enumerate(chunk_summaries, 1):
        prompt += f"--- Chunk {i} Summary ---\n{summary}\n\n"
    
    prompt += """Please create a single, comprehensive summary that:
1. Combines all the key information from all chunks
2. Maintains the same format and structure as the original summaries
3. Eliminates redundancy while preserving all important details
4. Provides a cohesive overview of the entire pull request
5. Includes the review info provided below exactly the same format and structure as the original summaries but with the total values:
{review_info}

Aggregated Summary:"""
    
    return prompt

def fallback_aggregation(chunk_summaries: List[str]) -> str:
    """
    Fallback aggregation method when LLM aggregation fails.
    Simply concatenates summaries with clear separators.
    
    Args:
        chunk_summaries (List[str]): List of chunk summaries
    
    Returns:
        str: Concatenated summaries
    """
    if not chunk_summaries:
        return ""
    
    if len(chunk_summaries) == 1:
        return chunk_summaries[0]
    
    # Add header and concatenate
    aggregated = f"# Aggregated Summary from {len(chunk_summaries)} Chunks\n\n"
    
    for i, summary in enumerate(chunk_summaries, 1):
        aggregated += f"## Chunk {i}\n{summary}\n\n"
    
    return aggregated.strip() 