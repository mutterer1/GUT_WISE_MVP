# GutWise Interface - Quick Reference Card

## At-a-Glance Design Guide

---

## SIDEBAR NAVIGATION

| Component | Details |
|-----------|---------|
| **Position** | Fixed left (desktop) / Hamburger (mobile) |
| **Width** | 256px desktop, full-width overlay mobile |
| **Items** | Dashboard, Logging Hub (8 sub), Insights, Trends, Reports, Community, Settings |
| **User Profile** | Bottom section with avatar, name, email |
| **Active State** | Teal background (#14b8a6) |

---

## HEALTH INSIGHTS PAGE

| Section | Content |
|---------|---------|
| **Route** | `/insights` |
| **Header** | Title + Subtitle + "Refresh Insights" button |
| **Loading** | Centered teal spinner |
| **Empty State** | Brain icon animation + "Your Insights Are Brewing" message |
| **Populated** | 3-stat grid + Info banner + 2-column insights grid |
| **Error** | Yellow banner with AlertCircle icon |

### Insights Component States
```
Loading → Empty → Populated
  ↓           ↓        ↓
Spinner  "Brewing" Insights Cards
```

---

## TRENDS & ANALYTICS PAGE

| Section | Details |
|---------|---------|
| **Route** | `/trends` |
| **Header** | Title + Subtitle + Export/Print buttons |
| **Time Period** | 3 quick-select buttons (7/14/30 days) |
| **Charts** | 6 visualizations in 2-column grid |
| **Export** | JSON format with metadata |
| **Print** | Optimized CSS media query styling |

### 6 Charts
1. Daily Frequency Trend (bar chart)
2. Bristol Scale Distribution (horizontal bar)
3. Symptom Intensity Heatmap (color grid)
4. Hydration Correlation (scatter plot)
5. Sleep-Symptom Relationship (dual-axis line)
6. Stress-Urgency Pattern (scatter plot)

---

## SETTINGS HUB

| Category | Route | Icon |
|----------|-------|------|
| Profile | `/settings/profile` | User |
| Notifications | `/settings/notifications` | Bell |
| Privacy & Security | `/settings/privacy-security` | Lock |
| Billing | `/settings/billing` | CreditCard |
| Data Management | `/settings/data-management` | Shield |
| Preferences | `/settings/preferences` | Globe |

---

## DESIGN SYSTEM QUICK SPECS

### Colors
```
Primary Teal:      #14b8a6
Secondary Blue:    #3b82f6
Bg Light:          #f9fafb
Text Dark:         #111827
Text Light:        #4b5563
Success:           #10b981
Error:             #ef4444
Warning:           #f59e0b
```

### Typography
```
H1 (Titles):       32px bold
H2 (Sections):     20px semibold
H3 (Cards):        18px semibold
Body:              16px normal
Small:             14px normal
Tiny:              12px normal
```

### Spacing
```
xs: 4px  | sm: 8px  | md: 16px | lg: 24px | xl: 32px
```

### Components
```
Cards:      8px radius, gray-200 border, subtle shadow
Buttons:    8px radius, 10px 20px padding, 500 weight
Inputs:     6px radius, 16px font (iOS), focus ring
Icons:      Lucide React library throughout
```

---

## RESPONSIVE BREAKPOINTS

| Screen | Width | Sidebar | Grid | Key Change |
|--------|-------|---------|------|------------|
| Mobile | <640px | Hamburger | 1-col | Touch-optimized |
| Tablet | 640-1023px | Hamburger | 2-col | Wider content |
| Desktop | ≥1024px | Fixed left | 2-3 col | Sidebar always visible |

---

## STATE MANAGEMENT PATTERNS

### Insights Page
```
loadInsights (useCallback)
├─ Sets loading: true
├─ Fetches getUserInsights()
└─ Updates insights state

handleGenerateInsights
├─ Calls generateAllInsights()
├─ Saves results
└─ Reloads insights
```

### Trends Page
```
selectedRange (state)
├─ Defaults to 7 days
└─ Triggers useTrendsData() re-fetch

handleExport
└─ Creates JSON blob and downloads

handlePrint
└─ Triggers window.print()
```

### Settings Page
```
User clicks "Configure"
├─ Navigate to /settings/{category}
├─ Load form with current data
├─ User edits fields
└─ Save → Success toast → Return
```

---

## ERROR HANDLING

| Type | Display | Color |
|------|---------|-------|
| Loading | Centered spinner | Teal |
| Empty | Encouraging message | Teal background |
| Error | Yellow banner | Yellow-600 |
| Success | Auto-dismiss toast | Green |

---

## ACCESSIBILITY ESSENTIALS

- [ ] 4.5:1 color contrast (normal text)
- [ ] 3:1 contrast (interactive elements)
- [ ] Keyboard navigation throughout
- [ ] ARIA labels on icons
- [ ] Focus indicators visible
- [ ] Form labels associated
- [ ] Error messages linked to fields
- [ ] Mobile menu has proper roles

---

## PERFORMANCE TIPS

- Use `useCallback` for memoization
- Lazy load chart components
- Cache repeated API requests
- Optimize bundle with dynamic imports
- Minimize CSS-in-JS overhead

---

## FILE STRUCTURE

```
src/
├── pages/
│   ├── Insights.tsx
│   ├── Trends.tsx
│   ├── Settings.tsx
│   ├── Account.tsx
│   └── settings/
│       ├── ProfileSettings.tsx
│       ├── NotificationsSettings.tsx
│       ├── PrivacySecuritySettings.tsx
│       ├── BillingSettings.tsx
│       ├── DataManagementSettings.tsx
│       └── PreferencesSettings.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── SettingsPageLayout.tsx
│   └── trends/
│       ├── BMFrequencyChart.tsx
│       ├── BristolDistributionChart.tsx
│       ├── SymptomIntensityChart.tsx
│       ├── HydrationCorrelationChart.tsx
│       ├── SleepSymptomChart.tsx
│       └── StressUrgencyChart.tsx
└── utils/
    ├── insightEngine.ts
    └── [hooks & utilities]
```

---

## COMMON TAILWIND CLASSES

### Layout
```
lg:ml-64       Sidebar margin on desktop
pt-16 lg:pt-0  Mobile padding, removed on desktop
flex-1         Flexible content area
max-w-7xl      Maximum container width
```

### Grid
```
grid-cols-1         Single column (mobile)
sm:grid-cols-2      Two columns (tablet+)
md:grid-cols-3      Three columns (desktop)
gap-4              8px gap between items
gap-6              12px gap between items
```

### Responsive
```
sm:flex-row        Horizontal on small+ (default: flex-col)
md:grid-cols-2     Two columns on medium+
lg:hidden           Hidden on desktop+
print:hidden        Hidden when printing
```

### Styling
```
rounded-lg         8px border radius
rounded-xl         12px border radius
shadow-sm          Subtle shadow
border border-gray-200  1px border
```

---

## TESTING CHECKLIST

- [ ] Component renders without errors
- [ ] Props pass correctly to children
- [ ] Event handlers trigger correctly
- [ ] Loading states display
- [ ] Error states display
- [ ] Empty states display
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Color contrast OK
- [ ] Focus indicators visible
- [ ] Touch targets 48px+ minimum
- [ ] Page loads in <3 seconds
- [ ] No console errors/warnings

---

## DEPLOYMENT CHECKLIST

- [ ] Build successful (`npm run build`)
- [ ] No TypeScript errors
- [ ] All routes accessible
- [ ] Responsive on all breakpoints
- [ ] Mobile menu functional
- [ ] All buttons clickable
- [ ] Forms submit correctly
- [ ] Data exports work
- [ ] Print preview looks good
- [ ] No broken images
- [ ] Performance acceptable
- [ ] Accessibility audit passed

---

## QUICK COMMANDS

```bash
# Development
npm run dev                    Start dev server
npm run build                  Build for production
npm run preview                Preview production build
npm run typecheck              Type checking
npm run lint                   Linting

# Testing (when available)
npm test                       Run tests
npm run test:coverage          Coverage report
```

---

## USEFUL LINKS

- **Lucide Icons**: https://lucide.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **React Hooks**: https://react.dev/reference/react/hooks
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Supabase Docs**: https://supabase.com/docs

---

## KEY TAKEAWAYS

✓ **Sidebar** - Central navigation hub, responsive design, always accessible
✓ **Insights** - Rule-based analysis, 3 content states, encouraging messaging
✓ **Trends** - 6 visualizations, customizable time periods, export/print support
✓ **Settings** - 6 categories, sub-page configuration, easy management

All sections follow the same design system, maintain accessibility standards, and work seamlessly across all devices.

---

**Last Updated**: April 1, 2026
**Version**: 1.0 Complete
**Status**: Production Ready
