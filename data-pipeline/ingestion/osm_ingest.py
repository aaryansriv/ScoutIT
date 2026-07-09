"""
OSM Overpass API Ingestion Script
----------------------------------
Queries OpenStreetMap for IT/software company offices in Indian cities
and writes seed data into the companies table.

Usage:
    python -m data_pipeline.ingestion.osm_ingest --city Noida --state "Uttar Pradesh"
    python -m data_pipeline.ingestion.osm_ingest --all-cities
"""

import httpx
import json
import time
import argparse
import logging
from typing import List, Dict, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OVERPASS_API = "https://overpass-api.de/api/interpreter"

# Major Indian tech hub cities with their approximate bounding boxes
CITY_BBOXES = {
    "Noida":       (28.394, 77.278, 28.680, 77.556),
    "Bengaluru":   (12.750, 77.350, 13.250, 77.900),
    "Hyderabad":   (17.150, 78.150, 17.650, 78.750),
    "Pune":        (18.417, 73.736, 18.643, 73.995),
    "Chennai":     (12.896, 80.148, 13.235, 80.328),
    "Mumbai":      (18.894, 72.776, 19.272, 72.986),
    "Gurugram":    (28.367, 76.960, 28.553, 77.143),
    "Delhi":       (28.404, 76.838, 28.884, 77.345),
    "Kolkata":     (22.428, 88.202, 22.713, 88.487),
    "Ahmedabad":   (22.952, 72.499, 23.131, 72.701),
    "Jaipur":      (26.797, 75.697, 27.028, 75.937),
    "Indore":      (22.617, 75.799, 22.772, 75.946),
    "Bhopal":      (23.161, 77.319, 23.333, 77.493),
    "Chandigarh":  (30.659, 76.719, 30.766, 76.855),
    "Coimbatore":  (10.935, 76.906, 11.072, 77.066),
    "Kochi":       (9.916,  76.235, 10.063, 76.395),
    "Trivandrum":  (8.434,  76.876, 8.580,  77.063),
}

# OSM tags that indicate a software/IT company office
OSM_QUERY_TEMPLATE = """
[out:json][timeout:90];
(
  node["office"="it"]{bbox};
  node["office"~"company|coworking"]["name"~"tech|software|systems|solutions|digital|data|cloud|ai|it|services",i]{bbox};
  node["building"~"commercial|office"]["name"~"tech|software|systems|solutions|digital|data|cloud|ai|it",i]{bbox};
  
  way["office"="it"]{bbox};
  way["office"~"company|coworking"]["name"~"tech|software|systems|solutions|digital|data|cloud|ai|it|services",i]{bbox};
  way["building"~"commercial|office"]["name"~"tech|software|systems|solutions|digital|data|cloud|ai|it",i]{bbox};
  
  relation["office"="it"]{bbox};
);
out center tags;
"""


def build_bbox_str(south: float, west: float, north: float, east: float) -> str:
    return f"({south},{west},{north},{east})"


def query_overpass(city: str, bbox: tuple) -> List[Dict]:
    """Query Overpass API for IT offices in a city bounding box."""
    south, west, north, east = bbox
    bbox_str = build_bbox_str(south, west, north, east)
    query = OSM_QUERY_TEMPLATE.replace("{bbox}", bbox_str)

    logger.info(f"Querying OSM for: {city}")
    try:
        resp = httpx.post(
            OVERPASS_API,
            data={"data": query},
            timeout=90,
            headers={"User-Agent": "ScoutIT/2.0 (scoutit.in)"},
        )
        resp.raise_for_status()
        elements = resp.json().get("elements", [])
        logger.info(f"  → Found {len(elements)} raw elements")
        return elements
    except httpx.HTTPError as e:
        logger.error(f"  ✗ Overpass error for {city}: {e}")
        return []


def parse_element(element: Dict, city: str) -> Optional[Dict]:
    """Normalize a single OSM element into our company schema."""
    tags = element.get("tags", {})
    name = tags.get("name", "").strip()
    if not name or len(name) < 2:
        return None

    # Extract lat/lng (nodes have direct coords; ways/relations have center)
    lat = element.get("lat") or element.get("center", {}).get("lat")
    lng = element.get("lon") or element.get("center", {}).get("lon")
    if not lat or not lng:
        return None

    return {
        "name": name,
        "slug": name.lower().replace(" ", "-").replace("/", "-")[:100],
        "website": tags.get("website") or tags.get("contact:website"),
        "phone": tags.get("phone") or tags.get("contact:phone"),
        "address": tags.get("addr:full") or _build_address(tags),
        "city": tags.get("addr:city") or city,
        "state": tags.get("addr:state"),
        "country": "India",
        "lat": lat,
        "lng": lng,
        "data_source": ["osm"],
        "osm_id": element.get("id"),
        "osm_type": element.get("type"),
    }


def _build_address(tags: Dict) -> Optional[str]:
    parts = filter(None, [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:suburb"),
        tags.get("addr:postcode"),
    ])
    addr = ", ".join(parts)
    return addr or None


def ingest_city(city: str, bbox: tuple) -> List[Dict]:
    """Full ingest pipeline for one city."""
    elements = query_overpass(city, bbox)
    companies = []
    seen_names: set = set()

    for el in elements:
        parsed = parse_element(el, city)
        if parsed and parsed["name"] not in seen_names:
            seen_names.add(parsed["name"])
            companies.append(parsed)

    logger.info(f"  ✓ {city}: {len(companies)} unique companies parsed")
    return companies


def ingest_all_cities(delay_seconds: float = 2.0) -> List[Dict]:
    """
    Ingest all configured cities with a polite delay between requests
    to avoid hammering the public Overpass API.
    """
    all_companies = []
    for city, bbox in CITY_BBOXES.items():
        companies = ingest_city(city, bbox)
        all_companies.extend(companies)
        time.sleep(delay_seconds)  # be polite to public Overpass API

    logger.info(f"\nTotal raw companies: {len(all_companies)}")
    return all_companies


def save_to_json(companies: List[Dict], output_path: str = "osm_seed.json"):
    """Save parsed companies to JSON for inspection / pipeline handoff."""
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(companies, f, ensure_ascii=False, indent=2)
    logger.info(f"Saved {len(companies)} companies → {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OSM company ingestion")
    parser.add_argument("--city", help="Single city to ingest")
    parser.add_argument("--all-cities", action="store_true")
    parser.add_argument("--output", default="osm_seed.json")
    args = parser.parse_args()

    if args.all_cities:
        companies = ingest_all_cities()
    elif args.city:
        if args.city not in CITY_BBOXES:
            print(f"Unknown city. Available: {list(CITY_BBOXES.keys())}")
            exit(1)
        companies = ingest_city(args.city, CITY_BBOXES[args.city])
    else:
        parser.print_help()
        exit(1)

    save_to_json(companies, args.output)
