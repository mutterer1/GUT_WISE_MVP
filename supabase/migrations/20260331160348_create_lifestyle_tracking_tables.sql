/*
  # Create Lifestyle Tracking Tables

  ## Overview
  This migration creates lifestyle and wellness tracking tables for sleep, stress, hydration, and medication.
  These tables enable holistic health monitoring and correlation analysis with digestive health.

  ## Tables Created

  ### 1. sleep_logs
  Tracks sleep patterns and quality metrics
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users
  - `sleep_start` (timestamptz, not null) - When user went to sleep
  - `sleep_end` (timestamptz, not null) - When user woke up
  - `duration_minutes` (integer, computed) - Total sleep duration
  - `quality` (integer, 1-10) - Subjective sleep quality rating
  - `interruptions` (integer) - Number of times awakened
  - `felt_rested` (boolean) - Whether user felt rested upon waking
  - `notes` (text) - Additional observations (dreams, disturbances, etc.)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 2. stress_logs
  Records stress levels and contributing factors
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users
  - `logged_at` (timestamptz, not null) - When stress was assessed
  - `stress_level` (integer, 1-10, not null) - Subjective stress intensity
  - `triggers` (text[]) - Identified stress sources
  - `coping_methods` (text[]) - Strategies used to manage stress
  - `physical_symptoms` (text[]) - Physical manifestations (headache, tension, etc.)
  - `notes` (text) - Additional context
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 3. hydration_logs
  Tracks fluid intake throughout the day
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users
  - `logged_at` (timestamptz, not null) - When fluid was consumed
  - `amount_ml` (integer, not null) - Volume in milliliters
  - `beverage_type` (text, not null) - water, coffee, tea, juice, etc.
  - `caffeine_content` (boolean) - Whether beverage contains caffeine
  - `notes` (text) - Additional details
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 4. medication_logs
  Tracks medication adherence and effects
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users
  - `logged_at` (timestamptz, not null) - When medication was taken
  - `medication_name` (text, not null) - Name of medication/supplement
  - `dosage` (text, not null) - Dosage amount and unit
  - `medication_type` (text, not null) - prescription, otc, supplement
  - `taken_as_prescribed` (boolean) - Adherence indicator
  - `side_effects` (text[]) - Any observed adverse effects
  - `notes` (text) - Additional observations
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ## Security Implementation

  ### Row Level Security (RLS)
  - **Enabled** on all four tables
  - Each table has four policies: SELECT, INSERT, UPDATE, DELETE
  - All policies enforce user_id = auth.uid() for complete data isolation
  - Prevents any cross-user data access

  ### Data Integrity
  - Foreign key constraints with CASCADE DELETE
  - Check constraints validate data ranges
  - NOT NULL constraints on essential fields
  - Automatic timestamp management via triggers

  ## Notes
  - Sleep duration can be calculated from start/end times
  - Arrays enable multi-value tracking without additional tables
  - Boolean flags for quick filtering and analysis
  - All times use timestamptz for accurate tracking across timezones
*/

-- Create sleep_logs table
CREATE TABLE IF NOT EXISTS sleep_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_start timestamptz NOT NULL,
  sleep_end timestamptz NOT NULL,
  duration_minutes integer GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (sleep_end - sleep_start)) / 60
  ) STORED,
  quality integer CHECK (quality >= 1 AND quality <= 10),
  interruptions integer DEFAULT 0 CHECK (interruptions >= 0),
  felt_rested boolean,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_sleep_period CHECK (sleep_end > sleep_start)
);

-- Create stress_logs table
CREATE TABLE IF NOT EXISTS stress_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  stress_level integer NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
  triggers text[],
  coping_methods text[],
  physical_symptoms text[],
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create hydration_logs table
CREATE TABLE IF NOT EXISTS hydration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  amount_ml integer NOT NULL CHECK (amount_ml > 0),
  beverage_type text NOT NULL,
  caffeine_content boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create medication_logs table
CREATE TABLE IF NOT EXISTS medication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  medication_name text NOT NULL,
  dosage text NOT NULL,
  medication_type text NOT NULL CHECK (medication_type IN ('prescription', 'otc', 'supplement')),
  taken_as_prescribed boolean DEFAULT true,
  side_effects text[],
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- Sleep Logs policies
CREATE POLICY "Users can view own sleep logs"
  ON sleep_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep logs"
  ON sleep_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep logs"
  ON sleep_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep logs"
  ON sleep_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Stress Logs policies
CREATE POLICY "Users can view own stress logs"
  ON stress_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stress logs"
  ON stress_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stress logs"
  ON stress_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stress logs"
  ON stress_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Hydration Logs policies
CREATE POLICY "Users can view own hydration logs"
  ON hydration_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hydration logs"
  ON hydration_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hydration logs"
  ON hydration_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hydration logs"
  ON hydration_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Medication Logs policies
CREATE POLICY "Users can view own medication logs"
  ON medication_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medication logs"
  ON medication_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medication logs"
  ON medication_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medication logs"
  ON medication_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_sleep_logs_updated_at
  BEFORE UPDATE ON sleep_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stress_logs_updated_at
  BEFORE UPDATE ON stress_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hydration_logs_updated_at
  BEFORE UPDATE ON hydration_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_logs_updated_at
  BEFORE UPDATE ON medication_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_id ON sleep_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_sleep_start ON sleep_logs(sleep_start DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_start ON sleep_logs(user_id, sleep_start DESC);

CREATE INDEX IF NOT EXISTS idx_stress_logs_user_id ON stress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_stress_logs_logged_at ON stress_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_stress_logs_user_logged ON stress_logs(user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_id ON hydration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_logged_at ON hydration_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_logged ON hydration_logs(user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_logged_at ON medication_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_logged ON medication_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_medication_logs_name ON medication_logs(medication_name);