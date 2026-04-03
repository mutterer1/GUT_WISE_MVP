# GutWise Design Implementation Guide

## Complete Reference for Health Insights, Trends, and Settings Implementation

---

## Part 1: SIDEBAR NAVIGATION IMPLEMENTATION

### Component Architecture
```
Sidebar.tsx
├── State Management
│   ├── isMobileMenuOpen (mobile menu visibility)
│   ├── expandedLoggingHub (submenu expansion)
│   └── location (for active route detection)
│
├── Main Navigation Array
│   ├── Dashboard → /dashboard
│   ├── Logging Hub → (expandable submenu)
│   ├── Health Insights → /insights
│   ├── Trends & Analytics → /trends
│   ├── Reports → /reports
│   ├── Community → /community
│   └── Settings → /settings
│
├── Logging Hub Submenu (8 items)
│   ├── Bowel Movement → /bm-log
│   ├── Food Intake → /food-log
│   ├── Symptoms → /symptoms-log
│   ├── Sleep → /sleep-log
│   ├── Stress → /stress-log
│   ├── Hydration → /hydration-log
│   ├── Menstrual Cycle → /menstrual-cycle-log
│   └── Medication → /medication-log
│
├── User Profile Section (Bottom)
│   ├── Avatar (gradient circle with initials)
│   ├── Full Name
│   └── Email
│
└── Responsive Features
    ├── Mobile: Hamburger toggle + overlay
    ├── Desktop: Fixed sidebar
    └── Auto-close on navigation
```

### Styling Details
```
Container:
  - Width: 256px (desktop)
  - Fixed positioning on desktop
  - Overlay z-50 on mobile
  - Transitions: 300ms ease-in-out

Navigation Items:
  - Padding: 12px 16px
  - Border radius: 8px
  - Inactive: Gray-700 text, hover gray-50 bg
  - Active: Teal-50 bg, teal-700 text

Submenu:
  - Nested items with left border
  - Left padding for visual indent
  - Collapsed/expanded toggle with chevron

User Profile:
  - Bottom section with top border
  - Gradient avatar: teal to blue
  - Text truncation for long names
```

---

## Part 2: HEALTH INSIGHTS PAGE IMPLEMENTATION

### File Location & Architecture
```
src/pages/Insights.tsx
├── Imports
│   ├── React hooks (useEffect, useState, useCallback)
│   ├── UI Components (Sidebar, Button, InsightCard)
│   ├── Icons (Brain, RefreshCw, Sparkles, AlertCircle)
│   ├── Auth context
│   └── Insight engine utilities
│
├── Component State
│   ├── insights[] - array of insight objects
│   ├── loading - initial data load state
│   ├── generating - insight generation state
│   └── error - error message string
│
├── Hook: loadInsights (useCallback)
│   ├── Triggers on user prop change
│   ├── Sets loading: true
│   ├── Calls getUserInsights(user.id)
│   ├── Updates insights state
│   └── Handles errors with try/catch
│
├── Function: handleGenerateInsights
│   ├── Sets generating: true
│   ├── Calls generateAllInsights(user.id)
│   ├── If success > 0 insights:
│   │   ├── saveInsights(newInsights)
│   │   └── Reloads insights
│   ├── If success == 0:
│   │   └── Shows "not enough data" error
│   └── Catches and displays errors
│
└── Render Logic
    ├── Loading state: spinner
    ├── Empty state: brewing message
    └── Populated state: stats + insights grid
```

