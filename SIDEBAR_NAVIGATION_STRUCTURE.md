# Sidebar Navigation Structure - Visual Reference

**Last Updated:** April 1, 2026
**Status:** ✅ IMPLEMENTED & VERIFIED

---

## Current Navigation Hierarchy

### Complete Sidebar Structure

```
┌─────────────────────────────────────┐
│         SIDEBAR NAVIGATION          │
├─────────────────────────────────────┤
│                                     │
│  🎯 Dashboard                       │ ← Entry point / Overview
│  ├─ /dashboard                      │
│                                     │
│  💧 BM Log                          │ ╭──────────────────────╮
│  ├─ /bm-log                         │ │  LOGGING SECTION     │
│                                     │ │  (Quick Actions)     │
│  🍽️  Meal Tracking                  │ │                      │
│  ├─ /meals                          │ ╰──────────────────────╯
│                                     │
│  🧠 Health Insights                 │ ╭──────────────────────╮
│  ├─ /insights                       │ │ ANALYSIS SECTION     │
│                                     │ │ (Pattern Recognition)│
│  📈 Trends & Analytics              │ │                      │
│  ├─ /trends                         │ │                      │
│                                     │ │                      │
│  📊 Reports                         │ ╰──────────────────────╯
│  ├─ /reports                        │
│                                     │
│  👥 Community                       │ ╭──────────────────────╮
│  ├─ /community                      │ │ COMMUNITY SECTION    │
│                                     │ │ (Social & Settings)  │
│  ⚙️  Settings                        │ │                      │
│  ├─ /settings                       │ ╰──────────────────────╯
│                                     │
├─────────────────────────────────────┤
│                                     │
│  👤 User Profile (at bottom)        │
│  ├─ Avatar with initial             │
│  ├─ Display name                    │
│  └─ Email address                   │
│                                     │
└─────────────────────────────────────┘
```

---

## Navigation Sections Explained

### Section 1: Dashboard (Entry Point)
```
Item: Dashboard
Route: /dashboard
Icon: LayoutDashboard
Purpose: Overview of all health metrics
Position: 1 (First in navigation)
```

**Why First:**
- Users land here after login
- Central hub for quick actions
- Quick Log Actions card visible here
- Daily summary accessible

---

### Section 2: Logging Functions (Primary Activities)
```
Item 2: BM Log
Route: /bm-log
Icon: Droplet
Purpose: Log bowel movement data

Item 3: Meal Tracking
Route: /meals
Icon: UtensilsCrossed
Purpose: Log food and meal data
```

**Why Grouped Together:**
- Both are quick logging actions
- Users perform these frequently
- Direct data entry functions
- Primary use case for app

**Note:** Menstrual Cycle moved to Quick Log Actions (dashboard card)

---

### Section 3: Analysis & Insights (Secondary Activities)
```
Item 4: Health Insights
Route: /insights
Icon: Brain
Purpose: AI-generated health insights

Item 5: Trends & Analytics
Route: /trends
Icon: TrendingUp
Purpose: Pattern recognition and trends

Item 6: Reports
Route: /reports
Icon: FileText
Purpose: Detailed health reports
```

**Why Grouped Together:**
- All consume and analyze logged data
- Used for understanding patterns
- Secondary use case (review vs. log)
- Similar information density

---

### Section 4: Community & Preferences (Tertiary Activities)
```
Item 7: Community
Route: /community
Icon: Users
Purpose: Community features and social

Item 8: Settings
Route: /settings
Icon: Settings
Purpose: User preferences and account settings
```

**Why Grouped Together:**
- Not core health tracking
- Account/personal features
- Appear at end of navigation
- Less frequently used

---

## Before vs. After Detailed Comparison

### BEFORE Navigation Structure
```
Position │ Item                  │ Icon             │ Section
────────┼───────────────────────┼──────────────────┼─────────────────
   1    │ Dashboard             │ LayoutDashboard  │ Entry Point
   2    │ BM Log                │ Droplet          │ Logging (mixed)
   3    │ Menstrual Cycle   ❌  │ Heart            │ Logging (mixed)
   4    │ Health Insights       │ Brain            │ Analysis (mixed)
   5    │ Trends & Analytics    │ TrendingUp       │ Analysis
   6    │ Meal Tracking     ↑   │ UtensilsCrossed  │ Logging (buried)
   7    │ Reports               │ FileText         │ Analysis
   8    │ Community             │ Users            │ Community
   9    │ Settings              │ Settings         │ Community

Issues:
- 9 items: Cognitive overload
- Menstrual Cycle: Buried in navigation
- Meal Tracking: Separated from BM Log (related functions)
- Sections: Mixed together, unclear grouping
```

