import re

from rag.retrieval_pipeline import db, generate_fallback_recipes

DEFAULT_SEARCH_K = 30
MAX_RESULTS = 5

MINUTE_MEALS_QUERY_PATTERN = re.compile(
    r"^\s*(\d+)\s+minute\s+(.+)$",
    re.IGNORECASE,
)


def extract_time_query(user_query: str) -> tuple[int, str]:
    """
    Parse queries like "30 minute pasta" into (time_limit, semantic_query).

    Raises ValueError if the query does not match the expected format.
    """
    match = MINUTE_MEALS_QUERY_PATTERN.match(user_query.strip())
    if not match:
        raise ValueError(
            'Query must be in the format "<number> minute <dish>", e.g. "30 minute pasta".'
        )

    time_limit = int(match.group(1))
    semantic_query = match.group(2).strip()

    if not semantic_query:
        raise ValueError("Semantic query cannot be empty after the time limit.")

    return time_limit, semantic_query


def _similarity_search_semantic(semantic_query: str, k: int = DEFAULT_SEARCH_K):
    """
    Run vector similarity search using only the semantic portion of the query.
    Uses the same search_query prefix as the main pipeline for embedding consistency.
    """
    query = f"search_query: {semantic_query}"
    return db.similarity_search(query, k=k)


def filter_by_prep_time(docs, time_limit: int):
    """Keep only recipes whose metadata prep_time is <= time_limit."""
    filtered = []

    for doc in docs:
        prep_time_val = doc.metadata.get("prep_time")
        if prep_time_val is None:
            continue
        try:
            if float(prep_time_val) <= time_limit:
                filtered.append(doc)
        except (TypeError, ValueError):
            continue

    return filtered


def retrieve_minute_meals(
    user_query: str,
    search_k: int = DEFAULT_SEARCH_K,
    max_results: int = MAX_RESULTS,
) -> dict:
    """
    Minute Meals retrieval pipeline.

    Runs similarity search on the semantic query, filters by prep time, and
    returns up to max_results recipes. Falls back to the LLM when no matches
    are found.

    Returns:
        {
            "time_limit": int,
            "semantic_query": str,
            "recipes": list,  # LangChain Documents or recipe dicts from LLM
            "source": "rag" | "llm" | "none",
        }
    """
    time_limit, semantic_query = extract_time_query(user_query)

    docs = _similarity_search_semantic(semantic_query, k=search_k)
    filtered_docs = filter_by_prep_time(docs, time_limit)

    if filtered_docs:
        return {
            "time_limit": time_limit,
            "semantic_query": semantic_query,
            "recipes": filtered_docs[:max_results],
            "source": "rag",
        }

    fallback_recipes = generate_fallback_recipes(
        semantic_query,
        max_prep_time=time_limit,
    )

    if fallback_recipes:
        return {
            "time_limit": time_limit,
            "semantic_query": semantic_query,
            "recipes": fallback_recipes[:max_results],
            "source": "llm",
        }

    return {
        "time_limit": time_limit,
        "semantic_query": semantic_query,
        "recipes": [],
        "source": "none",
    }
