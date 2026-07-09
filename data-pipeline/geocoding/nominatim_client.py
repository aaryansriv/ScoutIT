"""
Geocoding Client — Nominatim (self-hosted) + fallback to public Nominatim
--------------------------------------------------------------------------
Self-hosted Nominatim removes the 1 req/sec ceiling of the public API.

Docker setup (one-time):
    docker run -it --rm \
        -e PBF_URL=https://download.geofabrik.de/asia/india-latest.osm.pbf \
        -e REPLICATION_URL=https://download.geofabrik.de/asia/india-updates/ \
        -p 8080:8080 \
        -v nominatim-data:/var/lib/postgresql/14/main \
        --name nominatim \
        mediagis/nominatim:4.4

Usage:
    from data_pipeline.geocoding.nominatim_client import geocode_address
    lat, lng = geocode_address("Sector 62, Noida, Uttar Pradesh")
"""

import httpx
import time
import logging
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

SELF_HOSTED_URL = "http://localhost:8080"
PUBLIC_FALLBACK_URL = "https://nominatim.openstreetmap.org"
PUBLIC_RATE_LIMIT_DELAY = 1.1  # seconds — public API limit is 1 req/sec


def geocode_address(
    address: str,
    city: str = "",
    country: str = "India",
    use_self_hosted: bool = True,
) -> Optional[Tuple[float, float]]:
    """
    Geocode an address to (lat, lng).
    Tries self-hosted Nominatim first; falls back to public API if unavailable.

    Returns:
        (lat, lng) tuple or None if geocoding fails.
    """
    query = f"{address}, {city}, {country}".strip(", ")

    result = _query_nominatim(SELF_HOSTED_URL if use_self_hosted else PUBLIC_FALLBACK_URL, query)
    if result:
        return result

    # Fallback to public Nominatim (with rate limiting)
    if use_self_hosted:
        logger.warning(f"Self-hosted Nominatim unavailable, falling back to public for: {query}")
        time.sleep(PUBLIC_RATE_LIMIT_DELAY)
        return _query_nominatim(PUBLIC_FALLBACK_URL, query, is_public=True)

    return None


def _query_nominatim(
    base_url: str,
    query: str,
    is_public: bool = False,
) -> Optional[Tuple[float, float]]:
    headers = {"User-Agent": "ScoutIT/2.0 (scoutit.in)"}
    params = {
        "q": query,
        "format": "json",
        "limit": 1,
        "countrycodes": "in",
        "addressdetails": 0,
    }
    try:
        resp = httpx.get(
            f"{base_url}/search",
            params=params,
            headers=headers,
            timeout=15,
        )
        resp.raise_for_status()
        results = resp.json()
        if results:
            return float(results[0]["lat"]), float(results[0]["lon"])
    except Exception as e:
        logger.debug(f"Nominatim query failed ({base_url}): {e}")
    return None


def batch_geocode(
    companies: list[dict],
    use_self_hosted: bool = True,
    public_delay: float = PUBLIC_RATE_LIMIT_DELAY,
) -> list[dict]:
    """
    Geocode a list of company dicts that have 'address' and 'city' fields.
    Adds 'lat' and 'lng' fields in-place. Skips companies that already have coords.
    """
    total = len(companies)
    geocoded = 0
    failed = 0

    for i, company in enumerate(companies):
        # Skip if already geocoded (e.g., from OSM which provides lat/lng directly)
        if company.get("lat") and company.get("lng"):
            continue

        address = company.get("address", "")
        city = company.get("city", "")
        result = geocode_address(address, city, use_self_hosted=use_self_hosted)

        if result:
            company["lat"], company["lng"] = result
            geocoded += 1
        else:
            failed += 1
            logger.warning(f"  ✗ Failed to geocode: {company.get('name')} — {address}, {city}")

        if not use_self_hosted:
            time.sleep(public_delay)

        if (i + 1) % 100 == 0:
            logger.info(f"  Progress: {i+1}/{total} (geocoded={geocoded}, failed={failed})")

    logger.info(f"Batch geocoding complete: {geocoded} geocoded, {failed} failed out of {total}")
    return companies
