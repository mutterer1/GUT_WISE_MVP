# GutWise Application Interface Structure Documentation

## Overview
This document provides a comprehensive breakdown of the Health Insights, Trends & Analytics, and Settings sections, along with the integrated Sidebar Navigation that ties the entire application together.

---

## 1. SIDEBAR NAVIGATION STRUCTURE

### Location
- **File**: `src/components/Sidebar.tsx`
- **Position**: Fixed left sidebar (desktop: 256px width, mobile: full-width overlay)
- **Responsiveness**: Collapses to hamburger menu on screens < 1024px

### Navigation Hierarchy

#### Primary Navigation (Main Menu Items)
1. **Dashboard**
   - Icon: LayoutDashboard
   - Route: `/dashboard`
   - Purpose: Home page with daily summary and key metrics

2. **Logging Hub** (Expandable)
   - Icon: BookOpen
   - Submenu Items:
     - Bowel Movement → `/bm-log` (Activity icon)
     - Food Intake → `/food-log` (Utensils icon)
     - Symptoms → `/symptoms-log` (AlertCircle icon)
     - Sleep → `/sleep-log` (Moon icon)
     - Stress → `/stress-log` (Brain icon)
     - Hydration → `/hydration-log` (Droplet icon)
     - Menstrual Cycle → `/menstrual-cycle-log` (Heart icon)
     - Medication → `/medication-log` (Pill icon)

3. **Health Insights**
   - Icon: Brain
   - Route: `/insights`
   - Purpose: AI-powered pattern analysis and health recommendations

4. **Trends & Analytics**
   - Icon: TrendingUp
   - Route: `/trends`
   - Purpose: Data visualization and health trend analysis

5. **Reports**
   - Icon: FileText
   - Route: `/reports`
   - Purpose: Clinical reports for healthcare consultation

6. **Community**
   - Icon: Users
   - Route: `/community`
   - Purpose: User forum and health discussions

7. **Settings**
   - Icon: Settings
   - Route: `/settings`
   - Purpose: Account and application configuration

#### User Profile Section
- Located at bottom of sidebar
- Displays user avatar (initials in gradient circle)
- Shows full name and email
- Links to `/account` for account management
- Accessible on click for account settings

---

## 2. HEALTH INSIGHTS PAGE STRUCTURE

### File Location
- **File**: `src/pages/Insights.tsx`
- **Route**: `/insights`

### Page Header
```
┌─────────────────────────────────────────────────────┐
│ Health Insights                                     │
│ Pattern-based analysis of your digestive health... │
│                         [Refresh Insights Button] │
└─────────────────────────────────────────────────────┘
```

**Header Elements:**
- **Primary Title**: "Health Insights" (32px, bold)
- **Subtitle**: "Pattern-based analysis of your digestive health data." (18px, gray)
- **Primary CTA**: "Refresh Insights" button with Sparkles icon
  - Shows "Analyzing..." with spinner during processing
  - Disabled while generating insights

### Content Areas

#### 1. Empty State (No Insights Yet)
When users have insufficient data:
- **Visual**: Brain icon in teal container with floating animation
- **Heading**: "Your Insights Are Brewing"
- **Primary Message**: "We need a few days of data to identify meaningful patterns. The more consistently you log, the better your insights become."
- **Secondary Message**: "Logging meals, symptoms, hydration, sleep, and stress creates the strongest analysis."
- **CTA Button**: "Analyze Latest Data"

#### 2. Stats Overview (When Insights Exist)
Three-column grid on desktop, stacked on mobile:
- **Active Insights Card**: Shows count of current insights
- **Analysis Style Card**: "Rule-based and transparent"
- **Best Results Card**: "Consistent multi-category logging"

Each card features:
- Label (gray, small text)
- Value/Description (larger, bold for numbers)
- Subtle shadow and border

#### 3. Educational Section
Blue information banner explaining:
- **Title**: "How Insights Work"
- **Content**: "Insights are generated using transparent rules based on repeated patterns in your data. Confidence improves when the same pattern appears consistently over time."

#### 4. Insights Grid
- **Layout**: 2 columns on desktop, 1 on tablet/mobile
- **Cards**: InsightCard components displaying:
  - Insight icon/category
  - Title
  - Description
  - Confidence level
  - Relevant data points
  - Actionable recommendations

### Error Handling
- **Error Banner**: Yellow background with AlertCircle icon
- **Error Message**: Contextual messaging for different failure scenarios
  - "Not enough data to generate insights yet..."
  - "Failed to analyze your latest data..."

### Loading State
- **Spinner**: Centered RefreshCw icon (teal color) with animation
- **Container Height**: 16rem (256px) for consistent spacing

