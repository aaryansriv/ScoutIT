from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class CompanyBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    logo: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    career_url: Optional[str] = None
    industry: Optional[str] = None
    company_type: Optional[str] = None
    employee_count: Optional[int] = None
    funding: Optional[str] = None
    freshers_score: Optional[float] = None
    glassdoor_rating: Optional[float] = None
    internships: bool = False
    hiring: bool = False
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    tech_stack: List[str] = []
    roles: List[str] = []
    data_source: List[str] = []
    lat: Optional[float] = None
    lng: Optional[float] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    hiring: Optional[bool] = None
    internships: Optional[bool] = None
    tech_stack: Optional[List[str]] = None
    career_url: Optional[str] = None


class CompanyOut(CompanyBase):
    id: UUID
    last_verified_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CompanyMapMarker(BaseModel):
    """Minimal payload for map markers — keeps viewport API response small."""
    id: UUID
    name: str
    slug: str
    lat: float
    lng: float
    company_type: Optional[str] = None
    hiring: bool = False
    logo: Optional[str] = None


class ClusterPoint(BaseModel):
    """Supercluster cluster or individual point returned by viewport API."""
    type: str  # "cluster" | "point"
    lat: float
    lng: float
    count: Optional[int] = None  # only for clusters
    company: Optional[CompanyMapMarker] = None  # only for individual points


class ViewportQuery(BaseModel):
    north: float = Field(..., description="North latitude bound")
    south: float = Field(..., description="South latitude bound")
    east: float = Field(..., description="East longitude bound")
    west: float = Field(..., description="West longitude bound")
    zoom: int = Field(..., ge=1, le=20, description="Map zoom level")


class SearchQuery(BaseModel):
    q: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    company_type: Optional[str] = None  # startup,product,service,mnc,unicorn
    industry: Optional[str] = None
    hiring: Optional[bool] = None
    internships: Optional[bool] = None
    tech_stack: Optional[List[str]] = None
    min_employees: Optional[int] = None
    max_employees: Optional[int] = None
    page: int = 1
    page_size: int = 20