### AFTER Navigation Structure
```
Position │ Item                  │ Icon             │ Section
────────┼───────────────────────┼──────────────────┼─────────────────
   1    │ Dashboard             │ LayoutDashboard  │ Entry Point
   2    │ BM Log                │ Droplet          │ Logging
   3    │ Meal Tracking    ↑    │ UtensilsCrossed  │ Logging
   4    │ Health Insights       │ Brain            │ Analysis
   5    │ Trends & Analytics    │ TrendingUp       │ Analysis
   6    │ Reports               │ FileText         │ Analysis
   7    │ Community             │ Users            │ Community
   8    │ Settings              │ Settings         │ Community

Improvements:
✅ 8 items: Cleaner, less overwhelming
✅ Menstrual Cycle: Now in Quick Log Actions (prominent)
✅ Meal Tracking: With BM Log (related functions grouped)
✅ Sections: Clear grouping by function type
✅ IA: Logical flow from logging → analysis → social
```

---

## Information Architecture Flow

### User Journey Through Navigation

**Scenario 1: User wants to log bowel movement**
```
1. Dashboard (default landing)
   ↓
2. See Quick Log Actions card
   ↓
3. Click "Bowel Movement" button
   ↓
4. Navigate to /bm-log
   ↓
5. Log data
```

Alternative path:
```
1. Dashboard
   ↓
2. Click "BM Log" in sidebar
   ↓
3. Navigate to /bm-log
```

**Scenario 2: User wants to track menstrual cycle**
```
1. Dashboard (default landing)
   ↓
2. See Quick Log Actions card (8 buttons)
   ↓
3. Click "Menstrual Cycle" button
   ↓
4. Navigate to /menstrual-cycle-log
   ↓
5. Log data with history view
```

**Scenario 3: User wants to analyze trends**
```
1. Dashboard
   ↓
2. Click "Trends & Analytics" in sidebar
   ↓
3. View trend charts and patterns
   ↓
4. (or) Click "Reports" for detailed analysis
```

---

## Navigation Item Details

### Item 1: Dashboard
- **Display Name:** Dashboard
- **Icon:** LayoutDashboard (Lucide icon)
- **Route:** /dashboard
- **Access:** All authenticated users
- **Mobile:** Visible in hamburger menu
- **Active State:** Teal background and text
- **Purpose:** Overview and quick actions hub

### Item 2: BM Log
- **Display Name:** BM Log
- **Icon:** Droplet (Lucide icon)
- **Route:** /bm-log
- **Access:** All authenticated users
- **Mobile:** Visible in hamburger menu
- **Active State:** Teal background and text
- **Purpose:** Log and view bowel movement data
- **Quick Access:** Also in dashboard Quick Log Actions

### Item 3: Meal Tracking
- **Display Name:** Meal Tracking
- **Icon:** UtensilsCrossed (Lucide icon)
- **Route:** /meals
- **Access:** All authenticated users
- **Mobile:** Visible in hamburger menu
- **Active State:** Teal background and text
- **Purpose:** Log and analyze food intake
- **Position:** Directly below BM Log (NEW)
- **Grouping:** Logging section with BM Log

### Item 4: Health Insights
- **Display Name:** Health Insights
- **Icon:** Brain (Lucide icon)
- **Route:** /insights
- **Access:** All authenticated users
- **Purpose:** AI-generated health insights
- **Mobile:** Visible in hamburger menu
- **Active State:** Teal background and text

### Item 5: Trends & Analytics
- **Display Name:** Trends & Analytics
- **Icon:** TrendingUp (Lucide icon)
- **Route:** /trends
- **Access:** All authenticated users
- **Purpose:** Pattern analysis and trend visualization
- **Mobile:** Visible in hamburger menu
- **Active State:** Teal background and text

### Item 6: Reports
- **Display Name:** Reports
- **Icon:** FileText (Lucide icon)
- **Route:** /reports
- **Access:** All authenticated users
- **Purpose:** Detailed health reports
- **Mobile:** Visible in hamburger menu
- **Active State:** Teal background and text

