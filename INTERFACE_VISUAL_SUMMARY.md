# GutWise Interface Visual Summary

## Quick Reference Guide for Health Insights, Trends, and Settings

---

## 1. SIDEBAR NAVIGATION - COMPLETE HIERARCHY

```
┌─────────────────────────────────────┐
│                                     │
│    🔷 GutWise                       │
│                                     │
├─────────────────────────────────────┤
│ MAIN MENU                           │
├─────────────────────────────────────┤
│ 📊 Dashboard                        │
│                                     │
│ 📖 Logging Hub            ▼ EXPAND  │
│  ├─ 💨 Bowel Movement              │
│  ├─ 🍽️  Food Intake                │
│  ├─ ⚠️  Symptoms                    │
│  ├─ 🌙 Sleep                       │
│  ├─ 🧠 Stress                      │
│  ├─ 💧 Hydration                   │
│  ├─ ❤️  Menstrual Cycle             │
│  └─ 💊 Medication                  │
│                                     │
│ 🧠 Health Insights                 │
│                                     │
│ 📈 Trends & Analytics              │
│                                     │
│ 📄 Reports                         │
│                                     │
│ 👥 Community                       │
│                                     │
│ ⚙️  Settings                        │
│                                     │
├─────────────────────────────────────┤
│ USER PROFILE (Bottom)               │
├─────────────────────────────────────┤
│ [Avatar] John Doe                   │
│          john@example.com           │
│                                     │
└─────────────────────────────────────┘
```

**Responsive Behavior:**
- Desktop (≥1024px): Fixed left sidebar, 256px wide
- Tablet/Mobile (<1024px): Hamburger menu icon (top-left), overlay sidebar

---

## 2. HEALTH INSIGHTS PAGE LAYOUT

### Header Section
```
═══════════════════════════════════════════════════════════════
  🧠 Health Insights
  Pattern-based analysis of your digestive health data.
                                    [✨ Refresh Insights Button]
═══════════════════════════════════════════════════════════════
```

### Empty State (No Data)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        🧠 (floating)                        │
│                                                             │
│              Your Insights Are Brewing                      │
│                                                             │
│   We need a few days of data to identify meaningful         │
│   patterns. The more consistently you log, the better       │
│   your insights become.                                     │
│                                                             │
│   Logging meals, symptoms, hydration, sleep, and stress    │
│   creates the strongest analysis.                           │
│                                                             │
│           [📊 Analyze Latest Data Button]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Populated State (With Insights)
```
┌─────────────────────────────────────┬─────────────────────────────────────┬─────────────────────────────────────┐
│ 📊 Active Insights                  │ 🔍 Analysis Style                   │ ✅ Best Results                     │
│ ────────────────────                │ ─────────────────                   │ ──────────────                      │
│ 7                                   │ Rule-based and transparent          │ Consistent multi-category logging   │
└─────────────────────────────────────┴─────────────────────────────────────┴─────────────────────────────────────┘

ℹ️  How Insights Work
────────────────────────────────────────────────────────────────
Insights are generated using transparent rules based on repeated
patterns in your data. Confidence improves when the same pattern
appears consistently over time.

┌─────────────────────────────────────┬─────────────────────────────────────┐
│ 💧 Hydration & BM Frequency        │ 🌙 Sleep Quality Impact             │
│ ─────────────────────────────────── │ ─────────────────────────────────── │
│ When you drink more water, your BM  │ Higher sleep quality correlates     │
│ frequency tends to increase by 30%. │ with 45% fewer urgent BMs.          │
│                                     │                                     │
│ Confidence: High (23 observations)  │ Confidence: Medium (8 observations) │
│ Recommendation: Maintain hydration  │ Action: Improve sleep routine       │
└─────────────────────────────────────┴─────────────────────────────────────┘

[Additional insight cards in 2-column grid...]
```

---

## 3. TRENDS & ANALYTICS PAGE LAYOUT

### Header Section
```
═══════════════════════════════════════════════════════════════════
  📈 Trends & Analytics
  Visualize your health patterns over time
                                    [⬇️  Export Data]  [⬇️  Print Report]
═══════════════════════════════════════════════════════════════════
```

### Time Period Selector
```
┌───────────────────────────────────────────────────────────────┐
│ 📅 Time Period:   [7 Days]  [14 Days]  [30 Days]             │
│                    ^^^^^^^                                     │
│                  (selected)                                    │
└───────────────────────────────────────────────────────────────┘
```

### Charts Section (6 Total)

