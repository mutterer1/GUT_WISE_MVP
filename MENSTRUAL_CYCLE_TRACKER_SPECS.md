# Menstrual Cycle Tracker - Implementation Specifications

## Overview

A comprehensive menstrual cycle tracking feature has been successfully integrated into the GutWise health application. This feature allows users to monitor their reproductive health, track cycle patterns, correlate symptoms with cycle phases, and gain insights into their overall wellness.

---

## UI Integration Specifications

### Quick Log Button Placement

**Location:** Dashboard Quick Log Actions Card
**Position:** 7th button (between Hydration and Medication buttons)
**Grid Layout:** 2 columns on desktop, responsive on mobile

```
Row 1: BM | Food
Row 2: Symptoms | Sleep
Row 3: Stress | Hydration
Row 4: [Menstrual Cycle] | Medication
```

### Visual Design

**Color Scheme:** Rose/Pink theme (professional and on-brand for reproductive health)
- Background: `bg-rose-50` (light pink background)
- Hover: `bg-rose-100` (slightly darker pink on hover)
- Icon: `text-rose-600` (rose icon)
- Label: `text-rose-900` (dark rose text)

**Button Styling:**
- Icon: Heart icon from lucide-react (`Heart` component)
- Size: 5x5 (`h-5 w-5`)
- Animation: Scale up on hover (0.9 → 1.1)
- Transition: Smooth shadow effect on hover
- Border Radius: 8px rounded corners

**Example Button HTML Structure:**
```jsx
<button
  onClick={() => navigate('/menstrual-cycle-log')}
  className="px-3 py-3 text-left bg-rose-50 hover:bg-rose-100 rounded-lg
             transition-all hover:shadow-sm group"
>
  <Heart className="h-5 w-5 text-rose-600 mb-1 transition-transform
          group-hover:scale-110" />
  <p className="text-sm font-medium text-rose-900">Menstrual Cycle</p>
</button>
```

### Navigation Integration

**Sidebar Menu Position:** After "BM Log", before "Health Insights"
```
Dashboard
BM Log
[Menstrual Cycle] ← NEW
Health Insights
Trends & Analytics
Meal Tracking
Reports
Community
Settings
```

**Navigation Item:**
- Label: "Menstrual Cycle"
- Icon: Heart (rose-600)
- Route: `/menstrual-cycle-log`
- Access: Protected (authenticated users only)

---

## Database Schema

### Table: `menstrual_cycle_logs`

**Primary Key:** `id` (UUID)

#### Core Tracking Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | uuid | ✓ | References authenticated user |
| `cycle_start_date` | date | ✓ | Start date of menstrual cycle |
| `logged_at` | timestamptz | ✓ | When entry was recorded |
| `cycle_day` | integer | ✓ | Auto-calculated day in cycle (1-60) |
| `estimated_cycle_length` | integer | | Expected cycle length (15-60 days) |

#### Flow & Physical Indicators
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `flow_intensity` | text | ✓ | light, medium, heavy, spotting, or none |
| `color` | text | | Bright Red, Dark Red, Brown, Light Pink, Watery Red |
| `tissue_passed` | boolean | | Presence of clots or tissue material |
| `pain_level` | integer | | 0-10 pain/cramping scale |

#### Symptom & Wellness Tracking
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `symptoms` | text[] | | Array of symptoms (cramps, bloating, etc.) |
| `mood_notes` | text | | Mood observations |
| `sleep_quality` | integer | | 1-10 sleep quality rating |
| `energy_level` | integer | | 1-10 energy/fatigue rating |

