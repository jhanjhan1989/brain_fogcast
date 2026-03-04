# Health Facilities Feature Setup

## Overview
This feature displays health facilities (government and private) within a 10km radius of the selected location on the map.

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables
Make sure your `backend/.env` file contains:
```env
ULAP_NGA_SERVER=https://ulap-nga.georisk.gov.ph/arcgis
ARCGIS_USER=mayonv
ARCGIS_PASSWORD=taal*2025
```

### 3. API Endpoints

#### Search Facilities by Radius
```
GET /health-facilities/search/radius
```

**Parameters:**
- `latitude` (float, required): Center point latitude
- `longitude` (float, required): Center point longitude
- `radius_km` (float, optional): Search radius in kilometers (default: 10)
- `facility_type` (string, optional): Filter by "government" or "private"

**Response:**
```json
{
  "count": 15,
  "radius_km": 10,
  "center": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "facilities": [
    {
      "facility_name": "Manila General Hospital",
      "facility_type": "government",
      "address": "Taft Avenue, Ermita",
      "longitude": 120.9842,
      "latitude": 14.5995,
      "contact_number": "02-1234-5678",
      "email": "info@hospital.gov.ph",
      "bed_capacity": 500,
      "services_offered": "Emergency, Surgery, ICU",
      "distance_km": 0.5
    }
  ]
}
```

#### Test Connection
```
GET /health-facilities/test
```

#### Debug Response
```
GET /health-facilities/debug
```

### 4. Start Backend Server
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

## Frontend Setup

### 1. Environment Variables
Make sure your `frontend/.env` file contains:
```env
VITE_API_URL=http://localhost:8000
```

### 2. Features

#### Map Display
- Health facilities are displayed as square markers on the map
- Green squares: Government facilities
- Blue squares: Private facilities
- Click on markers to see facility details in popup

#### Legend
- Shows count of government and private facilities
- Updates when location changes
- Displays total facilities within 10km radius

#### Auto-fetch
- Facilities are automatically fetched when:
  - User selects a location from search
  - User clicks on the map
  - User selects a city from dropdown

### 3. Start Frontend Server
```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Start the backend server (port 8000)
2. Start the frontend server (port 5173)
3. Open the Risk Calculator page
4. Select a location using:
   - Search bar (type city name)
   - Click on the map
   - Select from dropdown suggestions
5. Health facilities within 10km will automatically appear on the map
6. Click on facility markers to see details

## Map Markers

### Air Quality Stations
- Circular markers with colors based on AQI level
- Green (Good) to Red/Purple (Hazardous)

### Health Facilities
- Square markers
- Green: Government facilities
- Blue: Private facilities
- White border for visibility

### Selected Location
- Purple circular marker with white border
- Larger size (16px) for visibility

## API Testing

### Test with curl:
```bash
# Search facilities near Manila
curl "http://localhost:8000/health-facilities/search/radius?latitude=14.5995&longitude=120.9842&radius_km=10"

# Search only government facilities
curl "http://localhost:8000/health-facilities/search/radius?latitude=14.5995&longitude=120.9842&radius_km=10&facility_type=government"

# Test connection
curl "http://localhost:8000/health-facilities/test"
```

## Troubleshooting

### No facilities showing on map
1. Check backend is running on port 8000
2. Check frontend .env has correct VITE_API_URL
3. Check browser console for errors
4. Verify ArcGIS credentials in backend/.env

### Authentication errors
1. Verify ARCGIS_USER and ARCGIS_PASSWORD in backend/.env
2. Check if credentials are valid
3. Test with /health-facilities/debug endpoint

### Map not loading
1. Check internet connection (ArcGIS API requires internet)
2. Check browser console for ArcGIS loading errors
3. Verify map container has proper dimensions

## Database (Optional)

The API includes optional database caching endpoints:

### Sync facilities to database
```
POST /health-facilities/sync
```

This will fetch all facilities from ArcGIS and save to local database for faster queries.

## Notes

- Health facilities data is fetched directly from ArcGIS MapServer
- Distance calculation uses Haversine formula for accuracy
- Facilities are sorted by distance from selected location
- Maximum 5000 facilities per query (ArcGIS limit)
- Popup shows: name, type, address, distance, beds, contact, services