#### Chart 1: Daily Frequency Trend
```
┌─────────────────────────────────────────────────────────────┐
│ Daily Frequency Trend                        Avg: 0.4 per day
│                                                              │
│ 2 BMs │                    ┌─┐                              │
│      │                    │ │                              │
│ 1 BM │      ┌─┐      ┌─────┤ │                              │
│      │      │ │  ┌─┐ │     │ │                              │
│ 0 BM │──────┘ │──┤ │─┘     └─┘──────                        │
│      └────────────────────────────────                       │
│      Mar 25 Mar 26 Mar 27 ... Mar 31                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Chart 2: Bristol Scale Distribution
```
┌─────────────────────────────────────────────────────────────┐
│ Bristol Scale Distribution                                  │
│                                                              │
│ Type 1 (hard)    ░░░░░░░░░░░░░░░░░░░░░░░░░░░ 28%          │
│ Type 2          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 36% │
│ Type 3-4 (ideal) ░░░░░░░░░░░░░░░░░░░░░░░░ 22%             │
│ Type 5          ░░░░░░░░░░░░░░░░░░░░░░░ 10%               │
│ Type 6-7 (loose) ░░░░░░░░░░░░ 4%                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Chart 3: Symptom Intensity Heatmap
```
┌─────────────────────────────────────────────────────────────┐
│ Symptom Intensity Heatmap      (Low → Medium → High)         │
│                                                              │
│ Bloating    ██░░░░░░░░░░░░░░░░░░░░░░░░░░ Mid              │
│ Cramping    ████████░░░░░░░░░░░░░░░░░░░░ High             │
│ Urgency     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Low              │
│ Fatigue     ██████░░░░░░░░░░░░░░░░░░░░░░ Low-Mid          │
│ Brain Fog   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Very Low         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Chart 4: Hydration-Symptom Correlation
```
┌─────────────────────────────────────────────────────────────┐
│ Hydration vs. Symptom Severity                              │
│                                                              │
│ Severity │                                                  │
│   High   │        •                                         │
│          │              •        •                          │
│   Med    │                    •      •   •                 │
│          │                            •                     │
│   Low    │ •                                   •            │
│          │─────────────────────────────────────────         │
│      Low    Medium    High    Very High (Hydration ml)     │
│                                                              │
│ Trend: More hydration = Lower symptom severity             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Chart 5: Sleep-Symptom Relationship (Dual Axis)
```
┌─────────────────────────────────────────────────────────────┐
│ Sleep Quality vs. Daily Symptoms                            │
│                                                              │
│ Sleep │        ───────                                      │
│ Hours │  ──────       ─────                                 │
│  8    │/                                                    │
│       │                                                      │
│  6    │                                                      │
│       │─────  Symptoms: ▲▲▲  ▼  ▲▲  ▼▼▼  ▼▼                │
│  4    │                                                      │
│       │                                                      │
│  2    │                                                      │
│       ├──────────────────────────────────────────           │
│       Mon Tue Wed Thu Fri Sat Sun                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Chart 6: Stress-Urgency Pattern (Scatter Plot)
```
┌─────────────────────────────────────────────────────────────┐
│ Stress Level vs. BM Urgency                                 │
│                                                              │
│ Urgency │                                   •               │
│ Level   │                            •  •       •           │
│   8     │                     •  •                          │
│         │                                                    │
│   6     │              •  •                                 │
│         │         •  •                                      │
│   4     │    •                                              │
│         │                                                    │
│   2     │ •                                                 │
│         ├──────────────────────────────────────────         │
│         2    4    6    8   10   (Stress Level 1-10)        │
│                                                              │
│ Finding: High stress = Higher urgency incidents            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Export & Print Options
```
💾 Export Data
  ├─ CSV Format (spreadsheet-compatible)
  ├─ JSON Format (machine-readable)
  └─ PDF Format (formatted report)

🖨️  Print Report
  └─ Optimized layout for printer/PDF output
     • Professional formatting
     • Page breaks at chart boundaries
     • Includes metadata and timestamps
```

---

## 4. SETTINGS PAGE LAYOUT

### Header Section
```
═══════════════════════════════════════════════════════════════
  ⚙️  Settings
  Manage your account and preferences
═══════════════════════════════════════════════════════════════
```

### Settings Categories Grid (Stacked on Mobile, Horizontal on Desktop)

```
┌──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ 👤 PROFILE               │ 🔔 NOTIFICATIONS         │ 🔒 PRIVACY & SECURITY    │
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ Manage your personal      │ Control how and when you │ Manage your data privacy │
│ information and profile   │ receive updates           │ and security settings    │
│ details                   │                          │                          │
│                           │                          │                          │
│ [Configure]              │ [Configure]              │ [Configure]              │
└──────────────────────────┴──────────────────────────┴──────────────────────────┘

┌──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ 💳 BILLING               │ 🛡️  DATA MANAGEMENT      │ 🌐 PREFERENCES           │
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ View and manage your      │ Export, backup, or       │ Customize your           │
│ subscription and payment  │ delete your health data  │ experience and app       │
│ methods                   │                          │ preferences              │
│                           │                          │                          │
│ [Configure]              │ [Configure]              │ [Configure]              │
└──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

### Profile Settings Sub-page
```
/settings/profile