---

## 3. TRENDS & ANALYTICS PAGE STRUCTURE

### File Location
- **File**: `src/pages/Trends.tsx`
- **Route**: `/trends`

### Page Header
```
┌──────────────────────────────────────────────────────┐
│ ▶️ Trends & Analytics                                │
│    Visualize your health patterns over time          │
│                      [Export Data] [Print Report]   │
└──────────────────────────────────────────────────────┘
```

**Header Elements:**
- **Icon Container**: Blue rounded background with TrendingUp icon
- **Primary Title**: "Trends & Analytics" (32px, bold)
- **Subtitle**: "Visualize your health patterns over time" (18px, gray)
- **Action Buttons**:
  - "Export Data" (secondary style, Download icon)
  - "Print Report" (primary style, Download icon)
  - Both disabled while loading

### Content Areas

#### 1. Time Period Selector
```
📅 Time Period:  [7 Days]  [14 Days]  [30 Days]
```
- **Label**: "Time Period:" with calendar icon
- **Options**: Three button options (7/14/30 days)
- **Default**: 7 Days selected
- **Styling**: Active button highlighted in primary color
- **Container**: Light gray background card

#### 2. Analytics Charts Section
Each chart displays:
- **Chart Title**: Bold heading (20px)
- **Metric Label**: Right-aligned average or key metric
- **Visualization Area**: Responsive chart container
- **Axis Labels**: Date ranges or value scales

**Charts Included:**
1. **Daily Frequency Trend**
   - Y-axis: BMs per day (0-2 scale)
   - X-axis: Dates (7/14/30 day range)
   - Type: Bar chart with trend line
   - Average: Displayed in top-right

2. **Bristol Scale Distribution**
   - X-axis: Bristol scale types (1-7)
   - Y-axis: Frequency percentage
   - Type: Horizontal bar chart
   - Purpose: Shows bowel consistency patterns

3. **Symptom Intensity Heatmap**
   - Grid format with symptom types
   - Color intensity indicates severity
   - Date columns for temporal analysis
   - Legend showing severity levels

4. **Hydration Correlation Chart**
   - X-axis: Daily hydration intake (ml)
   - Y-axis: BM frequency or symptoms
   - Type: Scatter plot with trend line
   - Purpose: Identify hydration relationships

5. **Sleep-Symptom Relationship**
   - Dual-axis chart
   - Left axis: Sleep hours
   - Right axis: Symptom count
   - Type: Line chart with dual series
   - Purpose: Correlate sleep quality with symptoms

6. **Stress-Urgency Pattern**
   - X-axis: Stress levels (1-10)
   - Y-axis: BM urgency incidents
   - Type: Scatter plot with clustering
   - Purpose: Identify stress triggers

#### 3. Data Export Section
- **CSV Format**: Raw data export
- **JSON Format**: Structured data export
- **Filename**: `health-trends-{days}days-{date}.{format}`
- **Functionality**: Triggers browser download

### Print Functionality
- Print-optimized layout with `@media print` styles
- Hides action buttons during print
- Professional formatting for healthcare records
- Page breaks between major sections

---

## 4. SETTINGS PAGE STRUCTURE

### File Location
- **File**: `src/pages/Settings.tsx`
- **Route**: `/settings`

### Page Header
```
┌───────────────────────────────────┐
│ Settings                          │
│ Manage your account and preferences
└───────────────────────────────────┘
```

**Header Elements:**
- **Primary Title**: "Settings" (32px, bold)
- **Subtitle**: "Manage your account and preferences" (18px, gray)

### Settings Categories Grid

Each category is a card with:
- **Icon**: Teal background square (48px)
- **Title**: Bold heading (18px)
- **Description**: Gray subtext explaining the section
- **CTA Button**: "Configure" outline button

#### Category 1: Profile
- **Icon**: User icon
- **Route**: `/settings/profile`
- **Description**: "Manage your personal information and profile details"
- **Sub-sections**:
  - Full Name
  - Email Address
  - Date of Birth
  - Phone Number (optional)
  - Profile Picture/Avatar
  - Bio/Medical History Summary

#### Category 2: Notifications
- **Icon**: Bell icon
- **Route**: `/settings/notifications`
- **Description**: "Control how and when you receive updates"
- **Sub-sections**:
  - Email Notifications Toggle
  - Daily Digest Preference
  - Alert Frequency Settings
  - Notification Types (insights, reminders, reports)
  - Quiet Hours Configuration