### Item 7: Community
- **Display Name:** Community
- **Icon:** Users (Lucide icon)
- **Route:** /community
- **Access:** All authenticated users
- **Purpose:** Community features
- **Mobile:** Visible in hamburger menu
- **Active State:** Teal background and text

### Item 8: Settings
- **Display Name:** Settings
- **Icon:** Settings (Lucide icon)
- **Route:** /settings
- **Access:** All authenticated users
- **Purpose:** User preferences and account
- **Mobile:** Visible in hamburger menu
- **Active State:** Teal background and text

---

## Removed Item

### ❌ Menstrual Cycle (REMOVED from Sidebar)

**Original Details:**
- **Display Name:** Menstrual Cycle
- **Icon:** Heart (Lucide icon)
- **Route:** /menstrual-cycle-log
- **Previous Position:** 3 (between BM Log and Health Insights)

**Why Removed:**
- Now exclusively in Quick Log Actions (dashboard card)
- Quick Log is more prominent and efficient
- Reduces sidebar clutter
- Users can still access via `/menstrual-cycle-log`
- Dashboard Quick Log is primary access point

**Still Functional:**
✅ All menstrual cycle tracking features work
✅ Available in dashboard Quick Log Actions
✅ Direct route still works
✅ Full history and edit features available

---

## CSS Styling for Navigation Items

### Active Link Style
```css
/* When current route matches navigation item */
.active {
  background-color: rgb(240, 253, 250); /* teal-50 */
  color: rgb(15, 118, 110);             /* teal-700 */
}
```

### Hover State
```css
/* When user hovers over navigation item */
.hover {
  background-color: rgb(249, 250, 251); /* gray-50 */
  color: rgb(17, 24, 39);               /* gray-900 */
}
```

### Default State
```css
/* Normal navigation item */
.default {
  color: rgb(55, 65, 81);               /* gray-700 */
  transition: color 150ms, background-color 150ms;
}
```

---

## Responsive Behavior

### Desktop (≥1024px / lg breakpoint)
- Sidebar always visible (left side)
- Fixed width: 16rem (256px)
- All 8 items visible
- No hamburger menu
- Main content shifted right by sidebar width

### Tablet (768px - 1024px)
- Sidebar visible but narrower on some tablets
- Hamburger menu may appear
- All 8 items visible when menu open
- Can swipe to close menu

### Mobile (< 768px)
- Sidebar hidden by default
- Hamburger menu visible (top-left)
- Tap hamburger to reveal sidebar
- Sidebar slides in from left (overlay)
- 8 items visible in dropdown menu
- Tap item to navigate and auto-close menu

---

## Accessibility Features

### Screen Reader Announcements
```
Navigation region "Main navigation"
├─ Link "Dashboard" to /dashboard
├─ Link "BM Log" to /bm-log
├─ Link "Meal Tracking" to /meals
├─ Link "Health Insights" to /insights
├─ Link "Trends & Analytics" to /trends
├─ Link "Reports" to /reports
├─ Link "Community" to /community
└─ Link "Settings" to /settings
```

### Keyboard Navigation
- Tab: Move to next item
- Shift+Tab: Move to previous item
- Enter: Navigate to route
- Visual focus indicator on each link

### Color Contrast
- Active text (teal-700) on teal-50 background: ✅ WCAG AA compliant
- Default text (gray-700) on white background: ✅ WCAG AA compliant
- Hover text (gray-900) on gray-50 background: ✅ WCAG AA compliant

---

## Summary

**Total Navigation Items:** 8
**Removed Items:** 1 (Menstrual Cycle → moved to Quick Log)
**Reorganized Items:** 1 (Meal Tracking moved up)
**New Grouping:** Clear sectional organization
**Build Status:** ✅ Verified and successful

---

## Quick Reference

| Position | Item | Icon | Route |
|----------|------|------|-------|
| 1 | Dashboard | 🎯 | /dashboard |
| 2 | BM Log | 💧 | /bm-log |
| 3 | Meal Tracking | 🍽️ | /meals |
| 4 | Health Insights | 🧠 | /insights |
| 5 | Trends & Analytics | 📈 | /trends |
| 6 | Reports | 📊 | /reports |
| 7 | Community | 👥 | /community |
| 8 | Settings | ⚙️ | /settings |

---

**Status: PRODUCTION READY** ✅