[← Back to Settings]

📋 Profile Information
─────────────────────
Full Name:               [John Doe                    ]
Email Address:          [john@example.com            ]
Date of Birth:          [01/15/1990                  ]
Phone Number (optional):[+1 (555) 123-4567          ]

Profile Picture:
[Current Avatar] [Change Photo]

Medical History Summary:
[Text area for patient-provided medical context...]

[Save Changes] [Cancel]
```

### Notifications Settings Sub-page
```
/settings/notifications

[← Back to Settings]

🔔 Notification Preferences
───────────────────────────

Email Notifications          [Toggle: ON  ]
Daily Digest                 [Toggle: OFF ]
Alert Frequency:             [Immediate ▼]
  └─ Immediate / 1x Daily / Weekly

Notification Types:
  ☑ Health Insights
  ☑ Daily Reminders
  ☑ Report Ready
  ☐ Community Updates
  ☑ Important Alerts

Quiet Hours:
From [9:00 PM ▼] to [8:00 AM ▼]

[Save Changes]
```

### Privacy & Security Settings Sub-page
```
/settings/privacy-security

[← Back to Settings]

🔐 Security
───────────

Change Password:          [Change Password Button]
Two-Factor Auth:          [Enable 2FA] ← NOT ENABLED
Active Sessions:          [2 active devices] [Manage]

📊 Data & Privacy
──────────────────

Data Collection:
  ☑ Symptom tracking
  ☑ Nutrition analysis
  ☑ Sleep monitoring
  ☑ Stress correlation

Share Data With:
  ☐ Healthcare providers (when exporting)
  ☐ Research (anonymized)

Privacy Policy:      [Read Full Policy]
HIPAA Compliance:    [View Compliance Info]

[Save Changes]
```

### Billing Settings Sub-page
```
/settings/billing

[← Back to Settings]

💳 Subscription Management
──────────────────────────

Current Plan:           Premium ($9.99/month)
Billing Cycle:          Monthly (renews Apr 1, 2026)
Status:                 Active

Payment Method:
Visa ending in 4242    [Change Method]

Invoice History:
Mar 1, 2026   Premium Monthly    $9.99    [Download PDF]
Feb 1, 2026   Premium Monthly    $9.99    [Download PDF]
Jan 1, 2026   Premium Monthly    $9.99    [Download PDF]

Plan Options:
[Free] [Standard] [Premium (Current)]

[Upgrade / Downgrade / Cancel Subscription]
```

### Data Management Settings Sub-page
```
/settings/data-management

[← Back to Settings]

📥 Export Your Data
───────────────────

Format: [CSV ▼] (JSON / PDF)
Date Range: [Last 30 days ▼]
Categories:
  ☑ All logs
  ☑ Insights
  ☑ Reports

[Download Export]

🔄 Data Backup
──────────────

Automatic Backups:    [Enable] ← ENABLED
Backup Schedule:      [Weekly ▼]
Last Backup:          Today at 3:45 PM

🗑️  Dangerous Actions
────────────────────

Delete All Data:      [Delete All Data] (irreversible)
Delete Account:       [Delete Account] (irreversible)

[Confirm Actions require additional verification]
```

### Preferences Settings Sub-page
```
/settings/preferences

[← Back to Settings]

🌍 Regional
───────────

Language:              [English ▼]
Timezone:              [America/New_York ▼]
Units:                 [Metric ▼] (Imperial)

🎨 Display
──────────

Theme:                 [Light ▼] (Dark)
Font Size:             [Normal ▼] (Large)

📊 Defaults
───────────

Default Chart Type:    [Line Chart ▼]
Date Range:            [7 Days ▼]
Show All Categories:   [Toggle: ON]

[Save Changes]
```

---

## 5. ACCOUNT SETTINGS PAGE

```
/account

[← Back]

Account Settings

📧 Email & Identity
─────────────────────

Email:                  john@example.com
Last Login:             Today at 10:15 AM
Account Created:        January 15, 2024

🔐 Security Actions
─────────────────────

Change Password:        [Change Password Button]
Sign Out:               [Sign Out Button]
Delete Account:         [Delete Account Button]

```

---

## 6. RESPONSIVE LAYOUTS

### Mobile (< 768px)
```
┌────────────────┐
│ ☰              │ ← Hamburger menu
│                │
│ Health Insights│
│ Pattern-based..│
│                │
│ [Refresh]      │
│                │
├────────────────┤
│ 📊 Active: 7   │
│                │
│ 🔍 Rule-based  │
│                │
│ ✅ Consistent  │
└────────────────┘