### Page Structure
```
┌─────────────────────────────────────────────────────────┐
│ PAGE HEADER                                             │
│ ├─ Left: Title + Subtitle                               │
│ └─ Right: Primary CTA Button                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [ERROR BANNER - if error exists]                       │
│                                                         │
│ [LOADING SPINNER - if loading]                         │
│                                                         │
│ [EMPTY STATE - if no insights AND not loading]         │
│ ├─ Icon                                                │
│ ├─ Message                                             │
│ └─ CTA Button                                          │
│                                                         │
│ [POPULATED STATE - if insights exist]                  │
│ ├─ Stats Grid (3 columns)                              │
│ ├─ Info Banner                                         │
│ └─ Insights Grid (2 columns)                           │
│    ├─ InsightCard 1                                    │
│    ├─ InsightCard 2                                    │
│    └─ ... more cards                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Components & Props

#### Header Section
```tsx
<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="mb-2 text-3xl font-bold text-gray-900">
      Health Insights
    </h1>
    <p className="text-gray-600">
      Pattern-based analysis of your digestive health data.
    </p>
  </div>

  <Button
    onClick={handleGenerateInsights}
    disabled={generating}
    className="flex items-center gap-2"
  >
    {generating ? (
      <>
        <RefreshCw className="h-4 w-4 animate-spin" />
        Analyzing...
      </>
    ) : (
      <>
        <Sparkles className="h-4 w-4" />
        Refresh Insights
      </>
    )}
  </Button>
</div>
```

#### Error Banner
```tsx
{error && (
  <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
    <p className="text-yellow-800">{error}</p>
  </div>
)}
```

#### Loading State
```tsx
{loading ? (
  <div className="flex h-64 items-center justify-center">
    <RefreshCw className="h-8 w-8 animate-spin text-teal-600" />
  </div>
) : ...}
```

#### Empty State
```tsx
<div
  className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm"
  style={{ animation: 'emptyStateFadeIn 0.4s ease-out both' }}
>
  <div
    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-50"
    style={{ animation: 'emptyStateIconFloat 3s ease-in-out infinite' }}
  >
    <Brain className="h-10 w-10 text-teal-400" />
  </div>
  <h3 className="mb-2 text-xl font-semibold text-gray-900">
    Your Insights Are Brewing
  </h3>
  {/* ... messaging and button ... */}
</div>
```

#### Stats Grid
```tsx
<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-sm text-gray-500">Active Insights</p>
    <p className="mt-1 text-2xl font-bold text-gray-900">
      {insightCount}
    </p>
  </div>
  {/* Two more stat cards... */}
</div>
```

#### Insights Grid
```tsx
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
  {insights.map((insight) => (
    <InsightCard key={insight.id} insight={insight} />
  ))}
</div>
```

### Animation Classes
```css
@keyframes emptyStateFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes emptyStateIconFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
```

---

## Part 3: TRENDS & ANALYTICS PAGE IMPLEMENTATION

### File Location & Architecture
```
src/pages/Trends.tsx
├── Imports
│   ├── React hooks (useState)
│   ├── UI Components (Sidebar, Card, Button)
│   ├── Icons (TrendingUp, Calendar, Download, etc.)
│   ├── Custom hook (useTrendsData)
│   └── 6 Chart components
│
├── Component State
│   ├── selectedRange - time period selection
│   └── Trends data fetched via useTrendsData hook
│
├── Functions
│   ├── handleExport() - exports JSON/CSV
│   ├── handlePrint() - triggers browser print
│   └── Time period selector buttons
│
├── Chart Components Imported
│   ├── BMFrequencyChart
│   ├── BristolDistributionChart
│   ├── SymptomIntensityChart
│   ├── HydrationCorrelationChart
│   ├── SleepSymptomChart
│   └── StressUrgencyChart
│
└── Render Structure
    ├── Header with export/print buttons
    ├── Time period selector
    ├── Error handling
    ├── Loading state
    └── 6-chart grid
```

### Page Structure
```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ ├─ Icon box + Title + Subtitle                          │
│ └─ Action buttons: Export | Print                       │
├─────────────────────────────────────────────────────────┤
│ TIME PERIOD SELECTOR                                    │
│ 📅 Time Period: [7 Days] [14 Days] [30 Days]           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ CHART 1: Daily Frequency Trend                         │
│ [Large chart with axes and data visualization]          │
│                                                         │
│ CHART 2: Bristol Scale Distribution                    │
│ [Horizontal bar chart with percentages]                 │
│                                                         │
│ CHART 3: Symptom Intensity Heatmap                     │
│ [Color-coded grid showing intensity levels]             │
│                                                         │
│ CHART 4: Hydration Correlation Chart                   │
│ [Scatter plot with trend line]                         │
│                                                         │
│ CHART 5: Sleep-Symptom Relationship                    │
│ [Dual-axis line chart]                                 │
│                                                         │
│ CHART 6: Stress-Urgency Pattern                        │
│ [Scatter plot with clustering]                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Implementations