#### Fertility & Medical Tracking
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ovulation_indicators` | text[] | | Temperature rise, cervical mucus, etc. |
| `basal_temp` | decimal | | Optional temperature reading (96-100°F) |
| `cervical_mucus_type` | text | | Dry, Sticky, Creamy, Fertile, N/A |
| `contraceptive_method` | text | | Birth control method if applicable |
| `sexual_activity` | boolean | | Whether sexual activity occurred |

#### Metadata
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | text | | Free-form observations |
| `created_at` | timestamptz | ✓ | Record creation timestamp |
| `updated_at` | timestamptz | ✓ | Last modification timestamp |

### Security Implementation

**Row Level Security (RLS):** ENABLED
- **SELECT Policy:** Users can only view their own entries
- **INSERT Policy:** Users can only create entries for themselves
- **UPDATE Policy:** Users can only modify their own entries
- **DELETE Policy:** Users can only delete their own entries

**Performance Indexes:**
- `idx_menstrual_cycle_logs_user_id` - User isolation
- `idx_menstrual_cycle_logs_logged_at` - Query ordering
- `idx_menstrual_cycle_logs_user_logged` - Dashboard queries
- `idx_menstrual_cycle_logs_cycle_start` - Cycle pattern analysis

---

## Form Design & UX

### Page Layout

**Header Section:**
- Title: "Menstrual Cycle Tracker"
- Subtitle: "Track your cycle, symptoms, and reproductive health"
- Back button to dashboard

**Tab Navigation:**
- "New Entry" tab (default)
- "History" tab for viewing/editing previous entries

### Form Fields Organization

#### Section 1: Cycle Timing (Auto-Calculated)
- **Cycle Start Date** (required, date picker)
- **Logged At** (required, datetime picker, defaults to now)
- **Cycle Day** (read-only, auto-calculated from start date)
- **Estimated Cycle Length** (optional, dropdown/input 15-60 days)

#### Section 2: Flow Characteristics
- **Flow Intensity** (required, dropdown)
  - Options: None, Spotting, Light, Medium, Heavy
- **Color** (optional, dropdown)
  - Options: Bright Red, Dark Red, Brown, Light Pink, Watery Red
- **Pain Level** (optional, 0-10 slider with numeric display)
- **Tissue/Clots Passed** (optional, toggle switch)

#### Section 3: Symptoms & Wellness
- **Symptoms** (optional, multi-select checkboxes)
  - Options: Cramps, Bloating, Headaches, Mood Changes, Breast Tenderness, Fatigue, Acne, Food Cravings, Back Pain, Nausea, Joint Pain, None
- **Mood Notes** (optional, text input)
  - Placeholder: "e.g., irritable, emotional, anxious..."
- **Sleep Quality** (optional, 1-10 slider)
- **Energy Level** (optional, 1-10 slider)

#### Section 4: Fertility & Medical Data
- **Contraceptive Method** (optional, dropdown)
  - Options: None, Birth Control Pill, IUD, Implant, Injection, Condom, Other
- **Cervical Mucus Type** (optional, dropdown)
  - Options: Dry, Sticky, Creamy, Fertile (Egg White), N/A
- **Ovulation Indicators** (optional, multi-select checkboxes)
  - Options: Temperature Rise, Cervical Mucus, Ovulation Pain, Luteal Phase, Follicular Phase
- **Basal Body Temperature** (optional, numeric input)
  - Range: 96-100°F with 0.1° precision
- **Sexual Activity** (optional, toggle switch)

#### Section 5: Notes
- **Additional Notes** (optional, textarea)
  - Placeholder: "Any other observations or context..."

### Data Validation Rules

| Field | Validation |
|-------|-----------|
| `cycle_start_date` | Date cannot be in future |
| `cycle_day` | Must be positive (1-60) |
| `estimated_cycle_length` | Integer between 15-60 |
| `flow_intensity` | Must be one of 5 predefined values |
| `pain_level` | Integer 0-10 |
| `basal_temp` | Decimal between 96-100, 1 decimal place |
| `sleep_quality` | Integer 1-10 |
| `energy_level` | Integer 1-10 |

### Form Interactions

**Cycle Day Auto-Calculation:**
```
cycle_day = floor(((today - cycle_start_date) in milliseconds) / (1000 * 60 * 60 * 24)) + 1
```
- Updates automatically when cycle_start_date changes
- Helps users quickly see where they are in their cycle

**Symptom Selection Logic:**
- "None" checkbox deselects all other symptoms
- Selecting any other symptom automatically deselects "None"

**Ovulation Indicators:**
- Independent multi-select (can select multiple)
- Users choose indicators relevant to their tracking method

---

## Form Features

### Save & Edit Functionality

**New Entry:**
- Form initializes with today's date
- All sliders default to middle value (5 for 1-10 scales)
- Flow intensity defaults to "medium"
- Cycle length defaults to 28 days (average)

**Edit Entry:**
- All fields populate from selected entry
- Form title changes to "Edit Entry"
- "Update Entry" button replaces "Save Entry"
- "Cancel Edit" button appears to discard changes
- Page auto-scrolls to top for visibility

**Save Success:**
- Toast notification displays confirmation
- Form resets to blank/default values
- History refreshed if visible
- Appropriate message: "Menstrual cycle entry saved" or "Entry updated"

### History View

**Display Format:**
- Cards showing recent entries (last 50)
- Newest entries appear first
- Each card shows:
  - Date and time logged
  - Cycle day and flow intensity
  - Pain level, sleep, energy ratings
  - Symptom badges (rose-colored)
  - Mood notes if present
  - Additional notes if present

**Edit/Delete Actions:**
- Edit link: Loads entry into form, hides history
- Delete link: Requires confirmation, removes entry, updates history

**Empty State:**
- Icon: Heart outline
- Message: "No menstrual cycle entries yet"
- CTA: Link back to form

---

## Mobile Responsiveness

### Desktop (lg screens and up)
- 2-column quick log button grid (changed from 1 column)
- Full-width form sections
- Sidebar always visible

### Tablet (md screens)
- 2-column quick log buttons
- Wrapping form fields into 2-3 column layouts
- Responsive sidebar

### Mobile (sm screens)
- 2-column quick log buttons
- Single-column form (all fields stack vertically)
- Hamburger menu for navigation
- Collapsible sections maintain usability

### Key Breakpoints
```css
sm: 640px
md: 768px
lg: 1024px
```

---

## Technical Implementation

### File Structure

```
src/
├── pages/
│   └── MenstrualCycleLog.tsx       (Main page component)
├── App.tsx                          (Route added)
├── components/
│   └── Sidebar.tsx                  (Navigation updated)
└── types/
    └── domain.ts                    (Types for exports)