Single column layouts
Stacked cards
Full-width elements
Touch-friendly sizes (48px+ tap targets)
```

### Tablet (768px - 1023px)
```
┌────────────────────────────────────┐
│ ☰ Health Insights    [Refresh]     │
│ Pattern-based analysis...          │
├────────────────────────────────────┤
│ 📊 Active: 7  │ 🔍 Rule-based      │
│               ├────────────────────┤
│               │ ✅ Consistent      │
├────────────────────────────────────┤
│ Insight Card 1  │ Insight Card 2   │
├────────────────┼────────────────────┤
│ Insight Card 3  │ Insight Card 4   │
└────────────────────────────────────┘

2-column grid where possible
Sidebar collapses/overlays
Optimized for landscape orientation
```

### Desktop (≥ 1024px)
```
┌──────────────┬──────────────────────────────┐
│ 📊           │ Health Insights              │
│ Logging Hub▼ │ Pattern-based analysis...    │
│ 🧠 Insights  │                  [Refresh]   │
│ 📈 Trends    ├──────────────────────────────┤
│ 📄 Reports   │ 📊 Active  │ 🔍 Rule-based   │
│ 👥 Community │ 7          │ Rule-based...   │
│ ⚙️  Settings  │            ├───────────────┤
│              │            │ ✅ Consistent  │
│ [User] ✓     ├──────────────────────────────┤
│              │ [Insight 1]  │  [Insight 2]  │
└──────────────┼──────────────┬───────────────┘
               │ [Insight 3]  │  [Insight 4]  │
               └──────────────┴───────────────┘

Fixed sidebar navigation
Full content width
Multi-column grids
Optimal data visualization
```

---

## 7. KEY DESIGN ELEMENTS

### Color Palette
```
🟢 Primary Teal         #14b8a6 (Teal-600)
🔵 Secondary Blue       #3b82f6 (Blue-500)
⚪ Background Gray      #f9fafb (Gray-50)
🖤 Text Dark            #111827 (Gray-900)
🩶 Text Light           #4b5563 (Gray-600)
━━━━━━━━━━━━━━━━━━━━━
🟡 Success Green        #10b981
🔴 Error Red            #ef4444
🟠 Warning Orange       #f59e0b
🔵 Info Blue            #3b82f6
```

### Typography Hierarchy
```
H1: 32px bold (Page titles)
H2: 20px semibold (Section titles)
H3: 18px semibold (Card titles)
Body: 16px normal (Main text)
Small: 14px (Secondary info)
Tiny: 12px (Labels/captions)
```

### Component Spacing
```
xs: 4px (tight spacing)
sm: 8px (standard padding)
md: 16px (comfortable spacing)
lg: 24px (generous spacing)
xl: 32px (section breaks)
```

---

## 8. INTERACTION PATTERNS

### Buttons
```
Primary (CTA):    [Blue background, white text, hover darker]
Secondary:        [Gray background, gray text, hover lighter]
Outline:          [White background, border, colored text]
Danger:           [Red background, white text, hover darker]
Disabled:         [Gray background, no hover effect]
Loading:          [Spinner animation, text changes to "Loading..."]
```

### Forms
```
Input Fields:     Rounded corners, gray border, teal focus ring
Dropdowns:        Gray border, chevron icon, hover effect
Toggles:          Teal when ON, gray when OFF
Checkboxes:       Teal checkmark when selected
Radio Buttons:    Teal filled circle when selected
Validation:       Red text for errors, green for success
```

### Feedback
```
Success Toast:    Green background, white text (auto-dismiss)
Error Alert:      Red background, white text (persistent)
Info Banner:      Blue background, white text (persistent)
Loading Spinner:  Teal rotating icon (centered)
Empty State:      Large icon, helpful messaging, CTA
```

---

## Summary of User Journeys

### Health Insights Journey
```
Dashboard → Health Insights →
  (if data insufficient) → "Your Insights Are Brewing" → Analyze Data
  (if data sufficient) → View Insights Grid → Read Pattern Analysis → Share/Export
```

### Trends Analysis Journey
```
Dashboard → Trends & Analytics →
  Select Time Period → View Charts →
  Analyze Patterns → Export/Print → Share
```

### Settings Configuration Journey
```
Dashboard → Settings Hub →
  Choose Category → Configure Settings →
  Save Changes → Confirmation Toast →
  Return to Settings Hub
```

### Account Management Journey
```
Sidebar User Profile → Account Settings →
  Update Profile/Security →
  Change Settings → Sign Out or Delete
```

---

This visual summary demonstrates a cohesive, professional interface aligned with healthcare application standards while maintaining excellent usability across all devices.
