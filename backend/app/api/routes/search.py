from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional

from app.db.session import get_db
from app.schemas.company import CompanyOut

router = APIRouter()


@router.get("/", response_model=List[CompanyOut])
async def search_companies(
    q: Optional[str] = Query(None, description="Full-text search query"),
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    company_type: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    hiring: Optional[bool] = Query(None),
    internships: Optional[bool] = Query(None),
    tech_stack: Optional[str] = Query(None, description="Comma-separated tech stack"),
    min_employees: Optional[int] = Query(None),
    max_employees: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Full-text + filter search using pg_trgm for fuzzy matching.
    All filters are optional and combinable.
    """
    conditions = ["1=1"]
    params: dict = {}

    # Full-text fuzzy search on name and city
    if q:
        conditions.append(
            "(name % :q OR city % :q OR description ILIKE :q_ilike)"
        )
        params["q"] = q
        params["q_ilike"] = f"%{q}%"

    if city:
        conditions.append("city ILIKE :city")
        params["city"] = f"%{city}%"

    if state:
        conditions.append("state ILIKE :state")
        params["state"] = f"%{state}%"

    if company_type:
        conditions.append("company_type = :company_type")
        params["company_type"] = company_type

    if industry:
        conditions.append("industry ILIKE :industry")
        params["industry"] = f"%{industry}%"

    if hiring is not None:
        conditions.append("hiring = :hiring")
        params["hiring"] = hiring

    if internships is not None:
        conditions.append("internships = :internships")
        params["internships"] = internships

    if tech_stack:
        techs = [t.strip() for t in tech_stack.split(",")]
        conditions.append("tech_stack && :tech_stack")
        params["tech_stack"] = techs

    if min_employees is not None:
        conditions.append("employee_count >= :min_employees")
        params["min_employees"] = min_employees

    if max_employees is not None:
        conditions.append("employee_count <= :max_employees")
        params["max_employees"] = max_employees

    where_clause = " AND ".join(conditions)
    offset = (page - 1) * page_size

    sql = text(f"""
        SELECT
            id::text, name, slug, description, logo, website, linkedin,
            career_url, industry, company_type, employee_count, funding,
            freshers_score, glassdoor_rating, internships, hiring,
            address, city, state, country, tech_stack, roles, data_source,
            ST_Y(location::geometry) AS lat,
            ST_X(location::geometry) AS lng,
            last_verified_at, created_at
        FROM companies
        WHERE {where_clause}
        ORDER BY
            CASE WHEN :q_sort IS NOT NULL THEN similarity(name, :q_sort) END DESC NULLS LAST,
            hiring DESC,
            freshers_score DESC NULLS LAST
        LIMIT :limit OFFSET :offset
    """)

    params["q_sort"] = q
    params["limit"] = page_size
    params["offset"] = offset

    rows = db.execute(sql, params).fetchall()
    return [dict(row._mapping) for row in rows]


@router.get("/autocomplete")
async def autocomplete(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
):
    """Fast autocomplete suggestions for company names and cities."""
    sql = text("""
        (
            SELECT name AS label, slug AS value, 'company' AS type
            FROM companies
            WHERE name ILIKE :prefix
            LIMIT 5
        )
        UNION ALL
        (
            SELECT DISTINCT city AS label, city AS value, 'city' AS type
            FROM companies
            WHERE city ILIKE :prefix
            LIMIT 5
        )
        ORDER BY label
        LIMIT 10
    """)
    rows = db.execute(sql, {"prefix": f"{q}%"}).fetchall()
    return [dict(row._mapping) for row in rows]
