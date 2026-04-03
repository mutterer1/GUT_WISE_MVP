# Database Schema Quick Reference

## All Tables & Correct Column Names

### 1. bm_logs (Bowel Movement Logs)
```sql
SELECT id, user_id, logged_at, bristol_type, color, consistency,
       urgency, pain_level, blood_present, mucus_present, notes,
       created_at, updated_at FROM bm_logs
```

**Key Columns**:
- `bristol_type` (int, 1-7) - NOT bristol_scale
- `urgency` (int, 1-5) - NOT urgency_level
- `pain_level` (int, 0-10)
- `blood_present` (bool)
- `mucus_present` (bool)

---

### 2. symptom_logs (Symptoms)
```sql
SELECT id, user_id, logged_at, symptom_type, severity,
       duration_minutes, location, triggers, notes,
       created_at, updated_at FROM symptom_logs
```

**Key Columns**:
- `symptom_type` (text) - Type of symptom
- `severity` (int, 1-10)
- `triggers` (text[]) - Array of trigger factors

**⚠️ Table name is `symptom_logs` NOT `symptoms_log` or `symptoms_logs`**

---

### 3. food_logs (Food Intake)
```sql
SELECT id, user_id, logged_at, meal_type, food_items,
       portion_size, calories, tags, location, notes,
       created_at, updated_at FROM food_logs
```

**Key Columns**:
- `meal_type` (text) - breakfast, lunch, dinner, snack
- `food_items` (JSONB) - NOT individual food_item
- `tags` (text[]) - dairy, gluten, spicy, etc.

---

### 4. sleep_logs (Sleep Tracking)
```sql
SELECT id, user_id, sleep_start, sleep_end,
       duration_minutes, quality, interruptions,
       felt_rested, notes, created_at, updated_at FROM sleep_logs
```

**Key Columns**:
- `quality` (int, 1-10) - NOT quality_rating
- `duration_minutes` (int, GENERATED) - NOT duration_hours
- `sleep_start` (timestamptz)
- `sleep_end` (timestamptz)
- `interruptions` (int, >= 0)
- `felt_rested` (bool)

---

### 5. stress_logs (Stress Tracking)
```sql
SELECT id, user_id, logged_at, stress_level, triggers,
       coping_methods, physical_symptoms, notes,
       created_at, updated_at FROM stress_logs
```

**Key Columns**:
- `stress_level` (int, 1-10) - NOT level
- `triggers` (text[]) - Stress sources
- `coping_methods` (text[]) - Management strategies
- `physical_symptoms` (text[]) - Headache, tension, etc.

---

### 6. hydration_logs (Hydration Tracking)
```sql
SELECT id, user_id, logged_at, amount_ml, beverage_type,
       caffeine_content, notes, created_at, updated_at FROM hydration_logs
```

**Key Columns**:
- `amount_ml` (int) - NOT water_intake_ml
- `beverage_type` (text) - water, coffee, tea, juice, etc.
- `caffeine_content` (bool)

**⚠️ NO `urine_color` column exists**

---

### 7. medication_logs (Medication Tracking)
```sql
SELECT id, user_id, logged_at, medication_name, dosage,
       medication_type, taken_as_prescribed, side_effects,
       notes, created_at, updated_at FROM medication_logs
```

**Key Columns**:
- `medication_name` (text)
- `dosage` (text)
- `medication_type` (text) - prescription, otc, supplement
- `taken_as_prescribed` (bool)
- `side_effects` (text[])

---

### 8. menstrual_cycle_logs (Menstrual Cycle)
```sql
SELECT id, user_id, cycle_date, phase, flow_intensity,
       symptoms, mood_level, notes, created_at, updated_at
FROM menstrual_cycle_logs
```

**Key Columns**:
- `cycle_date` (date)
- `phase` (text) - menstruation, follicular, ovulation, luteal
- `flow_intensity` (int, 1-5)
- `symptoms` (text[]) - Array of symptoms
- `mood_level` (int, 1-10)

---

## Common Query Patterns

### Get BM logs with correct columns
```typescript
const { data } = await supabase
  .from('bm_logs')
  .select('logged_at, bristol_type, urgency')
  .eq('user_id', userId);

// ✅ CORRECT: bristol_type, urgency
// ❌ WRONG: bristol_scale, urgency_level
```

