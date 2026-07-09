"""
Deduplication Pipeline
-----------------------
Uses rapidfuzz for fuzzy name matching and PostGIS ST_DWithin for
proximity-based duplicate detection across data sources.

Usage:
    from data_pipeline.dedup.deduplicator import deduplicate
    clean = deduplicate(companies)
"""

import logging
from typing import List, Dict, Optional
from rapidfuzz import fuzz, process

logger = logging.getLogger(__name__)

NAME_SIMILARITY_THRESHOLD = 85   # % — rapidfuzz score cutoff
PROXIMITY_THRESHOLD_M = 200       # metres — same office, different spelling


def normalize_name(name: str) -> str:
    """Lowercase, strip punctuation and common suffixes for comparison."""
    import re
    name = name.lower().strip()
    # Remove common legal suffixes
    suffixes = [
        r"\bpvt\.?\s*ltd\.?\b",
        r"\bprivate\s+limited\b",
        r"\blimited\b",
        r"\bllp\b",
        r"\binc\.?\b",
        r"\bcorp\.?\b",
        r"\bltd\.?\b",
    ]
    for pattern in suffixes:
        name = re.sub(pattern, "", name, flags=re.IGNORECASE)
    # Collapse whitespace
    return re.sub(r"\s+", " ", name).strip()


def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Fast haversine distance in metres between two lat/lng points."""
    import math
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def deduplicate(companies: List[Dict]) -> List[Dict]:
    """
    Deduplicate a list of company dicts.

    Strategy:
    1. Fuzzy name match via rapidfuzz (threshold: 85%)
    2. For candidates above the name threshold, check proximity (< 200m)
    3. Merge duplicates: prefer the richer record (more non-null fields)

    Returns:
        Deduplicated list of company dicts with merged data_source provenance.
    """
    if not companies:
        return []

    normalized_names = [normalize_name(c.get("name", "")) for c in companies]
    merged_flags = [False] * len(companies)
    result: List[Dict] = []

    for i, company in enumerate(companies):
        if merged_flags[i]:
            continue

        duplicates = [i]
        name_i = normalized_names[i]
        lat_i = company.get("lat")
        lng_i = company.get("lng")

        for j in range(i + 1, len(companies)):
            if merged_flags[j]:
                continue

            name_j = normalized_names[j]
            score = fuzz.token_sort_ratio(name_i, name_j)

            if score >= NAME_SIMILARITY_THRESHOLD:
                # Additional proximity check if both have coords
                lat_j = companies[j].get("lat")
                lng_j = companies[j].get("lng")

                if lat_i and lng_i and lat_j and lng_j:
                    dist = haversine_m(lat_i, lng_i, lat_j, lng_j)
                    if dist <= PROXIMITY_THRESHOLD_M:
                        duplicates.append(j)
                        merged_flags[j] = True
                else:
                    # No coords available — trust name match alone
                    duplicates.append(j)
                    merged_flags[j] = True

        if len(duplicates) == 1:
            result.append(company)
        else:
            merged = _merge_records([companies[k] for k in duplicates])
            result.append(merged)
            logger.debug(
                f"Merged {len(duplicates)} records: "
                f"{[companies[k]['name'] for k in duplicates]}"
            )

    logger.info(f"Dedup: {len(companies)} → {len(result)} companies "
                f"({len(companies) - len(result)} duplicates removed)")
    return result


def _merge_records(records: List[Dict]) -> Dict:
    """
    Merge a list of duplicate records into one.
    Preference: record with the most non-null fields wins as base.
    Aggregates data_source provenance from all records.
    """
    # Pick richest record as base
    base = max(records, key=lambda r: sum(1 for v in r.values() if v is not None))
    merged = dict(base)

    # Aggregate provenance
    all_sources: List[str] = []
    for r in records:
        all_sources.extend(r.get("data_source", []))
    merged["data_source"] = list(set(all_sources))

    # Fill in missing fields from other records
    for record in records:
        for key, value in record.items():
            if key == "data_source":
                continue
            if merged.get(key) is None and value is not None:
                merged[key] = value

    return merged