#### Time Period Selector
```tsx
const timeRanges: TimeRange[] = [
  { days: 7, label: '7 Days' },
  { days: 14, label: '14 Days' },
  { days: 30, label: '30 Days' },
];

// In component:
<div className="flex items-center gap-4">
  <Calendar className="h-5 w-5 text-gray-600" />
  <span className="text-gray-700">Time Period:</span>
  {timeRanges.map((range) => (
    <button
      key={range.days}
      onClick={() => setSelectedRange(range)}
      className={`rounded px-4 py-2 ${
        selectedRange.days === range.days
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {range.label}
    </button>
  ))}
</div>
```

#### Export Function
```tsx
const handleExport = () => {
  if (!data) return;

  const exportData = {
    period: `${selectedRange.days} days`,
    exportedAt: new Date().toISOString(),
    data: data,
  };

  const blob = new Blob(
    [JSON.stringify(exportData, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `health-trends-${selectedRange.days}days-${
    new Date().toISOString().split('T')[0]
  }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

#### Print Function
```tsx
const handlePrint = () => {
  window.print();
};

// CSS media query for print:
@media print {
  .print\:hidden { display: none; }
  .page-break { page-break-before: always; }
  body { background: white; }
  /* ... more print styles ... */
}
```

#### Charts Grid Layout
```tsx
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
  {/* Each chart takes full width on mobile, 2 per row on desktop */}

  <Card>
    <h3 className="mb-4 text-xl font-semibold text-gray-900">
      Daily Frequency Trend
    </h3>
    <BMFrequencyChart data={data?.bmFrequency} />
  </Card>

  <Card>
    <h3 className="mb-4 text-xl font-semibold text-gray-900">
      Bristol Scale Distribution
    </h3>
    <BristolDistributionChart data={data?.bristolDistribution} />
  </Card>

  {/* 4 more chart cards... */}
</div>
```

---

## Part 4: SETTINGS PAGE IMPLEMENTATION

### File Location & Architecture
```
src/pages/Settings.tsx
├── Navigation Array (6 categories)
│   ├── Profile (User icon)
│   ├── Notifications (Bell icon)
│   ├── Privacy & Security (Lock icon)
│   ├── Billing (CreditCard icon)
│   ├── Data Management (Shield icon)
│   └── Preferences (Globe icon)
│
└── For Each Category
    ├── Icon + Title + Description
    ├── "Configure" button linking to sub-page
    └── Navigates to /settings/{category}

Sub-pages (in src/pages/settings/):
├── ProfileSettings.tsx
├── NotificationsSettings.tsx
├── PrivacySecuritySettings.tsx
├── BillingSettings.tsx
├── DataManagementSettings.tsx
└── PreferencesSettings.tsx
```

### Main Settings Page Structure
```tsx
export default function Settings() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Profile',
      icon: User,
      description: 'Manage your personal information...',
      path: '/settings/profile',
    },
    // ... 5 more sections
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Settings
            </h1>
            <p className="text-gray-600">
              Manage your account and preferences
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4"
                      onClick={() => navigate(section.path)}
                    >
                      Configure
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Settings Page Layout Component
```
src/components/SettingsPageLayout.tsx
├── Props
│   ├── title: string
│   ├── description: string
│   └── children: React.ReactNode
│
├── Features
│   ├── Back button to /settings
│   ├── Page title and description
│   ├── Settings form content
│   └── Save/Cancel buttons
│
└── Layout
    ├── Sidebar + Main content
    ├── Fixed container max-width: 600px
    └── Padding: responsive (4/6/8)
```

### Profile Settings Sub-page Example
```tsx
// src/pages/settings/ProfileSettings.tsx

export default function ProfileSettings() {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    date_of_birth: profile?.date_of_birth || '',
    phone_number: profile?.phone_number || '',
    medical_summary: profile?.medical_summary || '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    // Update profile via Supabase
    // Show success toast
    // Navigate back
  };

  return (
    <SettingsPageLayout
      title="Profile"
      description="Manage your personal information"
    >
      <Card>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          {/* More form fields... */}

          <div className="flex gap-3">
            <Button onClick={handleSave}>
              Save Changes
            </Button>
            <Button variant="secondary" onClick={() => navigate('/settings')}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </SettingsPageLayout>
  );
}
```

---

## Part 5: RESPONSIVE DESIGN BREAKPOINTS

### Mobile-First Approach
```
Base (< 640px - Mobile):
  ├─ Sidebar: Hamburger menu + overlay
  ├─ Main content: Full width
  ├─ Grid columns: 1
  ├─ Padding: 4/4/4 (p-4)
  └─ Font sizes: Base

sm (≥ 640px - Small Tablet):
  ├─ Padding: 6/6/6 (p-6)
  └─ Some 2-column layouts

md (≥ 768px - Tablet):
  ├─ Grid columns: 2 where applicable
  ├─ Sidebar: Still hamburger
  └─ More breathing room

lg (≥ 1024px - Desktop):
  ├─ Sidebar: Fixed left, 256px
  ├─ Main content: ml-64
  ├─ Grid columns: 2-3
  ├─ Padding: 8/8/8 (p-8)
  └─ Full charts visible

xl (≥ 1280px - Large Desktop):
  ├─ Max-width containers applied
  ├─ Optimal spacing
  └─ Full data visualization
```

### Tailwind Responsive Classes Used
```
Sidebar positioning:
  lg:ml-64        Main content left margin on desktop
  lg:pt-0         Remove top padding on desktop
  pt-16 lg:pt-0   Add top padding on mobile for fixed menu

Grid layouts:
  grid-cols-1       Single column (mobile)
  sm:grid-cols-2    Two columns on tablet
  md:grid-cols-2    Two columns on medium
  lg:grid-cols-2    Two columns on desktop
  md:grid-cols-3    Three columns (settings)

Flex layouts:
  flex-col                Stack vertically (mobile)
  sm:flex-row             Horizontal on tablet+
  sm:items-center         Center align horizontally
  sm:justify-between      Space between on tablet+

Hidden elements:
  print:hidden    Hide on print
  lg:hidden       Hide on desktop (mobile menu)
  hidden lg:block Hide on mobile, show on desktop
```

---

## Part 6: DATA FLOW & STATE MANAGEMENT

### Insights Page Data Flow
```
Component Mount
    ↓
useEffect() → loadInsights (if user exists)
    ↓
loadInsights()
├─ setLoading(true)
├─ Call getUserInsights(user.id)
├─ Update insights state
└─ setLoading(false)
    ↓
Render with data
    ↓
User clicks "Refresh Insights"
├─ setGenerating(true)
├─ Call generateAllInsights(user.id)
├─ Call saveInsights(newInsights)
├─ Call loadInsights() to reload
└─ setGenerating(false)
```

### Trends Page Data Flow
```
Component Mount
    ↓
useState → selectedRange = 7 days (default)
    ↓
useTrendsData hook (automatic)
├─ Fetches data for selected time range
├─ Returns { data, loading, error }
└─ Re-runs when selectedRange changes
    ↓
User selects different time period
    ↓
setSelectedRange(newRange)
    ↓
Hook re-fetches data
    ↓
Charts update with new data
```

### Settings Page Data Flow
```
Settings Hub Load
    ↓
Show all 6 settings categories
    ↓
User clicks "Configure" on category
    ↓
Navigate to /settings/{category}
    ↓
Sub-page loads with current user data
    ↓
User edits fields
    ↓
User clicks "Save Changes"
    ↓
Update Supabase database
    ↓
Show success toast
    ↓
Navigate back to /settings
```

---

## Part 7: ERROR HANDLING PATTERNS

### Try/Catch Pattern (Insights)
```tsx
const loadInsights = useCallback(async () => {
  if (!user) return;

  try {
    setLoading(true);
    setError(null);
    const data = await getUserInsights(user.id);
    setInsights(data);
  } catch (err) {
    console.error('Error loading insights:', err);
    setError('Failed to load insights. Please try again.');
  } finally {
    setLoading(false);
  }
}, [user]);
```

### Display Error Banner
```tsx
{error && (
  <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
    <p className="text-yellow-800">{error}</p>
  </div>
)}
```

### Validation in Forms (Settings)
```tsx
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const handleSave = async () => {
  if (!formData.email || !validateEmail(formData.email)) {
    setError('Please enter a valid email address');
    return;
  }

  try {
    await updateProfile(formData);
    showSuccessToast('Profile updated successfully');
  } catch (err) {
    setError('Failed to update profile');
  }
};
```

---

## Part 8: PERFORMANCE OPTIMIZATION

### useCallback for memoization (Insights)
```tsx
const loadInsights = useCallback(async () => {
  // Only recreates if `user` dependency changes
  // Prevents unnecessary re-renders
}, [user]);

// Include in dependency array
useEffect(() => {
  if (user) {
    loadInsights();
  }
}, [user, loadInsights]); // ← loadInsights included
```

### Component Lazy Loading
```tsx
// For heavy chart components, consider:
const BMFrequencyChart = lazy(() =>
  import('../components/trends/BMFrequencyChart')
);

<Suspense fallback={<div>Loading chart...</div>}>
  <BMFrequencyChart data={data} />
</Suspense>
```

### Data Caching Strategy
```tsx
// Store fetched trends data to avoid refetching
const [cachedData, setCachedData] = useState({});

const useTrendsData = (range) => {
  const cacheKey = `trends_${range.days}`;

  if (cachedData[cacheKey]) {
    return { data: cachedData[cacheKey], loading: false, error: null };
  }

  // Fetch if not cached
  return fetchAndCache(range, cacheKey);
};
```

---

## Part 9: ACCESSIBILITY CHECKLIST

- [ ] All buttons have descriptive aria-labels
- [ ] Form inputs have associated labels
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible on all interactive elements
- [ ] Loading states announced to screen readers
- [ ] Error messages associated with form fields
- [ ] Images have descriptive alt text
- [ ] Mobile menu has proper role attributes
- [ ] Charts include data tables as fallback

---

## Part 10: TESTING GUIDELINES

### Unit Tests
```typescript
// Test Insights component
describe('Insights Component', () => {
  test('displays loading spinner initially', () => {
    render(<Insights />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('displays empty state when no insights', () => {
    render(<Insights />);
    expect(screen.getByText(/Your Insights Are Brewing/)).toBeInTheDocument();
  });

  test('calls handleGenerateInsights on button click', () => {
    render(<Insights />);
    const button = screen.getByRole('button', { name: /Refresh/ });
    fireEvent.click(button);
    expect(generateAllInsights).toHaveBeenCalled();
  });
});
```

### Integration Tests
```typescript
// Test Trends page full flow
describe('Trends Page Integration', () => {
  test('loads data and displays charts', async () => {
    render(<Trends />);

    await waitFor(() => {
      expect(screen.getByText(/Daily Frequency/)).toBeInTheDocument();
    });
  });

  test('exports data when export button clicked', () => {
    render(<Trends />);
    const exportBtn = screen.getByRole('button', { name: /Export/ });
    fireEvent.click(exportBtn);
    expect(downloadCSV).toHaveBeenCalled();
  });
});
```

### E2E Tests
```typescript
// Test Settings flow end-to-end
describe('Settings Configuration Flow', () => {
  test('user can update profile', () => {
    cy.visit('/settings');
    cy.contains('Profile').click();
    cy.get('input[name="full_name"]').clear().type('Jane Doe');
    cy.contains('Save Changes').click();
    cy.contains('Profile updated').should('be.visible');
  });
});
```

---

## Summary

This implementation guide provides:
✓ Complete component architecture
✓ Data flow patterns
✓ Responsive design strategy
✓ Error handling approaches
✓ Performance optimization techniques
✓ Accessibility requirements
✓ Testing frameworks
✓ File organization

All sections follow industry best practices for React/TypeScript applications while maintaining consistency across the GutWise health tracking platform.
