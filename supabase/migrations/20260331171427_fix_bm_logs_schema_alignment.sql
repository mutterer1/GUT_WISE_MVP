/*
  # Fix BM Logs Schema Alignment

  1. Changes Made
    - Rename `bristol_type` to `bristol_scale` for consistency with frontend code
    - Rename `urgency` to `urgency_level` for consistency with frontend code
    - Add missing `difficulty_level` column (integer, 1-10 scale)
    - Add missing `incomplete_evacuation` column (boolean)
    - Add missing `amount` column (text: small, medium, large)
    - Remove unused `color` column
    - Remove unused `consistency` column

  2. Data Safety
    - Uses safe ALTER TABLE operations
    - Preserves all existing data
    - All operations use IF EXISTS/IF NOT EXISTS checks

  3. Notes
    - This migration aligns the database schema with the frontend expectations
    - Resolves PGRST204 error about missing 'amount' column
    - Maintains backward compatibility by preserving core data
*/

-- Rename columns for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'bristol_type'
  ) THEN
    ALTER TABLE bm_logs RENAME COLUMN bristol_type TO bristol_scale;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'urgency'
  ) THEN
    ALTER TABLE bm_logs RENAME COLUMN urgency TO urgency_level;
  END IF;
END $$;

-- Add missing columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE bm_logs ADD COLUMN difficulty_level integer NOT NULL DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 10);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'incomplete_evacuation'
  ) THEN
    ALTER TABLE bm_logs ADD COLUMN incomplete_evacuation boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'amount'
  ) THEN
    ALTER TABLE bm_logs ADD COLUMN amount text NOT NULL DEFAULT 'medium' CHECK (amount IN ('small', 'medium', 'large'));
  END IF;
END $$;

-- Remove unused columns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'color'
  ) THEN
    ALTER TABLE bm_logs DROP COLUMN color;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'consistency'
  ) THEN
    ALTER TABLE bm_logs DROP COLUMN consistency;
  END IF;
END $$;