```

### Route Configuration

**Path:** `/menstrual-cycle-log`
**Component:** `MenstrualCycleLog`
**Protection:** ProtectedRoute (authenticated users only)

### Dependencies Used

- React hooks: `useState`, `useEffect`, `useCallback`
- React Router: `useNavigate`
- Lucide Icons: `Heart`, `Clock`, `Save`, `Droplet`
- Supabase: `supabase-js` client
- UI Components: `Header`, `Sidebar`, `Button`, `Card`, `SuccessToast`, `EmptyState`
- Utilities: `dateFormatters`, `copySystem`

### State Management

```typescript
interface MenstrualCycleLog {
  id?: string;
  cycle_start_date: string;
  logged_at: string;
  cycle_day: number;
  estimated_cycle_length: number;
  flow_intensity: 'light' | 'medium' | 'heavy' | 'spotting' | 'none';
  color: string;
  tissue_passed: boolean;
  pain_level: number;
  symptoms: string[];
  mood_notes: string;
  ovulation_indicators: string[];
  basal_temp: number | '';
  cervical_mucus_type: string;
  contraceptive_method: string;
  sexual_activity: boolean;
  sleep_quality: number;
  energy_level: number;
  notes: string;
}
```

---

## API Operations

### Database Queries

**Fetch History:**
```typescript
.from('menstrual_cycle_logs')
.select('*')
.eq('user_id', user?.id)
.order('logged_at', { ascending: false })
.limit(50)
```

**Create Entry:**
```typescript
.from('menstrual_cycle_logs')
.insert({ user_id, ...formData })
```

**Update Entry:**
```typescript
.from('menstrual_cycle_logs')
.update(formData)
.eq('id', editingId)
```

**Delete Entry:**
```typescript
.from('menstrual_cycle_logs')
.delete()
.eq('id', id)
```

---

## User Messaging

**Success Messages:**
- New entry: "Menstrual cycle entry saved successfully!"
- Update: "Entry updated successfully!"
- Delete: "Entry deleted successfully!"

**Error Handling:**
- Network errors: "Failed to save entry"
- Validation errors: Displayed inline
- Delete confirmation: "Are you sure you want to delete this entry?"

---

## Future Enhancement Opportunities

1. **Cycle Prediction:** ML algorithm to predict next cycle start
2. **Symptom Correlation:** Analyze relationship between symptoms and cycle phase
3. **Export Features:** PDF reports, CSV export
4. **Notifications:** Reminders for cycle tracking
5. **Analytics Dashboard:** Charts showing cycle patterns over time
6. **Integration:** Correlate with other health metrics (stress, sleep, food)
7. **Fertility Window:** Calculate and highlight fertile window
8. **Medical Insights:** AI-powered health insights based on patterns

---

## Accessibility Considerations

- All form inputs have associated labels
- Color coding supplemented with text labels
- Keyboard navigation fully supported
- ARIA labels on toggle switches
- Form validation provides clear error messages
- Sufficient color contrast on all UI elements

---

## Testing Recommendations

### Manual Testing Checklist

- [ ] Create new menstrual cycle entry
- [ ] Edit existing entry
- [ ] Delete entry with confirmation
- [ ] View entry history (50+ entries)
- [ ] Test cycle day auto-calculation
- [ ] Verify symptom selection logic (None deselects others)
- [ ] Test slider inputs (pain, sleep, energy)
- [ ] Test date/time pickers
- [ ] Verify form validation
- [ ] Test mobile responsiveness
- [ ] Test navigation from dashboard and sidebar
- [ ] Verify data persistence on refresh

### Security Testing

- [ ] Verify users can only see their own entries
- [ ] Confirm RLS policies prevent cross-user access
- [ ] Test unauthorized access to endpoint
- [ ] Verify edit/delete operations respect ownership

---

## Conclusion

The Menstrual Cycle Tracker has been successfully integrated as a first-class feature in the GutWise application. It provides users with comprehensive reproductive health tracking capabilities while maintaining consistency with the existing UI/UX patterns and security standards.

Users can now seamlessly track their menstrual cycles, monitor symptoms, and correlate reproductive health patterns with their overall wellness metrics for better health insights and management.
