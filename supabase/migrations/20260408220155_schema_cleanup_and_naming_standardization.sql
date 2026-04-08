/*
  # Schema Cleanup and Naming Standardization

  This migration normalizes field names and adds timestamp metadata columns
  across all log tables to prepare for Insight Engine 2.0.

  ## 1. BM Logs - Column Renames (Reversing Previous Drift)
    - `bristol_scale` renamed back to `bristol_type` (canonical name used by all app code)
    - `urgency_level` renamed back to `urgency` (canonical name used by all app code)

  ## 2. Sleep Logs - Add `logged_at`
    - Adds `logged_at` column defaulting to `sleep_end` so sleep records
      have a consistent timestamp field like all other log tables

  ## 3. All Log Tables - Normalized Timestamp Metadata
    Adds four new columns to every log table:
    - `local_date` (date) - the calendar date in the user's local timezone
    - `local_hour` (smallint, 0-23) - the hour of day in the user's local timezone
    - `timezone` (text) - the IANA timezone string at time of logging
    - `completeness_score` (numeric, 0-1) - data quality score, populated later by scoring logic

  ## 4. Tables Modified
    - bm_logs (rename + new columns)
    - sleep_logs (logged_at + new columns)
    - symptom_logs (new columns)
    - food_logs (new columns)
    - stress_logs (new columns)
    - hydration_logs (new columns)
    - medication_logs (new columns)
    - menstrual_cycle_logs (new columns)

  ## 5. Security
    - No RLS changes; existing policies remain in effect
    - No destructive operations (no drops)

  ## 6. Important Notes
    - All new columns are nullable to preserve backward compatibility
    - Existing data is not backfilled in this migration; backfill will occur via app logic
    - completeness_score will be populated by a future scoring function
*/

-- ============================================================
-- 1. BM LOGS: Rename columns back to canonical names
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bm_logs'
      AND column_name = 'bristol_scale'
  ) THEN
    ALTER TABLE bm_logs RENAME COLUMN bristol_scale TO bristol_type;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bm_logs'
      AND column_name = 'urgency_level'
  ) THEN
    ALTER TABLE bm_logs RENAME COLUMN urgency_level TO urgency;
  END IF;
END $$;

-- ============================================================
-- 2. SLEEP LOGS: Add logged_at column
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sleep_logs'
      AND column_name = 'logged_at'
  ) THEN
    ALTER TABLE sleep_logs ADD COLUMN logged_at timestamptz;
  END IF;
END $$;

UPDATE sleep_logs SET logged_at = sleep_end WHERE logged_at IS NULL;

-- ============================================================
-- 3. ADD NORMALIZED TIMESTAMP METADATA TO ALL LOG TABLES
-- ============================================================

-- Helper: adds the four normalized columns to a given table
-- We run this for each log table individually with IF NOT EXISTS guards.

-- --- bm_logs ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bm_logs' AND column_name='local_date') THEN
    ALTER TABLE bm_logs ADD COLUMN local_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bm_logs' AND column_name='local_hour') THEN
    ALTER TABLE bm_logs ADD COLUMN local_hour smallint CHECK (local_hour >= 0 AND local_hour <= 23);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bm_logs' AND column_name='timezone') THEN
    ALTER TABLE bm_logs ADD COLUMN timezone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bm_logs' AND column_name='completeness_score') THEN
    ALTER TABLE bm_logs ADD COLUMN completeness_score numeric CHECK (completeness_score >= 0 AND completeness_score <= 1);
  END IF;
END $$;

-- --- symptom_logs ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='symptom_logs' AND column_name='local_date') THEN
    ALTER TABLE symptom_logs ADD COLUMN local_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='symptom_logs' AND column_name='local_hour') THEN
    ALTER TABLE symptom_logs ADD COLUMN local_hour smallint CHECK (local_hour >= 0 AND local_hour <= 23);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='symptom_logs' AND column_name='timezone') THEN
    ALTER TABLE symptom_logs ADD COLUMN timezone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='symptom_logs' AND column_name='completeness_score') THEN
    ALTER TABLE symptom_logs ADD COLUMN completeness_score numeric CHECK (completeness_score >= 0 AND completeness_score <= 1);
  END IF;
END $$;

