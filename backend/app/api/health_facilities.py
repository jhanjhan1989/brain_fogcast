from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from sqlmodel import select
from sqlalchemy import or_
import httpx
import os

from app.api.deps import SessionDep
from app.models_.health_facilities import HealthFacility

router = APIRouter(prefix="/health-facilities", tags=["health-facilities"])

ARCGIS_USER = os.getenv("ARCGIS_USER", "")
ARCGIS_PASSWORD = os.getenv("ARCGIS_PASSWORD", "")
ULAP_NGA_SERVER = os.getenv("ULAP_NGA_SERVER", "https://ulap-nga.georisk.gov.ph/arcgis")
GOVERNMENT_URL = f"{ULAP_NGA_SERVER}/rest/services/DOH/Health_Facilities_Location_points_Government/MapServer/0"
PRIVATE_URL = f"{ULAP_NGA_SERVER}/rest/services/DOH/Health_Facilities_Location_points_Private/MapServer/0"


async def get_arcgis_token():
    """Get authentication token from ArcGIS"""
    token_url = "https://ulap-nga.georisk.gov.ph/arcgis/tokens/generateToken"
    data = {
        "username": ARCGIS_USER,
        "password": ARCGIS_PASSWORD,
        "referer": "https://ulap-nga.georisk.gov.ph",
        "f": "json"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(token_url, data=data)
        if response.status_code == 200:
            result = response.json()
            return result.get("token")
    
    raise HTTPException(status_code=401, detail="Failed to authenticate with ArcGIS")


async def fetch_facilities_with_token(service_url: str, token: str) -> List[Dict[str, Any]]:
    """Fetch facilities from ArcGIS service with token"""
    query_url = f"{service_url}/query"
    params = {
        "where": "1=1",
        "outFields": "*",
        "f": "json",
        "token": token,
        "resultRecordCount": 1000
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(query_url, params=params)
        if response.status_code == 200:
            data = response.json()
            return data.get("features", [])
    
    raise HTTPException(status_code=500, detail=f"Failed to fetch data: {response.status_code}")


@router.get("/search/radius")
async def search_facilities_by_radius(
    latitude: float,
    longitude: float,
    radius_km: float = 10.0,
    facility_type: str = None
):
    """
    Search for health facilities within a specified radius from a point.
    Queries directly from ArcGIS MapServer.
    
    Parameters:
    - latitude: Latitude of the center point (WGS84)
    - longitude: Longitude of the center point (WGS84)
    - radius_km: Search radius in kilometers (default: 10km)
    - facility_type: Optional filter by type (government or private)
    
    Returns array of facilities with distance information, sorted by distance.
    """
    try:
        from math import radians, cos, sin, asin, sqrt
        
        def haversine(lon1, lat1, lon2, lat2):
            """Calculate the great circle distance in kilometers between two points on earth"""
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            km = 6371 * c
            return km
        
        # Get ArcGIS token
        token = await get_arcgis_token()
        
        # Determine which services to query
        services_to_query = []
        if facility_type == "government":
            services_to_query = [("government", GOVERNMENT_URL)]
        elif facility_type == "private":
            services_to_query = [("private", PRIVATE_URL)]
        else:
            services_to_query = [
                ("government", GOVERNMENT_URL),
                ("private", PRIVATE_URL)
            ]
        
        all_results = []
        
        # Query each service
        for fac_type, service_url in services_to_query:
            query_url = f"{service_url}/query"
            params = {
                "where": "1=1",
                "outFields": "*",
                "f": "json",
                "token": token,
                "returnGeometry": "false",
                "resultRecordCount": 5000
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(query_url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    features = data.get("features", [])
                    
                    # Process each facility
                    for feature in features:
                        attrs = feature.get("attributes", {})
                        fac_lat = attrs.get("latitude")
                        fac_lon = attrs.get("longitude")
                        
                        if fac_lat is None or fac_lon is None:
                            continue
                        
                        # Calculate distance
                        distance = haversine(longitude, latitude, fac_lon, fac_lat)
                        
                        # Filter by radius
                        if distance <= radius_km:
                            facility_dict = {
                                "facility_name": attrs.get("facilityn", ""),
                                "facility_type": fac_type,
                                "address": f"{attrs.get('streetname', '')} {attrs.get('buildingn', '')}".strip(),
                                "longitude": fac_lon,
                                "latitude": fac_lat,
                                "contact_number": attrs.get("landlinen", ""),
                                "email": attrs.get("emailaddress", ""),
                                "bed_capacity": int(attrs.get("bedcapacity", 0)) if attrs.get("bedcapacity") and str(attrs.get("bedcapacity")).isdigit() else None,
                                "services_offered": attrs.get("serviceca", ""),
                                "distance_km": round(distance, 2)
                            }
                            all_results.append(facility_dict)
        
        # Sort by distance
        all_results.sort(key=lambda x: x["distance_km"])
        
        return {
            "count": len(all_results),
            "radius_km": radius_km,
            "center": {"latitude": latitude, "longitude": longitude},
            "facilities": all_results
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching facilities: {str(e)}"
        )


@router.get("/debug")
async def debug_response():
    """Debug the actual API response"""
    try:
        token = await get_arcgis_token()
        query_url = f"{GOVERNMENT_URL}/query"
        params = {
            "where": "1=1",
            "outFields": "*",
            "f": "json",
            "token": token,
            "resultRecordCount": 10
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(query_url, params=params)
            return {
                "status_code": response.status_code,
                "response": response.json() if response.status_code == 200 else response.text
            }
    except Exception as e:
        return {"error": str(e)}


@router.get("/test")
async def test_connection():
    """Test connection to ArcGIS services"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{GOVERNMENT_URL}?f=json")
            return {
                "status": "success",
                "response_code": response.status_code,
                "service": "government"
            }
    except Exception as e:
        return {"status": "error", "error": str(e)}


# Database CRUD Operations (optional - for caching)
@router.post("/sync")
async def sync_facilities_from_arcgis(session: SessionDep):
    """Fetch all health facilities from ArcGIS and save to database"""
    try:
        token = await get_arcgis_token()
        government_facilities = await fetch_facilities_with_token(GOVERNMENT_URL, token)
        private_facilities = await fetch_facilities_with_token(PRIVATE_URL, token)
        
        saved_facilities = []
        
        for facility_data in government_facilities:
            attrs = facility_data.get("attributes", {})
            facility = HealthFacility(
                facility_name=attrs.get("facilityn", ""),
                facility_type="government",
                address=f"{attrs.get('streetname', '')} {attrs.get('buildingn', '')}".strip(),
                region="",
                province="",
                city_municipality="",
                barangay="",
                longitude=attrs.get("longitude"),
                latitude=attrs.get("latitude"),
                contact_number=attrs.get("landlinen", ""),
                email=attrs.get("emailaddress", ""),
                bed_capacity=int(attrs.get("bedcapacity", 0)) if attrs.get("bedcapacity") and str(attrs.get("bedcapacity")).isdigit() else None,
                services_offered=attrs.get("serviceca", "")
            )
            session.add(facility)
            saved_facilities.append(facility)
        
        for facility_data in private_facilities:
            attrs = facility_data.get("attributes", {})
            facility = HealthFacility(
                facility_name=attrs.get("facilityn", ""),
                facility_type="private",
                address=f"{attrs.get('streetname', '')} {attrs.get('buildingn', '')}".strip(),
                region="",
                province="",
                city_municipality="",
                barangay="",
                longitude=attrs.get("longitude"),
                latitude=attrs.get("latitude"),
                contact_number=attrs.get("landlinen", ""),
                email=attrs.get("emailaddress", ""),
                bed_capacity=int(attrs.get("bedcapacity", 0)) if attrs.get("bedcapacity") and str(attrs.get("bedcapacity")).isdigit() else None,
                services_offered=attrs.get("serviceca", "")
            )
            session.add(facility)
            saved_facilities.append(facility)
        
        session.commit()
        
        return {
            "message": f"Successfully synced {len(saved_facilities)} health facilities",
            "government_count": len(government_facilities),
            "private_count": len(private_facilities),
            "total_saved": len(saved_facilities)
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error syncing facilities: {str(e)}")
