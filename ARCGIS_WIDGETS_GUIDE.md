# ArcGIS Widgets Integration Guide

## Overview
Integrated ArcGIS's built-in widgets for fullscreen mode and legend display, providing native map controls with professional appearance and functionality.

## Widgets Added

### 1. Fullscreen Widget
- **Location**: Top-left corner of the map
- **Type**: Native ArcGIS Fullscreen widget
- **Functionality**: 
  - Click to enter fullscreen mode
  - Click again to exit fullscreen
  - Uses browser's native fullscreen API
  - Keyboard shortcut: ESC to exit

### 2. Legend Widget (Expandable)
- **Location**: Top-right corner of the map
- **Type**: ArcGIS Legend widget wrapped in Expand widget
- **Style**: Card style for clean appearance
- **Functionality**:
  - Click to expand/collapse legend
  - Shows all map layers and symbols
  - Automatically updates with map changes
  - Collapsible to save space

## Widget Configuration

### Fullscreen Widget
```typescript
const fullscreen = new Fullscreen({
  view: view
});
view.ui.add(fullscreen, "top-left");
```

**Features:**
- Native browser fullscreen
- Automatic icon change
- ESC key support
- Mobile compatible
- No custom code needed

### Legend Widget with Expand
```typescript
const legend = new Legend({
  view: view,
  style: "card"
});

const legendExpand = new Expand({
  view: view,
  content: legend,
  expandIconClass: "esri-icon-layer-list",
  expandTooltip: "Show Legend"
});
view.ui.add(legendExpand, "top-right");
```

**Features:**
- Expandable/collapsible
- Card-style display
- Layer list icon
- Tooltip on hover
- Auto-updates with layers

## Widget Positions

### Map Layout
```
┌─────────────────────────────────────┐
│ [⛶]                          [≡]   │  ← Widgets
│                                     │
│                                     │
│              MAP                    │
│                                     │
│                                     │
└─────────────────────────────────────┘

[⛶] = Fullscreen widget (top-left)
[≡] = Legend expand widget (top-right)
```