#### Category 3: Privacy & Security
- **Icon**: Lock icon
- **Route**: `/settings/privacy-security`
- **Description**: "Manage your data privacy and security settings"
- **Sub-sections**:
  - Password Management
  - Two-Factor Authentication
  - Active Sessions Management
  - Data Sharing Preferences
  - Privacy Policy Link
  - HIPAA Compliance Info

#### Category 4: Billing
- **Icon**: CreditCard icon
- **Route**: `/settings/billing`
- **Description**: "View and manage your subscription and payment methods"
- **Sub-sections**:
  - Current Plan Display
  - Billing Cycle Information
  - Payment Methods
  - Invoice History
  - Upgrade/Downgrade Options
  - Renewal Date

#### Category 5: Data Management
- **Icon**: Shield icon
- **Route**: `/settings/data-management`
- **Description**: "Export, backup, or delete your health data"
- **Sub-sections**:
  - Export Data Options (CSV, JSON, PDF)
  - Backup Schedule Settings
  - Data Retention Policy
  - Delete Account Option
  - GDPR Data Request

#### Category 6: Preferences
- **Icon**: Globe icon
- **Route**: `/settings/preferences`
- **Description**: "Customize your experience and app preferences"
- **Sub-sections**:
  - Language Selection
  - Theme (Light/Dark)
  - Units (Metric/Imperial)
  - Timezone Configuration
  - Data Visualization Preferences
  - Default View Preferences

### Settings Navigation Flow

```
Settings Hub (/settings)
├── Profile (/settings/profile)
├── Notifications (/settings/notifications)
├── Privacy & Security (/settings/privacy-security)
├── Billing (/settings/billing)
├── Data Management (/settings/data-management)
└── Preferences (/settings/preferences)
```

Each sub-page includes:
- Back button to Settings hub
- Page-specific title and description
- Relevant form fields or toggles
- Save/Apply button with confirmation
- Success toast notification on save

---

## 5. ACCOUNT PAGE STRUCTURE

### File Location
- **File**: `src/pages/Account.tsx`
- **Route**: `/account`

### Page Elements
- **Back Button**: Navigate to previous page
- **Title**: "Account Settings" (32px, bold)
- **Primary Actions**:
  - Edit Profile
  - Change Password
  - Account Actions (Sign Out, Delete Account)

---

## 6. RESPONSIVE BEHAVIOR

### Desktop (≥1024px)
- Sidebar fixed on left (256px)
- Main content has left margin (lg:ml-64)
- Full-width charts and multi-column grids
- All buttons visible
- Optimal viewing of data

### Tablet (768px - 1023px)
- Sidebar remains fixed but narrower on some layouts
- Single column for cards
- Charts adapt to available width
- Buttons stack or wrap as needed

### Mobile (<768px)
- Hamburger menu for sidebar (overlay)
- Full-width content
- Single column layouts
- Touch-optimized button sizes
- Stacked navigation items
- Top padding (pt-16) for fixed menu space

---

## 7. CONSISTENT DESIGN PATTERNS