### Get sleep logs with correct columns
```typescript
const { data } = await supabase
  .from('sleep_logs')
  .select('logged_at, quality, duration_minutes')
  .eq('user_id', userId);

// ✅ CORRECT: quality, duration_minutes
// ❌ WRONG: quality_rating, duration_hours
```

### Get symptoms (correct table name)
```typescript
const { data } = await supabase
  .from('symptom_logs')  // ✅ CORRECT table name
  .select('logged_at, symptom_type, severity')
  .eq('user_id', userId);

// ❌ WRONG: symptoms_log or symptoms_logs
```

### Get stress logs
```typescript
const { data } = await supabase
  .from('stress_logs')
  .select('logged_at, stress_level')  // ✅ stress_level
  .eq('user_id', userId);

// ❌ WRONG: level
```

### Get hydration logs
```typescript
const { data } = await supabase
  .from('hydration_logs')
  .select('logged_at, amount_ml')  // ✅ amount_ml
  .eq('user_id', userId);

// ❌ WRONG: water_intake_ml
// ⚠️ NO urine_color column
```

---

## RLS Policies

All tables have Row Level Security (RLS) enabled with the same pattern:

```sql
-- SELECT: Users can view own data
USING (auth.uid() = user_id)

-- INSERT: Users can insert own data
WITH CHECK (auth.uid() = user_id)

-- UPDATE: Users can update own data
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)

-- DELETE: Users can delete own data
USING (auth.uid() = user_id)
```

All queries must include `.eq('user_id', userId)` for proper filtering.

---

## Data Type Reference

| Type | PostgreSQL | TypeScript |
|------|------------|-----------|
| `int` | integer | number |
| `text` | text | string |
| `text[]` | text[] | string[] |
| `bool` | boolean | boolean |
| `timestamp` | timestamptz | string (ISO 8601) |
| `date` | date | string (YYYY-MM-DD) |
| `JSONB` | jsonb | any / JSON object |

---

## Timestamp Handling

All timestamp fields use `timestamptz` (timezone-aware):

```typescript
// Good: Use ISO 8601 strings
const timestamp = new Date().toISOString(); // '2026-04-01T15:30:00.000Z'

// Query with timestamps
.gte('logged_at', startDate.toISOString())
.lte('logged_at', endDate.toISOString())
```

---

## Common Mistakes to Avoid

| Mistake | Correct |
|---------|---------|
| `bristol_scale` | `bristol_type` |
| `urgency_level` | `urgency` |
| `quality_rating` | `quality` |
| `duration_hours` | `duration_minutes` |
| `level` (stress) | `stress_level` |
| `water_intake_ml` | `amount_ml` |
| `had_cramping` | (doesn't exist) |
| `urine_color` | (doesn't exist) |
| `food_item` | `food_items` (+ `tags`) |
| `symptoms_log` | `symptom_logs` |
| `symptoms_logs` | `symptom_logs` |

---

## Supabase Query Template

```typescript
const { data, error } = await supabase
  .from('TABLE_NAME')
  .select('col1, col2, col3')  // ✅ Use correct column names
  .eq('user_id', userId)        // ✅ Always filter by user_id
  .gte('logged_at', startDate)  // Optional: date range
  .lte('logged_at', endDate)    // Optional: date range
  .order('logged_at', { ascending: false });  // Optional: sort

if (error) {
  console.error('Query failed:', error.message);
}

return data;
```

---

## Files with Updated Schema References

✅ All schema issues fixed in:
- `src/utils/insightEngine.ts` (9 fixes)
- `src/utils/clinicalReportQueries.ts` (7 fixes)
- `src/hooks/useTrendsData.ts` (3 fixes)

✅ No changes needed (already correct):
- `src/pages/BMLog.tsx`
- `src/pages/SymptomsLog.tsx`
- `src/pages/SleepLog.tsx`
- `src/pages/StressLog.tsx`
- `src/pages/HydrationLog.tsx`
- `src/pages/MedicationLog.tsx`
- `src/pages/MenstrualCycleLog.tsx`

---

**Last Updated**: April 1, 2026
**Build Status**: ✓ PASSED
**Schema Version**: 1.0 (Complete)
