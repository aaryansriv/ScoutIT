import sys
import os
import json
import logging

# Ensure backend module is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from ingestion.osm_ingest import ingest_city, CITY_BBOXES
from dedup.deduplicator import deduplicate
from geocoding.nominatim_client import batch_geocode

from app.db.session import SessionLocal
from app.models.company import Company
from sqlalchemy.dialects.postgresql import insert

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_pipeline(city: str = None):
    # 1. Ingest OSM data
    raw_companies = []
    if city and city in CITY_BBOXES:
        logger.info(f"--- 1. Ingesting from OSM for {city} ---")
        raw_companies = ingest_city(city, CITY_BBOXES[city])
    else:
        logger.info("--- 1. Ingesting from OSM for all cities ---")
        for c, bbox in CITY_BBOXES.items():
            raw_companies.extend(ingest_city(c, bbox))

    if not raw_companies:
        logger.warning("No companies ingested.")
        return

    # 2. Add crawler data (Simulation step since crawling is asynchronous in Scrapy)
    # If directory_spider outputs a JSON, load it here.
    spider_output = "scraped_companies.json"
    if os.path.exists(spider_output):
        logger.info("--- 2. Merging spider crawler data ---")
        with open(spider_output, "r", encoding="utf-8") as f:
            scraped = json.load(f)
            raw_companies.extend(scraped)

    # 3. Geocoding
    logger.info("--- 3. Geocoding missing addresses ---")
    # batch_geocode skips those that already have lat/lng
    geocoded_companies = batch_geocode(raw_companies, use_self_hosted=False)

    # 4. Deduplicate
    logger.info("--- 4. Deduplication ---")
    clean_companies = deduplicate(geocoded_companies)
    logger.info(f"Cleaned count: {len(clean_companies)}")

    # 5. Database Upsert
    logger.info("--- 5. Database Upsert ---")
    db = SessionLocal()
    try:
        inserted_count = 0
        for c in clean_companies:
            slug = c["name"].lower().replace(" ", "-").replace(".", "")
            stmt = insert(Company).values(
                name=c["name"],
                slug=slug,
                city=c.get("city", city),
                location=f"SRID=4326;POINT({c['lng']} {c['lat']})" if "lat" in c and "lng" in c else None,
                industry=c.get("industry", "IT/Software"),
                company_type=c.get("company_type"),
                employee_count=c.get("employee_count"),
                data_source=c.get("data_source", ["osm"])
            ).on_conflict_do_update(
                index_elements=['slug'],
                set_={
                    "name": c["name"],
                    "city": c.get("city", city)
                }
            )
            db.execute(stmt)
            inserted_count += 1
        db.commit()
        logger.info(f"Upserted {inserted_count} companies to DB.")
    except Exception as e:
        logger.error(f"Database error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--city", help="City to run pipeline for")
    args = parser.parse_args()
    
    run_pipeline(args.city)