### Color System
- **Primary Accent**: Teal (#14b8a6, rgb(20, 184, 166))
- **Secondary Accent**: Blue (#3b82f6, rgb(59, 130, 246))
- **Backgrounds**: Gray-50 (#f9fafb) for pages
- **Text Primary**: Gray-900 (#111827)
- **Text Secondary**: Gray-600 (#4b5563)
- **Borders**: Gray-200 (#e5e7eb)

### Typography Hierarchy
- **Page Titles**: 32px (3xl), font-bold
- **Section Titles**: 20px (xl), font-semibold
- **Card Titles**: 18px (lg), font-semibold
- **Body Text**: 16px (base), normal
- **Small Text**: 14px (sm), gray-600
- **Tiny Text**: 12px (xs), gray-500

### Spacing System (8px base)
- **Compact**: 4px (0.5rem)
- **Small**: 8px (1rem)
- **Medium**: 16px (2rem)
- **Large**: 24px (3rem)
- **Extra Large**: 32px (4rem)

### Component Patterns
- **Cards**: Rounded corners (8px), subtle shadow, border
- **Buttons**: Rounded (8px), consistent padding
- **Input Fields**: Rounded (6px), gray borders
- **Icons**: Lucide React library throughout
- **Animations**: Smooth transitions (200-300ms)

---

## 8. INTEGRATION POINTS

### Sidebar to Pages
```
Sidebar Navigation
    ├─→ Health Insights (/insights)
    │   └─→ Displays InsightCard components
    │       from insightEngine utility
    │
    ├─→ Trends & Analytics (/trends)
    │   └─→ Displays 6 chart components
    │       from /components/trends/
    │
    └─→ Settings (/settings)
        └─→ 6 settings categories with
            sub-page navigation
```

### State Management
- **Auth Context**: User authentication and profile
- **Custom Hooks**:
  - `useTrendsData()`: Fetches trend analytics
  - `useInsights()`: Manages insight generation
  - `useDashboardData()`: Dashboard metrics

### Data Flow
1. User logs in → AuthContext provides user data
2. Navigate to section via Sidebar
3. Page component loads data via custom hooks
4. Data displayed in appropriate UI components
5. User can interact (export, print, filter, configure)

---

## 9. ACCESSIBILITY FEATURES

- **ARIA Labels**: Menu buttons have descriptive labels
- **Keyboard Navigation**: Full keyboard support for sidebar
- **Mobile Menu**: Overlay with backdrop for mobile UX
- **Color Contrast**: All text meets WCAG standards
- **Focus States**: Visible focus indicators on interactive elements
- **Loading States**: Clear feedback during data fetching

---

## 10. INFORMATION ARCHITECTURE SUMMARY

```
GutWise Application
│
├─ MAIN NAVIGATION (Sidebar)
│  ├─ Dashboard (home/overview)
│  ├─ Logging Hub (8 logging categories)
│  ├─ Health Insights (AI analysis)
│  ├─ Trends & Analytics (data visualization)
│  ├─ Reports (clinical reports)
│  ├─ Community (social/forums)
│  └─ Settings (configuration hub)
│
├─ HEALTH INSIGHTS SECTION
│  ├─ Empty State (insufficient data)
│  ├─ Stats Overview (3-column grid)
│  ├─ Educational Info (how it works)
│  └─ Insights Cards (pattern analysis)
│
├─ TRENDS & ANALYTICS SECTION
│  ├─ Time Period Selector (7/14/30 days)
│  ├─ 6 Chart Visualizations
│  │  ├─ Daily Frequency
│  │  ├─ Bristol Distribution
│  │  ├─ Symptom Intensity
│  │  ├─ Hydration Correlation
│  │  ├─ Sleep-Symptom Relationship
│  │  └─ Stress-Urgency Pattern
│  ├─ Export Functionality
│  └─ Print Optimization
│
├─ SETTINGS SECTION
│  ├─ Profile Management
│  ├─ Notifications
│  ├─ Privacy & Security
│  ├─ Billing
│  ├─ Data Management
│  └─ Preferences
│
└─ ACCOUNT SECTION
   ├─ Profile Information
   ├─ Security Settings
   └─ Account Actions
```

---

## 11. FILES INVOLVED

### Core Pages
- `/src/pages/Insights.tsx` - Health Insights page
- `/src/pages/Trends.tsx` - Trends & Analytics page
- `/src/pages/Settings.tsx` - Settings hub
- `/src/pages/Account.tsx` - Account management
- `/src/pages/settings/ProfileSettings.tsx` - Profile sub-page
- `/src/pages/settings/NotificationsSettings.tsx` - Notifications
- `/src/pages/settings/PrivacySecuritySettings.tsx` - Privacy & Security
- `/src/pages/settings/BillingSettings.tsx` - Billing
- `/src/pages/settings/DataManagementSettings.tsx` - Data Management
- `/src/pages/settings/PreferencesSettings.tsx` - Preferences

### Navigation Component
- `/src/components/Sidebar.tsx` - Main navigation

### Chart Components
- `/src/components/trends/BMFrequencyChart.tsx`
- `/src/components/trends/BristolDistributionChart.tsx`
- `/src/components/trends/SymptomIntensityChart.tsx`
- `/src/components/trends/HydrationCorrelationChart.tsx`
- `/src/components/trends/SleepSymptomChart.tsx`
- `/src/components/trends/StressUrgencyChart.tsx`

### Utility Components
- `/src/components/InsightCard.tsx` - Individual insight display
- `/src/components/Card.tsx` - Generic card wrapper
- `/src/components/Button.tsx` - Button component
- `/src/components/SettingsPageLayout.tsx` - Settings page wrapper

### Utilities
- `/src/utils/insightEngine.ts` - Insight generation logic
- `/src/hooks/useTrendsData.ts` - Trends data hook
- `/src/hooks/useInsights.ts` - Insights management

---

## Design Quality Standards

This interface maintains consistency with established design benchmarks:
- **Clinical Reports Page**: Professional medical documentation style
- **Community Page**: Social interaction and community engagement
- **Dashboard**: At-a-glance health summary with key metrics

All sections feature:
✓ Clear visual hierarchy
✓ Consistent spacing and typography
✓ Intuitive information organization
✓ Professional color palette
✓ Responsive design across all devices
✓ Accessible component interactions
✓ Smooth animations and transitions
✓ Error handling and loading states
