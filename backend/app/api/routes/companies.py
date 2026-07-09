from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import json
import redis

from app.db.session import get_db
from app.models.company import Company
from app.schemas.company import (
    CompanyOut, CompanyMapMarker, ClusterPoint, ViewportQuery
)
from app.core.config import settings

router = APIRouter()

# Redis client for cluster caching
_redis = redis.from_url(settings.REDIS_URL, decode_responses=True)


# ─── Viewport / Clustering ────────────────────────────────────────────────────

@router.get("/viewport", response_model=List[ClusterPoint])
async def get_viewport_companies(
    north: float = Query(...),
    south: float = Query(...),
    east: float = Query(...),
    west: float = Query(...),
    zoom: int = Query(..., ge=1, le=20),
    db: Session = Depends(get_db),
):
    """
    Returns clustered GeoJSON for the current map viewport.
    Results are cached in Redis keyed by viewport bounds + zoom.
    """
    cache_key = f"viewport:{north:.4f}:{south:.4f}:{east:.4f}:{west:.4f}:{zoom}"
    cached = _redis.get(cache_key)
    if cached:
        return json.loads(cached)

    # Fetch companies within the viewport bounding box
    sql = text("""
        SELECT
            id::text,
            name,
            slug,
            company_type,
            hiring,
            logo,
            ST_Y(location::geometry) AS lat,
            ST_X(location::geometry) AS lng
        FROM companies
        WHERE location IS NOT NULL
          AND ST_Within(
              location::geometry,
              ST_MakeEnvelope(:west, :south, :east, :north, 4326)
          )
        LIMIT 2000
    """)

    rows = db.execute(sql, {
        "north": north, "south": south, "east": east, "west": west
    }).fetchall()

    # Simple clustering: at low zoom return cluster centroids (server-side logic)
    # At high zoom (>= 14) return individual points
    if zoom >= 14 or len(rows) <= 50:
        result = [
            ClusterPoint(
                type="point",
                lat=row.lat,
                lng=row.lng,
                company=CompanyMapMarker(
                    id=row.id,
                    name=row.name,
                    slug=row.slug,
                    lat=row.lat,
                    lng=row.lng,
                    company_type=row.company_type,
                    hiring=row.hiring,
                    logo=row.logo,
                )
            )
            for row in rows
        ]
    else:
        # Grid-based clustering for lower zoom levels
        result = _grid_cluster(rows, zoom)

    _redis.setex(cache_key, settings.CLUSTER_CACHE_TTL, json.dumps(
        [p.model_dump() for p in result]
    ))
    return result


def _grid_cluster(rows, zoom: int) -> List[ClusterPoint]:
    """Simple grid-based server-side clustering."""
    grid_size = max(0.01, 0.5 / (2 ** (zoom - 8)))
    clusters: dict = {}
    for row in rows:
        cell_lat = round(row.lat / grid_size) * grid_size
        cell_lng = round(row.lng / grid_size) * grid_size
        key = (cell_lat, cell_lng)
        if key not in clusters:
            clusters[key] = {"lat": cell_lat, "lng": cell_lng, "count": 0}
        clusters[key]["count"] += 1

    return [
        ClusterPoint(type="cluster", lat=c["lat"], lng=c["lng"], count=c["count"])
        for c in clusters.values()
    ]


# ─── Company Profile ──────────────────────────────────────────────────────────

@router.get("/{slug}", response_model=CompanyOut)
async def get_company(slug: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.slug == slug).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


# ─── Nearby Companies ─────────────────────────────────────────────────────────

@router.get("/{slug}/nearby", response_model=List[CompanyMapMarker])
async def get_nearby_companies(
    slug: str,
    radius_km: float = Query(5.0, ge=0.5, le=50),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    company = db.query(Company).filter(Company.slug == slug).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    sql = text("""
        SELECT
            id::text, name, slug, company_type, hiring, logo,
            ST_Y(location::geometry) AS lat,
            ST_X(location::geometry) AS lng
        FROM companies
        WHERE slug != :slug
          AND location IS NOT NULL
          AND ST_DWithin(
              location,
              (SELECT location FROM companies WHERE slug = :slug),
              :radius_m
          )
        ORDER BY location <-> (SELECT location FROM companies WHERE slug = :slug)
        LIMIT :limit
    """)

    rows = db.execute(sql, {
        "slug": slug, "radius_m": radius_km * 1000, "limit": limit
    }).fetchall()

    return [
        CompanyMapMarker(
            id=row.id, name=row.name, slug=row.slug,
            lat=row.lat, lng=row.lng,
            company_type=row.company_type, hiring=row.hiring, logo=row.logo,
        )
        for row in rows
    ]
