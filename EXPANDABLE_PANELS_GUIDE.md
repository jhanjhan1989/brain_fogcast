# Expandable Panels Guide

## Overview
The overlay panels on the map are now expandable/collapsible, giving users control over what information they see and maximizing map visibility.

## Features

### 1. Air Quality Panel (Location Info)

#### Always Visible (Collapsed State)
- Location name with orange pin icon
- Air Quality Index (large, color-coded)
- AQI quality label (Good, Moderate, etc.)
- Expand/collapse button (top-right)

#### Expandable Details
- PM2.5 level (µg/m³)
- NO2 level (ppb)
- ASIR value (per 100k)

**Default State**: Expanded (shows all details)

### 2. Map Legend Panel

#### Always Visible (Collapsed State)
- "Map Legend" title
- Selected location indicator (orange pin)
- Expand/collapse button (top-right)

#### Expandable Details
- Air Quality Stations (6 color ranges)
- Health Facilities counts (government/private)
- Total facilities count

**Default State**: Expanded (shows all details)

## User Interaction

### Expand/Collapse Buttons
- **Location**: Top-right corner of each panel
- **Icon**: 
  - ChevronUp (^) when expanded
  - ChevronDown (v) when collapsed
- **Hover Effect**: Gray background highlight
- **Size**: 16x16 pixels
- **Tooltip**: "Collapse" or "Expand"

### Click Behavior
- Click button to toggle panel state
- Smooth transition (no animation, instant)
- State persists while location is selected
- Resets to default (expanded) when new location selected

## Visual Design

### Panel Structure

#### Expanded State
```
┌─────────────────────────────┐
│ Header + Button         [^] │
│─────────────────────────────│
│ Always Visible Content      │
│─────────────────────────────│
│ Expandable Details          │
│ (shown when expanded)       │
└─────────────────────────────┘
```

#### Collapsed State
```
┌─────────────────────────────┐
│ Header + Button         [v] │
│─────────────────────────────│
│ Always Visible Content      │
└─────────────────────────────┘
```

### Styling Details

#### Button
- Padding: 4px (p-1)
- Hover: Light gray background
- Border radius: Rounded
- Transition: Smooth color change
- Icon color: Gray-600 (dark mode: gray-400)

#### Expandable Section
- Border-top: Separates from always-visible content
- Padding: Consistent with panel
- Spacing: Maintains visual hierarchy

## Benefits

### Space Saving
- **Collapsed Air Quality**: Saves ~120px height
- **Collapsed Legend**: Saves ~200px height
- **Total Savings**: Up to 320px more map visibility

### User Control
- Users decide what information they need
- Quick access to essential info (always visible)
- Detailed info available on demand

### Performance
- Conditional rendering reduces DOM nodes
- Faster rendering when collapsed
- Smooth user experience

## Use Cases

### Scenario 1: Quick Location Check
1. User selects location
2. Sees AQI immediately (always visible)
3. Collapses details if not needed
4. More map space for navigation

### Scenario 2: Detailed Analysis
1. User selects location
2. Keeps panels expanded (default)
3. Reviews all air quality metrics
4. Checks legend for marker meanings

### Scenario 3: Mobile/Small Screen
1. Limited screen space
2. Collapse both panels
3. Essential info still visible
4. Maximum map area

## Technical Implementation

### State Management
```typescript
const [showAirQualityDetails, setShowAirQualityDetails] = useState(true);
const [showLegend, setShowLegend] = useState(true);
```

### Toggle Functions
```typescript
onClick={() => setShowAirQualityDetails(!showAirQualityDetails)}
onClick={() => setShowLegend(!showLegend)}
```

### Conditional Rendering
```typescript
{showAirQualityDetails && (
  <div className="expandable-content">
    {/* Details */}
  </div>
)}
```

## Accessibility

### Keyboard Navigation
- Buttons are focusable
- Enter/Space to toggle
- Tab navigation works

### Screen Readers
- Button has title attribute
- Clear "Collapse" or "Expand" labels
- Content structure maintained

### Visual Indicators
- Clear chevron icons (up/down)
- Hover states for feedback
- Consistent positioning

## Responsive Behavior

### Desktop (>1024px)
- Panels at 320px width
- Both expanded by default
- Plenty of space for details

### Tablet (768px - 1024px)
- Same width (320px)
- May need to collapse for more map space
- User decides based on needs

### Mobile (<768px)
- Panels may need adjustment
- Consider bottom sheet design (future)
- Collapse by default (future enhancement)

## Future Enhancements

### Possible Additions
1. **Remember State**: Save collapse state in localStorage
2. **Collapse All Button**: Single button to collapse both panels
3. **Minimize to Icons**: Reduce panels to small icons when collapsed
4. **Slide Animation**: Smooth expand/collapse animation
5. **Auto-collapse**: Collapse after X seconds of inactivity
6. **Keyboard Shortcuts**: Hotkeys to toggle panels

### Mobile Improvements
1. **Bottom Sheet**: Move panels to bottom on mobile
2. **Swipe Gestures**: Swipe up/down to expand/collapse
3. **Smaller Default Width**: Reduce to 280px on mobile
4. **Auto-collapse on Mobile**: Start collapsed on small screens

## Testing Checklist

- [x] Expand/collapse buttons work
- [x] Chevron icons change correctly
- [x] Always-visible content stays visible
- [x] Expandable content shows/hides
- [x] Hover states work
- [x] Default state is expanded
- [x] State persists during map interaction
- [x] No layout shift when toggling
- [x] Buttons are accessible
- [x] Works in dark mode

## Code Quality

### Maintainability
- Clear state variable names
- Simple toggle logic
- Consistent styling patterns
- Reusable button component (potential)

### Performance
- Minimal re-renders
- Conditional rendering
- No unnecessary DOM nodes
- Efficient state updates

## User Feedback

### Visual Feedback
- Hover effect on buttons
- Clear icon changes
- Smooth transitions
- Consistent behavior

### Interaction Feedback
- Immediate response to clicks
- No lag or delay
- Predictable behavior
- Clear visual hierarchy

## Summary

The expandable panels provide:
- **Flexibility**: Users control what they see
- **Space**: More map area when needed
- **Clarity**: Essential info always visible
- **Efficiency**: Quick access to details
- **UX**: Better user experience overall

Default state keeps everything expanded for immediate access to all information, while giving users the option to collapse for more map space when needed.
