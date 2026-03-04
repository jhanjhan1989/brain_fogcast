import { useState, useEffect, useRef } from "react";
import { MapPin, Search, X, Loader, Info } from "lucide-react";
import axios from "axios";

interface LocationData {
  name: string;
  lat: number;
  lng: number;
  pm25?: number;
  no2?: number;
  asir?: number;
  aqi?: number;
}

interface LocationSelectorProps {
  onLocationSelect: (location: LocationData) => void;
  selectedLocation: LocationData | null;
}

interface AirQualityStation {
  uid: number;
  aqi: string;
  lat: number;
  lon: number;
  station: {
    name: string;
  };
}

// Philippines major cities with realistic air quality and ASIR data
const philippinesCities: LocationData[] = [
  { name: "Manila", lat: 14.5995, lng: 120.9842, pm25: 35.2, no2: 42.5, asir: 6.8, aqi: 98 },
  { name: "Quezon City", lat: 14.6760, lng: 121.0437, pm25: 33.8, no2: 40.2, asir: 6.5, aqi: 95 },
  { name: "Cebu City", lat: 10.3157, lng: 123.8854, pm25: 28.5, no2: 35.8, asir: 5.9, aqi: 85 },
  { name: "Davao City", lat: 7.1907, lng: 125.4553, pm25: 25.3, no2: 32.1, asir: 5.2, aqi: 78 },
  { name: "Caloocan", lat: 14.6507, lng: 120.9830, pm25: 34.1, no2: 41.3, asir: 6.7, aqi: 96 },
  { name: "Zamboanga City", lat: 6.9214, lng: 122.0790, pm25: 22.8, no2: 28.5, asir: 4.8, aqi: 72 },
  { name: "Taguig", lat: 14.5176, lng: 121.0509, pm25: 32.5, no2: 39.7, asir: 6.3, aqi: 92 },
  { name: "Pasig", lat: 14.5764, lng: 121.0851, pm25: 33.2, no2: 40.8, asir: 6.6, aqi: 94 },
  { name: "Makati", lat: 14.5547, lng: 121.0244, pm25: 34.8, no2: 43.2, asir: 7.0, aqi: 97 },
  { name: "Baguio", lat: 16.4023, lng: 120.5960, pm25: 18.5, no2: 22.3, asir: 4.2, aqi: 65 },
  { name: "Iloilo City", lat: 10.7202, lng: 122.5621, pm25: 24.7, no2: 30.5, asir: 5.0, aqi: 76 },
  { name: "Bacolod", lat: 10.6770, lng: 122.9506, pm25: 26.3, no2: 31.8, asir: 5.4, aqi: 80 },
  { name: "Cagayan de Oro", lat: 8.4542, lng: 124.6319, pm25: 23.9, no2: 29.2, asir: 4.9, aqi: 74 },
  { name: "General Santos", lat: 6.1164, lng: 125.1716, pm25: 21.5, no2: 26.8, asir: 4.5, aqi: 70 },
  { name: "Antipolo", lat: 14.5863, lng: 121.1758, pm25: 30.8, no2: 37.5, asir: 6.1, aqi: 88 },
  { name: "Pasay", lat: 14.5378, lng: 121.0014, pm25: 36.5, no2: 44.8, asir: 6.9, aqi: 101 },
  { name: "Las Piñas", lat: 14.4453, lng: 120.9842, pm25: 31.2, no2: 38.5, asir: 6.4, aqi: 89 },
  { name: "Parañaque", lat: 14.4793, lng: 121.0198, pm25: 33.5, no2: 41.0, asir: 6.6, aqi: 94 },
  { name: "Mandaluyong", lat: 14.5794, lng: 121.0359, pm25: 34.2, no2: 42.0, asir: 6.7, aqi: 96 },
  { name: "Marikina", lat: 14.6507, lng: 121.1029, pm25: 29.8, no2: 36.5, asir: 6.2, aqi: 86 },
];

