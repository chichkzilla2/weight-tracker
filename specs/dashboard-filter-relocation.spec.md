# Feature Specification: Dashboard Filter Relocation

## Overview

Move the dashboard filter controls (group selector, time range buttons, and month selector) from the top of the page to a position just above the "น้ำหนักรวมรายเดือน (กก.)" chart at the bottom of the dashboard.

**User Value**: Reduce cognitive distance between filter controls and the chart they primarily affect, improving usability by grouping related controls with their visualization.

## Current State

**File**: `app/(protected)/dashboard/DashboardClient.tsx`

**Current Layout Order** (lines 254-367):
1. Filters section (lines 257-289) - group selector + time range buttons
2. Month selector (lines 292-307) - conditional, only when "all groups" selected
3. Summary Cards (lines 309-329)
4. Per-group % loss chart (lines 333-346) - conditional
5. Donut chart (lines 348-356) - conditional
6. Monthly weight chart (lines 358-364) - "น้ำหนักรวมรายเดือน (กก.)"

## Target State

**New Layout Order**:
1. Summary Cards
2. Per-group % loss chart (conditional)
3. Donut chart (conditional)
4. **Filters section** ← moved here
5. **Month selector** ← moved here
6. Monthly weight chart

## Functional Requirements (EARS Format)

### FR-1: Filter Section Relocation
When the dashboard page renders, the system shall display the filter section (group selector and time range buttons) immediately above the "น้ำหนักรวมรายเดือน (กก.)" chart.

### FR-2: Month Selector Relocation
Where the "all groups" filter is selected, the system shall display the month selector immediately after the main filter section and immediately before the monthly weight chart.

### FR-3: Layout Order Preservation
When filters are relocated, the system shall maintain the current order of all other dashboard sections (summary cards, per-group % loss chart, donut chart, monthly weight chart).

### FR-4: State Management Consistency
When filters are relocated, the system shall preserve all existing state management behavior (selectedGroupId, timeRange, selectedMonthKey) without modification.

### FR-5: Responsive Behavior
The system shall apply the relocated filter layout across all viewport sizes (mobile, tablet, desktop).

## Non-Functional Requirements

### NFR-1: Performance
The layout change shall not introduce any performance degradation. No re-renders or state changes beyond current behavior.

### NFR-2: Visual Consistency
The relocated filters shall maintain their current styling (borders, colors, spacing, font sizes) without modification.

### NFR-3: Backward Compatibility
The change shall be purely presentational. No data structure, prop, or API changes required.

## Out of Scope

- Adding new visual separators or section headings
- Changing filter styling or appearance
- Adding scroll-to-filter or focus behavior
- Modifying filter functionality or options
- Desktop-only or mobile-only conditional layouts
- Analytics tracking updates

## Acceptance Criteria

### AC-1: Filter Position
```
Given a user is viewing the dashboard
When the page loads
Then the filter section appears immediately above the monthly weight chart
And the filter section no longer appears at the top of the page
```

### AC-2: Month Selector Position (All Groups)
```
Given the user has selected "ทุกกลุ่ม" (all groups)
When the dashboard renders
Then the month selector appears between the main filters and the monthly weight chart
And the month selector is visually grouped with the filters
```

### AC-3: Month Selector Hidden (Single Group)
```
Given the user has selected a specific group (not "all")
When the dashboard renders
Then the month selector does not appear
And only the main filter section appears above the monthly weight chart
```

### AC-4: Chart Order Preserved
```
Given a user is viewing the dashboard
When filters are relocated
Then summary cards appear first
And per-group % loss chart appears second (when applicable)
And donut chart appears third (when applicable)
And filters appear fourth
And monthly weight chart appears last
```

### AC-5: Filter Functionality Unchanged
```
Given the filters have been relocated
When the user changes group selection or time range
Then the charts update exactly as they did before the change
And no console errors occur
And no visual glitches occur
```

### AC-6: Responsive Behavior
```
Given a user views the dashboard on any device
When the page renders on mobile, tablet, or desktop
Then the filter section appears above the monthly weight chart on all viewport sizes
```

## Implementation Checklist

### Phase 1: Code Changes
- [ ] Read `app/(protected)/dashboard/DashboardClient.tsx` lines 254-367
- [ ] Identify JSX blocks to move:
  - [ ] Filters section (lines 257-289)
  - [ ] Month selector (lines 292-307)
- [ ] Cut filters section JSX (lines 257-289)
- [ ] Cut month selector JSX (lines 292-307)
- [ ] Paste both sections immediately before the monthly weight chart section (before line 358)
- [ ] Verify JSX structure and closing tags are correct
- [ ] Verify className and spacing attributes remain unchanged

### Phase 2: Verification
- [ ] Visual inspection on desktop viewport
- [ ] Visual inspection on mobile viewport (responsive mode)
- [ ] Test group selector: switch between "ทุกกลุ่ม" and specific groups
- [ ] Test time range buttons: switch between 6, 12, and "ทั้งหมด"
- [ ] Test month selector appears/disappears correctly
- [ ] Verify all charts render correctly
- [ ] Verify no console errors
- [ ] Verify no layout shifts or visual glitches

### Phase 3: Testing
- [ ] Test AC-1: Filter position verified
- [ ] Test AC-2: Month selector position when "all groups" selected
- [ ] Test AC-3: Month selector hidden when single group selected
- [ ] Test AC-4: Chart order verified
- [ ] Test AC-5: Filter functionality unchanged
- [ ] Test AC-6: Responsive behavior verified

## Technical Notes

### Files Modified
- `app/(protected)/dashboard/DashboardClient.tsx` - JSX reordering only

### No Changes Required
- `app/(protected)/dashboard/page.tsx` - server component unchanged
- Component state management - unchanged
- Component props - unchanged
- Data fetching logic - unchanged
- Chart components - unchanged
- Styling - unchanged

### Implementation Strategy
This is a **pure JSX reordering task**. No logic changes, no state changes, no styling changes. Simply move two JSX blocks from their current position to a new position in the render tree.

## Definition of Done

- [ ] All acceptance criteria pass
- [ ] Visual regression testing complete (mobile + desktop)
- [ ] No console errors in browser
- [ ] Code reviewed and approved by reviewer-jerry
- [ ] User approves the final layout

---

**Specification Author**: Bug Bunny (Product Owner)  
**Created**: 2026-04-16  
**Status**: Awaiting Approval