### Fullscreen Mode
```
┌─────────────────────────────────────┐
│ [⛶]                          [≡]   │
│                                     │
│                                     │
│         MAP (Full Screen)           │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

## Legend Content

The ArcGIS Legend widget automatically displays:

### 1. Graphics Layer
- **Selected Location**: Orange pin icon
- **AQI Stations**: Colored circles with ranges
  - Green (0-50): Good
  - Yellow (51-100): Moderate
  - Orange (101-150): Unhealthy
  - Red (151-200): Unhealthy
  - Purple (201-300): Very Unhealthy
  - Maroon (300+): Hazardous
- **Health Facilities**: Hospital cross icons
  - Green: Government facilities
  - Blue: Private facilities

### 2. Base Map Layers
- Streets
- Labels
- Boundaries
- Other basemap features

## Benefits of ArcGIS Widgets

### 1. Native Integration
- Built specifically for ArcGIS maps
- Optimized performance
- Consistent behavior
- Professional appearance

### 2. Automatic Updates
- Legend updates when layers change
- Symbols match map exactly
- No manual synchronization needed
- Always accurate

### 3. Accessibility
- Keyboard navigation built-in
- Screen reader support
- ARIA labels included
- WCAG compliant

### 4. Mobile Support
- Touch-friendly
- Responsive design
- Gesture support
- Optimized for small screens

### 5. Internationalization
- Multi-language support
- RTL language support
- Locale-aware formatting
- Customizable text

## Comparison: Custom vs ArcGIS Widgets

### Custom Overlay Panels (Kept)
- **Location Info**: Selected location details
- **Air Quality Data**: PM2.5, NO2, ASIR values
- **Expandable**: User can collapse for more space
- **Purpose**: Show selected location information

### ArcGIS Widgets (New)
- **Fullscreen**: Native browser fullscreen
- **Legend**: All map layers and symbols
- **Expandable**: Built-in expand/collapse
- **Purpose**: Map navigation and layer information

### Why Both?
- **Custom Panels**: Specific to our application data
- **ArcGIS Widgets**: Standard map controls
- **Complementary**: Different purposes, work together
- **Best of Both**: Custom data + native controls

## User Experience

### Fullscreen Widget
1. **Click**: Enter fullscreen mode
2. **Map Expands**: Fills entire screen
3. **ESC Key**: Exit fullscreen
4. **Click Again**: Exit fullscreen
5. **Smooth**: Native browser transition

### Legend Widget
1. **Click Icon**: Expand legend panel
2. **View Layers**: See all map symbols
3. **Auto-Update**: Changes with map
4. **Click Again**: Collapse to save space
5. **Tooltip**: Hover for description

## Technical Details

### Widget Loading
```typescript
(window as any).require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Fullscreen",      // ← Fullscreen widget
  "esri/widgets/Legend",           // ← Legend widget
  "esri/widgets/Expand",           // ← Expand container
], (Map, MapView, Graphic, GraphicsLayer, Fullscreen, Legend, Expand) => {
  // Widget initialization
});
```

### Widget Positioning
- **top-left**: Fullscreen widget
- **top-right**: Legend expand widget
- **Z-index**: Managed by ArcGIS
- **Responsive**: Auto-adjusts on mobile

### Widget Styling
- **Theme**: Matches ArcGIS theme
- **Dark Mode**: Supports dark theme
- **Customizable**: Can override CSS
- **Consistent**: Matches other ArcGIS apps

## Browser Compatibility

### Fullscreen API Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support
- IE11: Partial support (fallback)

### Legend Widget Support
- All modern browsers
- Mobile browsers
- Tablets
- Desktop applications

## Keyboard Shortcuts

### Fullscreen Widget
- **Click**: Toggle fullscreen
- **ESC**: Exit fullscreen (browser native)
- **F11**: Browser fullscreen (different from widget)

### Legend Widget
- **Click**: Toggle expand/collapse
- **Tab**: Navigate to widget
- **Enter/Space**: Activate widget
- **ESC**: Collapse if expanded

## Mobile Behavior

### Touch Gestures
- **Tap**: Activate widget
- **Swipe**: Pan map (not affected by widgets)
- **Pinch**: Zoom map (not affected by widgets)
- **Double-tap**: Select location (our custom handler)

### Responsive Layout
- Widgets scale appropriately
- Touch targets are large enough
- No overlap with custom panels
- Optimized for small screens

## Customization Options

### Fullscreen Widget
```typescript
const fullscreen = new Fullscreen({
  view: view,
  element: document.body  // Optional: specify element
});
```

### Legend Widget
```typescript
const legend = new Legend({
  view: view,
  style: "card",           // or "classic"
  layerInfos: [],          // Optional: customize layers
  respectLayerVisibility: true
});
```

### Expand Widget
```typescript
const expand = new Expand({
  view: view,
  content: legend,
  expanded: false,         // Start collapsed
  mode: "floating",        // or "drawer"
  expandIconClass: "esri-icon-layer-list",
  expandTooltip: "Show Legend"
});
```

## Future Enhancements

### Additional Widgets
1. **BasemapGallery**: Switch between basemaps
2. **Search**: Search for locations
3. **Locate**: Find user's location
4. **Measurement**: Measure distances
5. **Print**: Print the map

### Custom Widgets
1. **Air Quality Filter**: Filter by AQI level
2. **Facility Filter**: Filter health facilities
3. **Time Slider**: View historical data
4. **Export**: Export map as image

## Testing Checklist

- [x] Fullscreen widget displays
- [x] Fullscreen mode works
- [x] ESC key exits fullscreen
- [x] Legend widget displays
- [x] Legend expands/collapses
- [x] Legend shows all layers
- [x] Legend updates automatically
- [x] Widgets don't overlap
- [x] Mobile touch works
- [x] Dark mode compatible

## Troubleshooting

### Widget Not Showing
- Check ArcGIS API loaded
- Verify widget imports
- Check view.ui.add() called
- Inspect browser console

### Legend Empty
- Ensure layers added to map
- Check layer visibility
- Verify graphics layer has items
- Check legend style setting

### Fullscreen Not Working
- Check browser permissions
- Verify HTTPS (required for some browsers)
- Test with different browsers
- Check for conflicting CSS

## Documentation Links

- [ArcGIS Fullscreen Widget](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Fullscreen.html)
- [ArcGIS Legend Widget](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Legend.html)
- [ArcGIS Expand Widget](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Expand.html)

## Summary

The map now includes:
- **ArcGIS Fullscreen Widget**: Native fullscreen mode (top-left)
- **ArcGIS Legend Widget**: Expandable legend (top-right)
- **Custom Overlay Panels**: Location info and air quality (right side)
- **Professional Controls**: Industry-standard map widgets
- **Seamless Integration**: Works with existing features

Users get the best of both worlds: native ArcGIS controls for standard map operations and custom panels for application-specific data!
