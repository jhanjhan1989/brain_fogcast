# Map Markers Guide

## Overview
The map now displays different types of markers to help you visualize locations, air quality, and health facilities.

## Marker Types

### 1. 📍 Selected Location (Orange Pin)
- **Appearance**: Large orange pin icon with white center
- **Size**: 48x72 pixels
- **Purpose**: Shows your currently selected location
- **Features**:
  - Pin point positioned exactly at the coordinates
  - Shadow effect for depth
  - White inner circle with orange center dot
  - Popup shows exact latitude/longitude

**When it appears**:
- When you click on the map
- When you select a city from search
- When you choose a location from dropdown

### 2. 🟢 Air Quality Stations (Colored Circles)
- **Appearance**: Small circular markers with color-coded AQI levels
- **Size**: 12px diameter
- **Colors**:
  - 🟢 Green (0-50): Good
  - 🟡 Yellow (51-100): Moderate
  - 🟠 Orange (101-150): Unhealthy for Sensitive Groups
  - 🔴 Red (151-200): Unhealthy
  - 🟣 Purple (201-300): Very Unhealthy
  - 🟤 Maroon (300+): Hazardous

**Popup shows**:
- Station name
- AQI value and quality level
- Estimated PM2.5 and NO2 levels

### 3. 🏥 Health Facilities (Colored Squares)
- **Appearance**: Square markers within 10km radius
- **Size**: 14px
- **Colors**:
  - 🟩 Green Square: Government facilities
  - 🟦 Blue Square: Private facilities
- **Border**: White outline (2px) for visibility

**Popup shows**:
- Facility name
- Type (Government/Private)
- Address
- Distance from selected location
- Bed capacity
- Contact information
- Services offered

## Map Legend

The right sidebar shows a comprehensive legend with:

### Selected Location Section
- Orange pin icon
- Label: "Your selected point"

### Air Quality Stations Section
- All 6 AQI color ranges
- Range values and quality labels

### Health Facilities Section
- Government facilities count (green square)
- Private facilities count (blue square)
- Total facilities within 10km
- Loading indicator when fetching

## Visual Hierarchy

1. **Most Prominent**: Orange pin (selected location) - largest and most visible
2. **Medium**: Health facility squares - easy to spot, distinct shape
3. **Background**: AQI circles - smaller, provide context

## Interaction

### Click on Markers
- **Orange Pin**: Shows selected location details with coordinates
- **AQI Circles**: Shows air quality data for that station
- **Health Squares**: Shows complete facility information

### Zoom Behavior
- All markers scale appropriately with zoom level
- Orange pin remains visible at all zoom levels
- Health facilities only show within 10km of selected location

## Color Accessibility

All marker colors are chosen for:
- High contrast against map background
- Distinguishable from each other
- Colorblind-friendly combinations
- Clear visual hierarchy

## Technical Details

### Orange Pin SVG
- Custom SVG with shadow filter
- Base64 encoded for performance
- Y-offset ensures pin point is at exact coordinates
- Responsive to map zoom

### Marker Layers
1. Base layer: AQI stations (always visible)
2. Middle layer: Health facilities (10km radius)
3. Top layer: Selected location (always on top)

## Usage Tips

1. **Finding Facilities**: Select a location to see nearby health facilities
2. **Air Quality**: Hover over colored circles to see AQI details
3. **Navigation**: Click and drag to pan, scroll to zoom
4. **Selection**: Click anywhere on map to place orange pin
5. **Search**: Use search bar for quick city selection

## Mobile Considerations

- Markers are touch-friendly (minimum 44x44 touch target)
- Popups are optimized for small screens
- Legend is collapsible on mobile devices
- Pin size is appropriate for finger taps
