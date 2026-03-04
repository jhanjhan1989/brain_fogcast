from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class HealthFacility(SQLModel, table=True):
    __tablename__ = "health_facilities"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    facility_name: str = Field(index=True)
    facility_type: str = Field(index=True)  # government or private
    address: str
    region: str = Field(default="", index=True)
    province: str = Field(default="", index=True)
    city_municipality: str = Field(default="", index=True)
    barangay: str = Field(default="", index=True)
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    bed_capacity: Optional[int] = None
    services_offered: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
