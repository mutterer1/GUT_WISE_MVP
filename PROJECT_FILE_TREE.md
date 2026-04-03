# Project File Tree Structure

**Health Tracking Application - Complete Directory Hierarchy**

```
project-root/
┣ .bolt/                                          # Bolt.new configuration
┃ ┣ config.json
┃ ┣ mcp.json
┃ ┗ prompt
┣ .env                                            # Environment variables (LOCAL)
┣ .gitignore                                      # Git ignore rules
┣ index.html                                      # HTML entry point
┣ package.json                                    # Project dependencies
┣ package-lock.json                               # Dependency lock file
┣ tsconfig.json                                   # TypeScript configuration
┣ tsconfig.app.json                               # App TypeScript config
┣ tsconfig.node.json                              # Node TypeScript config
┣ eslint.config.js                                # ESLint configuration
┣ vite.config.ts                                  # Vite build configuration
┣ tailwind.config.js                              # Tailwind CSS configuration
┣ postcss.config.js                               # PostCSS configuration
┣
┣ src/                                            # Source code
┃ ┣ App.tsx                                       # Main app component (UPDATED)
┃ ┣ main.tsx                                      # Application entry point
┃ ┣ index.css                                     # Global styles
┃ ┣ animations.css                                # Animation definitions
┃ ┣ vite-env.d.ts                                 # Vite environment types
┃ ┣
┃ ┣ lib/                                          # Libraries & utilities
┃ ┃ ┗ supabase.ts                                 # Supabase client initialization
┃ ┣
┃ ┣ services/                                     # Service layer
┃ ┃ ┗ saveEventManager.ts                         # (NEW) Save event manager singleton
┃ ┣
┃ ┣ hooks/                                        # Custom React hooks
┃ ┃ ┣ useSaveEventHandler.ts                      # (NEW) Global save event listener
┃ ┃ ┣ useDashboardData.ts                         # Dashboard data fetching
┃ ┃ ┣ useTrendsData.ts                            # Trends visualization data
┃ ┃ ┣ useMealStatistics.ts                        # Meal statistics calculations
┃ ┃ ┗ useAutoGenerateInsights.ts                  # Auto-generate insights
┃ ┣
┃ ┣ contexts/                                     # React contexts
┃ ┃ ┗ AuthContext.tsx                             # Authentication context
┃ ┣
┃ ┣ components/                                   # React components
┃ ┃ ┣ App-level components
┃ ┃ ┣ Header.tsx                                  # Top navigation header
┃ ┃ ┣ Sidebar.tsx                                 # Left sidebar navigation
┃ ┃ ┣ ProtectedRoute.tsx                          # Route protection wrapper
┃ ┃ ┣ Button.tsx                                  # Reusable button component
┃ ┃ ┣ Card.tsx                                    # Reusable card component
┃ ┃ ┣ EmptyState.tsx                              # Empty state display
┃ ┃ ┣
┃ ┃ ┣ Notification & Feedback
┃ ┃ ┣ SuccessToast.tsx                            # Success notification toast
┃ ┃ ┣ GlobalSaveNotification.tsx                  # (NEW) Global notification handler
┃ ┃ ┣
┃ ┃ ┣ Specialized Components
┃ ┃ ┣ InsightCard.tsx                             # Insight display card
┃ ┃ ┣ StreakTracker.tsx                           # Streak tracking display
┃ ┃ ┣ WelcomeBanner.tsx                           # Welcome banner
┃ ┃ ┣ EncouragementPrompt.tsx                     # Encouragement prompts
┃ ┃ ┣
┃ ┃ ┣ dashboard/                                  # Dashboard widgets
┃ ┃ ┃ ┣ TodaySummaryWidget.tsx                    # Today's summary
┃ ┃ ┃ ┣ BMCountWidget.tsx                         # BM count display
┃ ┃ ┃ ┣ BristolScaleWidget.tsx                    # Bristol scale widget
┃ ┃ ┃ ┣ SymptomSnapshotWidget.tsx                 # Symptom snapshot
┃ ┃ ┃ ┣ HydrationWidget.tsx                       # Hydration tracking
┃ ┃ ┃ ┣ MedicationWidget.tsx                      # Medication tracker
┃ ┃ ┃ ┗ PatternInsightsWidget.tsx                 # Pattern insights
┃ ┃ ┣
┃ ┃ ┣ trends/                                     # Trend visualization charts
┃ ┃ ┃ ┣ BMFrequencyChart.tsx                      # BM frequency chart
┃ ┃ ┃ ┣ BristolDistributionChart.tsx              # Bristol scale distribution
┃ ┃ ┃ ┣ SymptomIntensityChart.tsx                 # Symptom intensity chart
┃ ┃ ┃ ┣ SleepSymptomChart.tsx                     # Sleep vs symptom correlation
┃ ┃ ┃ ┣ StressUrgencyChart.tsx                    # Stress vs urgency chart
┃ ┃ ┃ ┗ HydrationCorrelationChart.tsx             # Hydration correlation chart
┃ ┃ ┣
┃ ┃ ┗ reports/                                    # Report generation components
┃ ┃   ┣ ExecutiveSummary.tsx                      # Executive summary section
┃ ┃   ┣ DateRangeSelector.tsx                     # Date range picker
┃ ┃   ┣ BMAnalyticsSection.tsx                    # BM analytics
┃ ┃   ┣ BristolDistributionSection.tsx            # Bristol distribution
┃ ┃   ┣ SymptomProgressionSection.tsx             # Symptom progression
┃ ┃   ┣ SleepSymptomChart.tsx                     # Sleep patterns
┃ ┃   ┣ HealthMarkersSection.tsx                  # Health markers
┃ ┃   ┣ TriggerPatternsSection.tsx                # Trigger patterns
┃ ┃   ┣ MedicationCorrelationSection.tsx          # Medication correlation
┃ ┃   ┗ ClinicalAlertsSection.tsx                 # Clinical alerts
┃ ┣
┃ ┣ pages/                                        # Page components
┃ ┃ ┣ Authentication
┃ ┃ ┣ Landing.tsx                                 # Landing page
┃ ┃ ┣ Login.tsx                                   # Login page
┃ ┃ ┣ Signup.tsx                                  # Registration page
┃ ┃ ┣
┃ ┃ ┣ Main App Pages
┃ ┃ ┣ Dashboard.tsx                               # Main dashboard
┃ ┃ ┣ Insights.tsx                                # Insights page
┃ ┃ ┣ Meals.tsx                                   # Meal planning page
┃ ┃ ┣ Trends.tsx                                  # Trends analysis
┃ ┃ ┣ Reports.tsx                                 # Reports page
┃ ┃ ┣ Community.tsx                               # Community page
┃ ┃ ┣ Settings.tsx                                # Settings page
┃ ┃ ┣ Account.tsx                                 # Account management
┃ ┃ ┣
┃ ┃ ┣ Log Entry Pages (UPDATED - emit save events)
┃ ┃ ┣ BMLog.tsx                                   # Bowel movement log
┃ ┃ ┣ FoodLog.tsx                                 # Food intake log
┃ ┃ ┣ SymptomsLog.tsx                             # Symptoms log
┃ ┃ ┣ SleepLog.tsx                                # Sleep tracking log
┃ ┃ ┣ StressLog.tsx                               # Stress level log
┃ ┃ ┣ HydrationLog.tsx                            # Hydration log
┃ ┃ ┣ MedicationLog.tsx                           # Medication log
┃ ┃ ┣ MenstrualCycleLog.tsx                       # Menstrual cycle tracker
┃ ┃ ┣
┃ ┃ ┣ Information Pages
┃ ┃ ┣ Privacy.tsx                                 # Privacy policy
┃ ┃ ┣ Disclaimer.tsx                              # Legal disclaimer
┃ ┃ ┗
┃ ┣
┃ ┣ types/                                        # TypeScript type definitions
┃ ┃ ┗ domain.ts                                   # Domain-specific types
┃ ┣
┃ ┣ constants/                                    # Application constants
┃ ┃ ┗ domain.ts                                   # Domain constants (Bristol scale, etc.)
┃ ┣
┃ ┗ utils/                                        # Utility functions
┃   ┣ calorieEstimator.ts                         # Calorie estimation
┃   ┣ dateFormatters.ts                           # Date/time formatting utilities
┃   ┣ copySystem.ts                               # Success/error message system
┃   ┣ supabaseHelper.ts                           # Supabase helper functions
┃   ┣ retryHelper.ts                              # Retry logic utilities
┃   ┣ insightEngine.ts                            # Insight generation engine
┃   ┗ clinicalReportQueries.ts                    # Clinical report queries
┃
┣ supabase/                                       # Supabase configuration
┃ ┗ migrations/                                   # Database migrations
┃   ┣ 20260331160220_create_users_and_profiles.sql
┃   ┣ 20260331160310_create_health_tracking_tables.sql
┃   ┣ 20260331160348_create_lifestyle_tracking_tables.sql
┃   ┣ 20260331160422_create_insights_and_reports_tables.sql
┃   ┣ 20260331160514_add_additional_performance_indexes.sql
┃   ┣ 20260331170325_create_bm_logs_table.sql
┃   ┣ 20260331171427_fix_bm_logs_schema_alignment.sql
┃   ┣ 20260331191521_create_insights_table.sql
┃   ┗ 20260401122429_create_menstrual_cycle_logs_table.sql
┃
┣ Documentation Files (Project Reference)
┣ CODE_EXPORT.md                                  # Code export reference
┣ CODE_REVIEW_SUMMARY.md                          # Code review summary
┣ MENSTRUAL_CYCLE_TRACKER_SPECS.md               # Feature specifications
┣ DASHBOARD_CHANGES_QUICK_REFERENCE.md            # Dashboard changes
┣ DASHBOARD_LAYOUT_CHANGES_SUMMARY.md             # Layout changes
┣ DASHBOARD_LAYOUT_OPTIMIZATION.md                # Optimization details
┣ DASHBOARD_LAYOUT_VISUAL_GUIDE.md                # Visual guide
┣ DASHBOARD_OPTIMIZATION_EXECUTIVE_SUMMARY.md     # Optimization summary
┣ NAVIGATION_CHANGES_FINAL_REPORT.md              # Navigation changes
┣ NAVIGATION_QUICK_CARD.md                        # Navigation quick ref
┣ SIDEBAR_NAVIGATION_CHANGES.md                   # Sidebar changes
┣ SIDEBAR_NAVIGATION_STRUCTURE.md                 # Navigation structure
┣ SIDEBAR_NAVIGATION_SUMMARY.md                   # Navigation summary
┣
┣ Save Event System Documentation (NEW)
┣ SAVE_EVENT_SYSTEM_DOCUMENTATION.md              # Complete technical guide
┣ SAVE_EVENT_SYSTEM_QUICK_REFERENCE.md            # Quick reference
┣ SAVE_EVENT_SYSTEM_CODE_REFERENCE.md             # Code examples
┣ SAVE_EVENT_SYSTEM_SUMMARY.md                    # Executive summary
┣ SAVE_EVENT_SYSTEM_VISUAL_GUIDE.md               # Architecture diagrams
┣ PROJECT_FILE_TREE.md                            # This file
┣
┣ node_modules/                                   # Dependencies (NOT SHOWN IN DETAIL)
┃ ┣ @supabase/supabase-js/                        # Supabase client
┃ ┣ react/                                        # React library
┃ ┣ react-dom/                                    # React DOM
┃ ┣ react-router-dom/                             # Routing
┃ ┣ lucide-react/                                 # Icons
┃ ┣ typescript/                                   # TypeScript
┃ ┣ vite/                                         # Build tool
┃ ┣ tailwindcss/                                  # Styling
┃ ┗ ... (additional dependencies)
┣
┗ dist/                                           # Build output (generated)
  ┣ index.html                                    # Built HTML
  ┣ assets/                                       # Built assets
  ┃ ┣ index-*.css                                 # Compiled styles
  ┃ ┗ index-*.js                                  # Compiled JavaScript
  ┗ (Generated on build)
```