-- --- food_logs ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='food_logs' AND column_name='local_date') THEN
    ALTER TABLE food_logs ADD COLUMN local_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='food_logs' AND column_name='local_hour') THEN
    ALTER TABLE food_logs ADD COLUMN local_hour smallint CHECK (local_hour >= 0 AND local_hour <= 23);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='food_logs' AND column_name='timezone') THEN
    ALTER TABLE food_logs ADD COLUMN timezone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='food_logs' AND column_name='completeness_score') THEN
    ALTER TABLE food_logs ADD COLUMN completeness_score numeric CHECK (completeness_score >= 0 AND completeness_score <= 1);
  END IF;
END $$;

-- --- sleep_logs ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_logs' AND column_name='local_date') THEN
    ALTER TABLE sleep_logs ADD COLUMN local_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_logs' AND column_name='local_hour') THEN
    ALTER TABLE sleep_logs ADD COLUMN local_hour smallint CHECK (local_hour >= 0 AND local_hour <= 23);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_logs' AND column_name='timezone') THEN
    ALTER TABLE sleep_logs ADD COLUMN timezone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_logs' AND column_name='completeness_score') THEN
    ALTER TABLE sleep_logs ADD COLUMN completeness_score numeric CHECK (completeness_score >= 0 AND completeness_score <= 1);
  END IF;
END $$;

-- --- stress_logs ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stress_logs' AND column_name='local_date') THEN
    ALTER TABLE stress_logs ADD COLUMN local_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stress_logs' AND column_name='local_hour') THEN
    ALTER TABLE stress_logs ADD COLUMN local_hour smallint CHECK (local_hour >= 0 AND local_hour <= 23);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stress_logs' AND column_name='timezone') THEN
    ALTER TABLE stress_logs ADD COLUMN timezone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stress_logs' AND column_name='completeness_score') THEN
    ALTER TABLE stress_logs ADD COLUMN completeness_score numeric CHECK (completeness_score >= 0 AND completeness_score <= 1);
  END IF;
END $$;

-- --- hydration_logs ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='hydration_logs' AND column_name='local_date') THEN
    ALTER TABLE hydration_logs ADD COLUMN local_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='hydration_logs' AND column_name='local_hour') THEN
    ALTER TABLE hydration_logs ADD COLUMN local_hour smallint CHECK (local_hour >= 0 AND local_hour <= 23);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='hydration_logs' AND column_name='timezone') THEN
    ALTER TABLE hydration_logs ADD COLUMN timezone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='hydration_logs' AND column_name='completeness_score') THEN
    ALTER TABLE hydration_logs ADD COLUMN completeness_score numeric CHECK (completeness_score >= 0 AND completeness_score <= 1);
  END IF;
END $$;

-- --- medication_logs ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='medication_logs' AND column_name='local_date') THEN
    ALTER TABLE medication_logs ADD COLUMN local_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='medication_logs' AND column_name='local_hour') THEN
    ALTER TABLE medication_logs ADD COLUMN local_hour smallint CHECK (local_hour >= 0 AND local_hour <= 23);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='medication_logs' AND column_name='timezone') THEN
    ALTER TABLE medication_logs ADD COLUMN timezone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='medication_logs' AND column_name='completeness_score') THEN
    ALTER TABLE medication_logs ADD COLUMN completeness_score numeric CHECK (completeness_score >= 0 AND completeness_score <= 1);
  END IF;
END $$;

-- --- menstrual_cycle_logs ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='menstrual_cycle_logs' AND column_name='local_date') THEN
    ALTER TABLE menstrual_cycle_logs ADD COLUMN local_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='menstrual_cycle_logs' AND column_name='local_hour') THEN
    ALTER TABLE menstrual_cycle_logs ADD COLUMN local_hour smallint CHECK (local_hour >= 0 AND local_hour <= 23);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='menstrual_cycle_logs' AND column_name='timezone') THEN
    ALTER TABLE menstrual_cycle_logs ADD COLUMN timezone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='menstrual_cycle_logs' AND column_name='completeness_score') THEN
    ALTER TABLE menstrual_cycle_logs ADD COLUMN completeness_score numeric CHECK (completeness_score >= 0 AND completeness_score <= 1);
  END IF;
END $$;