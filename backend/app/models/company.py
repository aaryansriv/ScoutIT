from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ARRAY, Text, Index
)
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geography
from datetime import datetime
import uuid

from app.models.base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text)
    logo = Column(String(512))

    # Online presence
    website = Column(String(512))
    linkedin = Column(String(512))
    career_url = Column(String(512))

    # Classification
    industry = Column(String(100))
    company_type = Column(String(50))  # startup, product, service, mnc, unicorn
    employee_count = Column(Integer)
    funding = Column(String(100))

    # Scoring
    freshers_score = Column(Float)
    glassdoor_rating = Column(Float)
    internships = Column(Boolean, default=False)
    hiring = Column(Boolean, default=False)

    # Location — PostGIS geography point
    location = Column(Geography(geometry_type="POINT", srid=4326))
    address = Column(String(512))
    city = Column(String(100), index=True)
    state = Column(String(100), index=True)
    country = Column(String(100), default="India")

    # Arrays
    tech_stack = Column(ARRAY(String))
    roles = Column(ARRAY(String))
    data_source = Column(ARRAY(String))  # provenance: ['osm','mca','scraped']

    # Sync tracking
    last_verified_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        # GiST spatial index for viewport queries
        Index("ix_companies_location", "location", postgresql_using="gist"),
        # Trigram indexes for fuzzy text search
        Index("ix_companies_name_trgm", "name", postgresql_using="gin",
              postgresql_ops={"name": "gin_trgm_ops"}),
        Index("ix_companies_city_trgm", "city", postgresql_using="gin",
              postgresql_ops={"city": "gin_trgm_ops"}),
    )


class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    experience = Column(String(50))
    salary = Column(String(100))
    skills = Column(ARRAY(String))
    location = Column(String(255))
    url = Column(String(512))
    deadline = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(512))
    bookmarks = Column(ARRAY(UUID(as_uuid=True)), default=[])
    applications = Column(ARRAY(UUID(as_uuid=True)), default=[])
    created_at = Column(DateTime, default=datetime.utcnow)