const WAQI_TOKEN = "78607c557f88523f84b1bdde147bb6f087e6c0ff";

// Convert AQI to PM2.5
const aqiToPm25 = (aqi: number): number => {
  if (aqi <= 50) return aqi * 0.24;
  if (aqi <= 100) return 12 + (aqi - 50) * 0.68;
  if (aqi <= 150) return 35.5 + (aqi - 100) * 0.49;
  if (aqi <= 200) return 55.5 + (aqi - 150) * 0.99;
  if (aqi <= 300) return 150.5 + (aqi - 200) * 0.995;
  return 250.5 + (aqi - 300) * 0.995;
};

const pm25ToNo2 = (pm25: number): number => {
  return pm25 * 1.2;
};

const getAqiColor = (aqi: number): string => {
  if (aqi <= 50) return "#00e400";
  if (aqi <= 100) return "#ffff00";
  if (aqi <= 150) return "#ff7e00";
  if (aqi <= 200) return "#ff0000";
  if (aqi <= 300) return "#8f3f97";
  return "#7e0023";
};

const getAqiLabel = (aqi: number): string => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy (Sensitive)";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

export default function LocationSelector({ onLocationSelect, selectedLocation }: LocationSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState<LocationData[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [airQualityStations, setAirQualityStations] = useState<AirQualityStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const viewRef = useRef<any>(null);
  const graphicsLayerRef = useRef<any>(null);
  const searchTimeoutRef = useRef<any>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);
  const airQualityWidgetRef = useRef<any>(null);
  const customLegendWidgetRef = useRef<any>(null);
  const [healthFacilities, setHealthFacilities] = useState<any[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  // Load ArcGIS API
  useEffect(() => {
    const loadArcGIS = () => {
      if ((window as any).require) {
        setMapLoaded(true);
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://js.arcgis.com/4.28/esri/themes/light/main.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://js.arcgis.com/4.28/";
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadArcGIS();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const initMap = () => {
      (window as any).require([
        "esri/Map",
        "esri/views/MapView",
        "esri/Graphic",
        "esri/layers/GraphicsLayer",
        "esri/widgets/Fullscreen",
        "esri/widgets/Legend",
        "esri/widgets/Expand",
      ], (Map: any, MapView: any, Graphic: any, GraphicsLayer: any, Fullscreen: any, Legend: any, Expand: any) => {
        const map = new Map({
          basemap: "streets-navigation-vector"
        });

        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [121.7740, 12.8797], // Philippines center
          zoom: 6
        });

        const graphicsLayer = new GraphicsLayer();
        map.add(graphicsLayer);

        mapInstanceRef.current = map;
        viewRef.current = view;
        graphicsLayerRef.current = graphicsLayer;

        // Add Fullscreen widget
        const fullscreen = new Fullscreen({
          view: view
        });
        view.ui.add(fullscreen, "top-left");

        // Create Air Quality Info Widget (custom HTML)
        const airQualityDiv = document.createElement("div");
        airQualityDiv.className = "air-quality-widget";
        airQualityDiv.style.cssText = `
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 240px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        airQualityDiv.innerHTML = `
          <div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">Air Quality Index</div>
          <div style="font-size: 36px; font-weight: bold; color: #10b981; margin-bottom: 4px;">-- AQI</div>
          <div style="font-size: 14px; font-weight: 600; color: #10b981; margin-bottom: 10px;">--</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
            <div style="background: #f3f4f6; border-radius: 6px; padding: 8px;">
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">PM2.5</div>
              <div style="font-weight: bold; color: #9333ea; font-size: 13px;">-- µg/m³</div>
            </div>
            <div style="background: #f3f4f6; border-radius: 6px; padding: 8px;">
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">NO2</div>
              <div style="font-weight: bold; color: #3b82f6; font-size: 13px;">-- ppb</div>
            </div>
          </div>
          <div style="background: #fef3c7; border-radius: 6px; padding: 8px;">
            <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">ASIR</div>
            <div style="font-weight: bold; color: #f59e0b; font-size: 13px;">-- per 100k</div>
          </div>
        `;

        const airQualityExpand = new Expand({
          view: view,
          content: airQualityDiv,
          expandIconClass: "esri-icon-description",
          expandTooltip: "Air Quality Info",
          expanded: false
        });
        view.ui.add(airQualityExpand, "top-right");
        airQualityWidgetRef.current = { expand: airQualityExpand, div: airQualityDiv };

        // Create Custom Legend Widget
        const customLegendDiv = document.createElement("div");
        customLegendDiv.className = "custom-legend-widget";
        customLegendDiv.style.cssText = `
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 240px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        customLegendDiv.innerHTML = `
          <div style="font-weight: bold; font-size: 13px; margin-bottom: 10px; color: #1f2937;">Map Legend</div>
          
          <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
            <div style="font-weight: 600; font-size: 11px; color: #374151; margin-bottom: 6px;">Selected Location</div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280;">
              <svg width="14" height="14" viewBox="0 0 24 36">
                <path d="M12 0C7.03 0 3 4.03 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.97-4.03-9-9-9z" fill="#FF8C00"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
              </svg>
              <span>Your selected point</span>
            </div>
          </div>
           <div>
            <div style="font-weight: 600; font-size: 11px; color: #374151; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              <svg width="12" height="12" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="#228B22" stroke="white" stroke-width="2"/>
                <rect x="14" y="8" width="4" height="16" fill="white"/>
                <rect x="8" y="14" width="16" height="4" fill="white"/>
              </svg>
              Health Facilities (10km)
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 10px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <svg width="12" height="12" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="14" fill="#228B22" stroke="white" stroke-width="2"/>
                  <rect x="14" y="8" width="4" height="16" fill="white"/>
                  <rect x="8" y="14" width="16" height="4" fill="white"/>
                </svg>
                <span style="color: #6b7280;">Government (<span id="gov-count">0</span>)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <svg width="12" height="12" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="14" fill="#1E90FF" stroke="white" stroke-width="2"/>
                  <rect x="14" y="8" width="4" height="16" fill="white"/>
                  <rect x="8" y="14" width="16" height="4" fill="white"/>
                </svg>
                <span style="color: #6b7280;">Private (<span id="priv-count">0</span>)</span>
              </div>
              <div style="color: #9ca3af; margin-top: 2px; padding-top: 4px; border-top: 1px solid #e5e7eb; font-size: 10px;">
                Total: <span id="total-count">0</span> facilities
              </div>
            </div>
          </div>
          <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
            <div style="font-weight: 600; font-size: 11px; color: #374151; margin-bottom: 6px;">Air Quality Stations</div>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 10px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: #00e400; flex-shrink: 0;"></div>
                <span style="color: #6b7280;">0-50 - Good</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: #ffff00; flex-shrink: 0;"></div>
                <span style="color: #6b7280;">51-100 - Moderate</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: #ff7e00; flex-shrink: 0;"></div>
                <span style="color: #6b7280;">101-150 - Unhealthy</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: #ff0000; flex-shrink: 0;"></div>
                <span style="color: #6b7280;">151-200 - Unhealthy</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: #8f3f97; flex-shrink: 0;"></div>
                <span style="color: #6b7280;">201-300 - Very Unhealthy</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: #7e0023; flex-shrink: 0;"></div>
                <span style="color: #6b7280;">300+ - Hazardous</span>
              </div>
            </div>
          </div>
          
         
        `;

        const customLegendExpand = new Expand({
          view: view,
          content: customLegendDiv,
          expandIconClass: "esri-icon-layer-list",
          expandTooltip: "Map Legend",
          expanded: false
        });
        view.ui.add(customLegendExpand, "top-right");
        customLegendWidgetRef.current = { expand: customLegendExpand, div: customLegendDiv };

        // Disable default double-click zoom behavior
        view.on("double-click", (event: any) => {
          event.stopPropagation(); // Prevent default zoom
          const lat = event.mapPoint.latitude;
          const lng = event.mapPoint.longitude;
          handleMapClick(lat, lng);
        });
      });
    };

    initMap();
  }, [mapLoaded]);

  // Fetch air quality data
  useEffect(() => {
    if (mapLoaded) {
      fetchAirQualityData();
    }
  }, [mapLoaded]);

  // Update widgets when location or facilities change
  useEffect(() => {
    if (selectedLocation && airQualityWidgetRef.current) {
      const { div } = airQualityWidgetRef.current;
      const aqiColor = selectedLocation.aqi ? getAqiColor(selectedLocation.aqi) : '#10b981';
      div.innerHTML = `
        <div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">Air Quality Index</div>
        <div style="font-size: 36px; font-weight: bold; color: ${aqiColor}; margin-bottom: 4px;">${selectedLocation.aqi || '--'} AQI</div>
        <div style="font-size: 14px; font-weight: 600; color: ${aqiColor}; margin-bottom: 10px;">${selectedLocation.aqi ? getAqiLabel(selectedLocation.aqi) : '--'}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
          <div style="background: #f3f4f6; border-radius: 6px; padding: 8px;">
            <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">PM2.5</div>
            <div style="font-weight: bold; color: #9333ea; font-size: 13px;">${selectedLocation.pm25?.toFixed(1) || '--'} µg/m³</div>
          </div>
          <div style="background: #f3f4f6; border-radius: 6px; padding: 8px;">
            <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">NO2</div>
            <div style="font-weight: bold; color: #3b82f6; font-size: 13px;">${selectedLocation.no2?.toFixed(1) || '--'} ppb</div>
          </div>
        </div>
        <div style="background: #fef3c7; border-radius: 6px; padding: 8px;">
          <div style="color: #6b7280; font-size: 10px; margin-bottom: 2px;">ASIR</div>
          <div style="font-weight: bold; color: #f59e0b; font-size: 13px;">${selectedLocation.asir || '--'} per 100k</div>
        </div>
      `;
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (customLegendWidgetRef.current) {
      const govCount = healthFacilities.filter(f => f.facility_type === "government").length;
      const privCount = healthFacilities.filter(f => f.facility_type === "private").length;
      const totalCount = healthFacilities.length;
      
      const govCountEl = customLegendWidgetRef.current.div.querySelector('#gov-count');
      const privCountEl = customLegendWidgetRef.current.div.querySelector('#priv-count');
      const totalCountEl = customLegendWidgetRef.current.div.querySelector('#total-count');
      
      if (govCountEl) govCountEl.textContent = govCount.toString();
      if (privCountEl) privCountEl.textContent = privCount.toString();
      if (totalCountEl) totalCountEl.textContent = totalCount.toString();
    }
  }, [healthFacilities]);

  // Update heat map when stations change
  useEffect(() => {
    if (airQualityStations.length > 0 && graphicsLayerRef.current) {
      updateHeatMap();
    }
  }, [airQualityStations, healthFacilities]);

  const fetchAirQualityData = async () => {
    setLoading(true);
    setError(null);
    try {
      const bounds = {
        latlng: "4.5,116.0,21.0,127.0"
      };

      const response = await fetch(
        `https://api.waqi.info/map/bounds/?latlng=${bounds.latlng}&token=${WAQI_TOKEN}`
      );

      const data = await response.json();

      if (data.status === "ok" && data.data && data.data.length > 0) {
        setAirQualityStations(data.data);
      } else {
        // Use Philippine cities as fallback stations
        const fallbackStations: AirQualityStation[] = philippinesCities.map((city, idx) => ({
          uid: idx,
          aqi: city.aqi?.toString() || "50",
          lat: city.lat,
          lon: city.lng,
          station: {
            name: city.name
          }
        }));
        setAirQualityStations(fallbackStations);
        console.log("Using fallback air quality data for Philippines");
      }
    } catch (err) {
      console.error("Error fetching air quality data:", err);
      // Use Philippine cities as fallback stations
      const fallbackStations: AirQualityStation[] = philippinesCities.map((city, idx) => ({
        uid: idx,
        aqi: city.aqi?.toString() || "50",
        lat: city.lat,
        lon: city.lng,
        station: {
          name: city.name
        }
      }));
      setAirQualityStations(fallbackStations);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthFacilities = async (lat: number, lng: number, radiusKm: number = 10) => {
    setLoadingFacilities(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await axios.get(`${API_URL}/health-facilities/search/radius`, {
        params: {
          latitude: lat,
          longitude: lng,
          radius_km: radiusKm
        }
      });

      if (response.data && response.data.facilities) {
        setHealthFacilities(response.data.facilities);
      }
    } catch (err) {
      console.error("Error fetching health facilities:", err);
      setHealthFacilities([]);
    } finally {
      setLoadingFacilities(false);
    }
  };

  const updateHeatMap = () => {
    if (!graphicsLayerRef.current) return;

    (window as any).require(["esri/Graphic", "esri/geometry/Point"], (Graphic: any, Point: any) => {
      // Save the selection marker before clearing
      const graphics = graphicsLayerRef.current.graphics.items;
      let selectionMarker = null;
      graphics.forEach((g: any) => {
        if (g.attributes && g.attributes.isSelection) {
          selectionMarker = g.clone(); // Clone the selection marker
        }
      });
      
      graphicsLayerRef.current.removeAll();

      airQualityStations.forEach((station) => {
        const aqi = parseInt(station.aqi);
        if (isNaN(aqi)) return;

        const point = new Point({
          longitude: station.lon,
          latitude: station.lat
        });

        const symbol = {
          type: "simple-marker",
          color: getAqiColor(aqi),
          size: "12px",
          outline: {
            color: [255, 255, 255, 0.8],
            width: 2
          }
        };

        const attributes = {
          name: station.station.name,
          aqi: aqi,
          pm25: aqiToPm25(aqi).toFixed(1),
          no2: pm25ToNo2(aqiToPm25(aqi)).toFixed(1),
          quality: getAqiLabel(aqi)
        };

        const popupTemplate = {
          title: "{name}",
          content: `
            <div style="padding: 8px;">
              <div style="margin-bottom: 8px;">
                <strong style="color: ${getAqiColor(aqi)}">AQI: {aqi}</strong> - {quality}
              </div>
              <div style="font-size: 12px; color: #666;">
                PM2.5: ~{pm25} µg/m³<br/>
                NO2: ~{no2} ppb
              </div>
            </div>
          `
        };

        const graphic = new Graphic({
          geometry: point,
          symbol: symbol,
          attributes: attributes,
          popupTemplate: popupTemplate
        });

        graphicsLayerRef.current.add(graphic);
      });

      // Add health facilities markers
      healthFacilities.forEach((facility) => {
        const point = new Point({
          longitude: facility.longitude,
          latitude: facility.latitude
        });

        // Custom hospital icon with cross symbol
        const color = facility.facility_type === "government" ? "#228B22" : "#1E90FF"; // Green for government, Blue for private
        const symbol = {
          type: "picture-marker",
          url: "data:image/svg+xml;base64," + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
              <defs>
                <filter id="hospital-shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                  <feOffset dx="0" dy="1" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.4"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <!-- Background circle -->
              <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2" filter="url(#hospital-shadow)"/>
              <!-- White cross -->
              <rect x="14" y="8" width="4" height="16" fill="white" rx="1"/>
              <rect x="8" y="14" width="16" height="4" fill="white" rx="1"/>
            </svg>
          `),
          width: "24px",
          height: "24px"
        };

        const popupTemplate = {
          title: `🏥 ${facility.facility_name}`,
          content: `
            <div style="padding: 8px;">
              <div style="margin-bottom: 8px;">
                <strong>${facility.facility_type === "government" ? "Government" : "Private"} Facility</strong>
              </div>
              <div style="font-size: 12px; color: #666;">
                📍 ${facility.address}<br/>
                📏 Distance: ${facility.distance_km} km<br/>
                ${facility.bed_capacity ? `🛏️ Beds: ${facility.bed_capacity}<br/>` : ""}
                ${facility.contact_number ? `📞 ${facility.contact_number}<br/>` : ""}
                ${facility.services_offered ? `🏥 ${facility.services_offered}` : ""}
              </div>
            </div>
          `
        };

        const graphic = new Graphic({
          geometry: point,
          symbol: symbol,
          attributes: {
            name: facility.facility_name,
            type: facility.facility_type,
            isHealthFacility: true
          },
          popupTemplate: popupTemplate
        });

        graphicsLayerRef.current.add(graphic);
      });
      
      // Re-add the selection marker if it existed (keep it on top)
      if (selectionMarker) {
        graphicsLayerRef.current.add(selectionMarker);
      }
    });
  };

  // Search locations using ArcGIS Geocoding API
  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setSearchLoading(true);
    try {
      // Use ArcGIS World Geocoding Service
      const response = await fetch(
        `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?` +
        `text=${encodeURIComponent(query)}&` +
        `f=json&` +
        `countryCode=PHL&` + // Restrict to Philippines
        `maxSuggestions=10`
      );

      const data = await response.json();

      if (data.suggestions && data.suggestions.length > 0) {
        setSearchResults(data.suggestions);
        setShowDropdown(true);
      } else {
        // Fallback to local cities if no results
        const filtered = philippinesCities.filter((city) =>
          city.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredCities(filtered);
        setSearchResults([]);
        setShowDropdown(filtered.length > 0);
      }
    } catch (err) {
      console.error("Error searching locations:", err);
      // Fallback to local search
      const filtered = philippinesCities.filter((city) =>
        city.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCities(filtered);
      setSearchResults([]);
      setShowDropdown(filtered.length > 0);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    // Don't search if we're in the middle of selecting a location
    if (isSelectingRef.current) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Only search if query is at least 3 characters and dropdown should be shown
    if (searchQuery.trim().length >= 3 && !searchQuery.startsWith("Custom:")) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(searchQuery);
      }, 300);
    } else {
      // Clear results if query is too short or is a custom location
      setSearchResults([]);
      setFilteredCities([]);
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchAirQualityForLocation = async (lat: number, lng: number): Promise<{ pm25: number; no2: number; aqi: number }> => {
    // First, try to find exact match in our Philippine cities data
    const exactCity = philippinesCities.find(
      city => Math.abs(city.lat - lat) < 0.01 && Math.abs(city.lng - lng) < 0.01
    );

    if (exactCity && exactCity.pm25 && exactCity.no2 && exactCity.aqi) {
      return {
        pm25: exactCity.pm25,
        no2: exactCity.no2,
        aqi: exactCity.aqi
      };
    }

    // Try WAQI API
    try {
      const response = await fetch(
        `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${WAQI_TOKEN}`
      );
      const data = await response.json();

      if (data.status === "ok" && data.data && data.data.aqi) {
        const aqi = data.data.aqi;
        const pm25 = data.data.iaqi?.pm25?.v || aqiToPm25(aqi);
        const no2 = data.data.iaqi?.no2?.v || pm25ToNo2(pm25);

        return { pm25, no2, aqi };
      }
    } catch (err) {
      console.error("Error fetching location air quality:", err);
    }

    // Fallback: Find nearest city and use its data
    const nearestCity = philippinesCities.reduce((prev, curr) => {
      const prevDist = Math.sqrt(Math.pow(prev.lat - lat, 2) + Math.pow(prev.lng - lng, 2));
      const currDist = Math.sqrt(Math.pow(curr.lat - lat, 2) + Math.pow(curr.lng - lng, 2));
      return currDist < prevDist ? curr : prev;
    });

    return {
      pm25: nearestCity.pm25 || 30,
      no2: nearestCity.no2 || 35,
      aqi: nearestCity.aqi || 85
    };
  };

  const addMarker = (lat: number, lng: number, title: string) => {
    if (!graphicsLayerRef.current) return;

    (window as any).require(["esri/Graphic", "esri/geometry/Point"], (Graphic: any, Point: any) => {
      // Remove previous selection marker
      const graphics = graphicsLayerRef.current.graphics.items;
      graphics.forEach((g: any) => {
        if (g.attributes && g.attributes.isSelection) {
          graphicsLayerRef.current.remove(g);
        }
      });

      const point = new Point({
        longitude: lng,
        latitude: lat
      });

      // Orange pin icon marker
      const symbol = {
        type: "picture-marker",
        url: "data:image/svg+xml;base64," + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="48" height="72">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- Pin shadow -->
            <ellipse cx="12" cy="34" rx="6" ry="2" fill="rgba(0,0,0,0.3)"/>
            <!-- Pin body -->
            <path d="M12 0C7.03 0 3 4.03 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.97-4.03-9-9-9z" 
                  fill="#FF8C00" 
                  stroke="#FF6600" 
                  stroke-width="1.5"
                  filter="url(#shadow)"/>
            <!-- Inner circle -->
            <circle cx="12" cy="9" r="4" fill="white" opacity="0.9"/>
            <!-- Center dot -->
            <circle cx="12" cy="9" r="2" fill="#FF6600"/>
          </svg>
        `),
        width: "48px",
        height: "72px",
        yoffset: "36px" // Offset so the pin point is at the location
      };

      const graphic = new Graphic({
        geometry: point,
        symbol: symbol,
        attributes: {
          isSelection: true,
          name: title
        },
        popupTemplate: {
          title: `📍 ${title}`,
          content: `
            <div style="padding: 8px;">
              <div style="font-size: 14px; font-weight: bold; color: #FF8C00; margin-bottom: 8px;">
                Selected Location
              </div>
              <div style="font-size: 12px; color: #666;">
                📌 Latitude: ${lat.toFixed(6)}<br/>
                📌 Longitude: ${lng.toFixed(6)}
              </div>
            </div>
          `
        }
      });

      graphicsLayerRef.current.add(graphic);
    });
  };

  const handleSearchResultSelect = async (result: any) => {
    isSelectingRef.current = true; // Set flag to prevent search
    setShowDropdown(false); // Close dropdown immediately
    setSearchLoading(true);
    try {
      // Get full location details from magicKey
      const response = await fetch(
        `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?` +
        `magicKey=${result.magicKey}&` +
        `f=json`
      );

      const data = await response.json();

      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        const lat = candidate.location.y;
        const lng = candidate.location.x;
        const locationName = candidate.address;

        // Set search query without triggering search
        setSearchQuery(locationName);
        setSearchResults([]);
        setFilteredCities([]);

        if (viewRef.current) {
          viewRef.current.goTo({
            center: [lng, lat],
            zoom: 14
          });
        }

        addMarker(lat, lng, locationName);

        // Fetch air quality for this location
        const airQuality = await fetchAirQualityForLocation(lat, lng);

        // Find nearest city for ASIR
        const nearestCity = philippinesCities.reduce((prev, curr) => {
          const prevDist = Math.sqrt(Math.pow(prev.lat - lat, 2) + Math.pow(prev.lng - lng, 2));
          const currDist = Math.sqrt(Math.pow(curr.lat - lat, 2) + Math.pow(curr.lng - lng, 2));
          return currDist < prevDist ? curr : prev;
        });

        // Fetch health facilities within 10km
        await fetchHealthFacilities(lat, lng, 10);

        onLocationSelect({
          name: locationName,
          lat,
          lng,
          pm25: airQuality.pm25,
          no2: airQuality.no2,
          asir: nearestCity.asir,
          aqi: airQuality.aqi,
        });
      }
    } catch (err) {
      console.error("Error getting location details:", err);
    } finally {
      setSearchLoading(false);
      // Reset flag after a short delay to allow state to settle
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 500);
    }
  };

  const handleCitySelect = async (city: LocationData) => {
    isSelectingRef.current = true; // Set flag to prevent search
    setShowDropdown(false); // Close dropdown immediately

    // Set search query without triggering search
    setSearchQuery(city.name);
    setSearchResults([]);
    setFilteredCities([]);

    if (viewRef.current) {
      viewRef.current.goTo({
        center: [city.lng, city.lat],
        zoom: 12
      });
    }

    addMarker(city.lat, city.lng, city.name);

    setLoading(true);
    const airQuality = await fetchAirQualityForLocation(city.lat, city.lng);
    
    // Fetch health facilities within 10km
    await fetchHealthFacilities(city.lat, city.lng, 10);
    
    setLoading(false);

    onLocationSelect({
      ...city,
      pm25: airQuality.pm25,
      no2: airQuality.no2,
      aqi: airQuality.aqi,
    });

    // Reset flag after a short delay
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 500);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    isSelectingRef.current = true; // Set flag to prevent search
    setLoading(true);
    const airQuality = await fetchAirQualityForLocation(lat, lng);

    const nearestCity = philippinesCities.reduce((prev, curr) => {
      const prevDist = Math.sqrt(Math.pow(prev.lat - lat, 2) + Math.pow(prev.lng - lng, 2));
      const currDist = Math.sqrt(Math.pow(curr.lat - lat, 2) + Math.pow(curr.lng - lng, 2));
      return currDist < prevDist ? curr : prev;
    });

    // Fetch health facilities within 10km
    await fetchHealthFacilities(lat, lng, 10);

    setLoading(false);

    const locationName = `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    addMarker(lat, lng, locationName);

    onLocationSelect({
      name: locationName,
      lat,
      lng,
      pm25: airQuality.pm25,
      no2: airQuality.no2,
      asir: nearestCity.asir,
      aqi: airQuality.aqi,
    });

    // Set search query without triggering search
    setSearchQuery(`Custom: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setSearchResults([]);
    setFilteredCities([]);
    setShowDropdown(false);

    // Reset flag after a short delay
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 500);
  };

  const clearSelection = () => {
    setSearchQuery("");
    if (viewRef.current) {
      viewRef.current.goTo({
        center: [121.7740, 12.8797],
        zoom: 6
      });
    }
    if (graphicsLayerRef.current) {
      const graphics = graphicsLayerRef.current.graphics.items;
      graphics.forEach((g: any) => {
        if (g.attributes && g.attributes.isSelection) {
          graphicsLayerRef.current.remove(g);
        }
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-4 space-y-2">
        {/* Guide Message */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
          <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <strong>How to select a location:</strong> Search for a city or <strong>double-click</strong> anywhere on the map to place a pin and view air quality data.
          </div>
        </div>
        
        <div className="relative" ref={searchContainerRef}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Philippine cities..."
                className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={clearSelection}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            {(loading || searchLoading) && (
              <Loader className="animate-spin text-purple-600" size={20} />
            )}
          </div>

          {showDropdown && (searchResults.length > 0 || filteredCities.length > 0) && (
            <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
              {/* ArcGIS Search Results */}
              {searchResults.map((result, idx) => (
                <button
                  key={`search-${idx}`}
                  onClick={() => handleSearchResultSelect(result)}
                  className="w-full px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <MapPin size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{result.text}</div>
                    {result.magicKey && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        📍 {result.text}
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* Local Cities Fallback */}
              {filteredCities.map((city, idx) => (
                <button
                  key={`city-${idx}`}
                  onClick={() => handleCitySelect(city)}
                  className="w-full px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <MapPin size={18} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{city.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      AQI: {city.aqi} • PM2.5: {city.pm25} • NO2: {city.no2}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
            {error}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1">
        {/* ArcGIS Map - widgets are added programmatically */}
        <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg" style={{ width: "100%", height: "400px" }}>
          <div
            ref={mapRef}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