---

## File Statistics

| Category | Count | Details |
|----------|-------|---------|
| **Pages** | 17 | Dashboard, Logs (8), Settings, Account, Community, Reports, Trends, Insights, Meals, Auth (3), Info (2) |
| **Components** | 25+ | Header, Sidebar, Cards, Widgets (7), Chart Components (6), Report Sections (9), Specialized (5+) |
| **Hooks** | 5 | Custom React hooks for data management |
| **Utils** | 7 | Helper functions for various operations |
| **Types** | 1 | TypeScript domain types |
| **Services** | 1 | Save event manager (NEW) |
| **Migrations** | 9 | Database schema migrations |
| **Documentation** | 18 | Project reference and guides |
| **Config Files** | 8 | Build, lint, type, environment config |

---

## Key Directories Explained

### `/src/` - Source Code
Main application code organized by function:
- **components/**: Reusable React components
- **pages/**: Full-page components/routes
- **hooks/**: Custom React hooks
- **contexts/**: React context providers
- **services/**: Business logic services
- **utils/**: Helper functions
- **lib/**: External library integrations
- **types/**: TypeScript definitions
- **constants/**: Static constants

### `/supabase/` - Database
- **migrations/**: SQL database schema changes
  - 9 migration files creating tables and indexes
  - Covers all log types and user management

### `/src/pages/` - Log Entry Pages
**All 8 monitored log types:**
1. BMLog.tsx - Bowel Movement ✅ UPDATED
2. FoodLog.tsx - Food Intake ✅ UPDATED
3. SymptomsLog.tsx - Symptoms ✅ UPDATED
4. SleepLog.tsx - Sleep ✅ UPDATED
5. StressLog.tsx - Stress Level ✅ UPDATED
6. HydrationLog.tsx - Hydration ✅ UPDATED
7. MedicationLog.tsx - Medication ✅ UPDATED
8. MenstrualCycleLog.tsx - Menstrual Cycle ✅ UPDATED

### `/src/components/` - Component Organization
**By Feature:**
- **dashboard/**: 7 widget components
- **trends/**: 6 chart components for analytics
- **reports/**: 9 report section components
- **Root**: 12 shared components (Button, Card, Toast, etc.)

### Documentation Structure
**By Topic:**
- **Dashboard**: 4 files on layout changes
- **Navigation**: 3 files on sidebar changes
- **Save Event System**: 5 comprehensive guides (NEW)
- **Code References**: 3 files on code structure

---

## New Files Added (Save Event System)

```
NEW: src/services/saveEventManager.ts
- Global singleton for event management
- TypeScript-safe event emission
- Listener subscription system

NEW: src/hooks/useSaveEventHandler.ts
- Global event listener hook
- Notification message generation
- Page scroll and reload triggers

NEW: src/components/GlobalSaveNotification.tsx
- Global toast notification display
- Custom event listener
- Integration with SuccessToast

NEW: SAVE_EVENT_SYSTEM_*.md (5 files)
- Comprehensive documentation
- Code examples
- Architecture diagrams
- Quick reference guides
```

---

## Updated Files (Save Event System Integration)

```
UPDATED: src/App.tsx
- Import GlobalSaveNotification
- Import useSaveEventHandler
- Create AppContent wrapper
- Initialize hook and component

UPDATED: All 8 Log Pages
- Import saveEventManager
- Emit 'save' event on INSERT
- Emit 'update' event on UPDATE
- ~3 lines per log page
```

---

## Build Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript compiler config |
| `tsconfig.app.json` | App-specific TypeScript settings |
| `tsconfig.node.json` | Node/build tool TypeScript settings |
| `vite.config.ts` | Vite build configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS configuration |
| `eslint.config.js` | ESLint linting rules |
| `package.json` | Dependencies and scripts |

---

## Environment Files

| File | Purpose |
|------|---------|
| `.env` | Local environment variables |
| `.gitignore` | Git ignore rules |

**Note:** Sensitive environment variables stored in `.env` should NOT be committed to version control.

---

## Database Tables (Via Migrations)

**Health Tracking Tables:**
- `users` - User profiles
- `bm_logs` - Bowel movement entries
- `food_logs` - Food intake entries
- `symptom_logs` - Symptom entries
- `sleep_logs` - Sleep tracking
- `stress_logs` - Stress level entries
- `hydration_logs` - Hydration entries
- `medication_logs` - Medication entries
- `menstrual_cycle_logs` - Menstrual cycle tracking
- `insights` - Generated insights
- `reports` - Generated reports

All tables have:
- Row Level Security (RLS) enabled
- Performance indexes
- Timestamp tracking (created_at, updated_at)

---

## Dependencies (See package.json)

**Production:**
- @supabase/supabase-js - Database & auth
- react - UI framework
- react-dom - React DOM rendering
- react-router-dom - Routing
- lucide-react - Icons

**Development:**
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- ESLint - Code linting
- Various build plugins and tools

---

## Build Output

**Generated after `npm run build`:**
- `dist/index.html` - Compiled HTML entry point
- `dist/assets/index-*.css` - Minified CSS
- `dist/assets/index-*.js` - Minified JavaScript

Files are optimized and ready for production deployment.

---

**Last Updated:** April 1, 2026
**Status:** Complete ✅
**Total Files:** 100+ (excluding node_modules)
