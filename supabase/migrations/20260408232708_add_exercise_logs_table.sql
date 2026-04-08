/*
  # Add exercise_logs table

  1. New Tables
    - `exercise_logs`
      - `id` (uuid, primary key, auto-generated)
      - `user_id` (uuid, references auth.users, not null)
      - `logged_at` (timestamptz, not null)
      - `exercise_type` (text, not null) - e.g. walking, running, yoga, cycling
      - `duration_minutes` (integer, not null, default 0) - session length in minutes
      - `intensity_level` (integer, not null, default 3) - 1-5 scale
      - `perceived_exertion` (integer, nullable) - RPE 1-10 scale
      - `indoor_outdoor` (text, nullable) - 'indoor' or 'outdoor'
      - `notes` (text, nullable)
      - `local_date` (date, nullable) - derived local date
      - `local_hour` (integer, nullable) - derived local hour 0-23
      - `timezone` (text, nullable)
      - `completeness_score` (numeric, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `exercise_logs` table
    - Add SELECT policy for authenticated users to read own data
    - Add INSERT policy for authenticated users to insert own data
    - Add UPDATE policy for authenticated users to update own data
    - Add DELETE policy for authenticated users to delete own data

  3. Indexes
    - Index on (user_id, logged_at) for efficient querying
    - Index on (user_id, local_date) for daily aggregation
*/

CREATE TABLE IF NOT EXISTS exercise_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  logged_at timestamptz NOT NULL,
  exercise_type text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 0,
  intensity_level integer NOT NULL DEFAULT 3,
  perceived_exertion integer,
  indoor_outdoor text,
  notes text,
  local_date date,
  local_hour integer,
  timezone text,
  completeness_score numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT exercise_logs_intensity_range CHECK (intensity_level >= 1 AND intensity_level <= 5),
  CONSTRAINT exercise_logs_perceived_exertion_range CHECK (perceived_exertion IS NULL OR (perceived_exertion >= 1 AND perceived_exertion <= 10)),
  CONSTRAINT exercise_logs_duration_nonneg CHECK (duration_minutes >= 0),
  CONSTRAINT exercise_logs_local_hour_range CHECK (local_hour IS NULL OR (local_hour >= 0 AND local_hour <= 23)),
  CONSTRAINT exercise_logs_indoor_outdoor_values CHECK (indoor_outdoor IS NULL OR indoor_outdoor IN ('indoor', 'outdoor'))
);

ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own exercise logs"
  ON exercise_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise logs"
  ON exercise_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise logs"
  ON exercise_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise logs"
  ON exercise_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_logged
  ON exercise_logs (user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_local_date
  ON exercise_logs (user_id, local_date DESC);
