/*
  # Create Menstrual Cycle Logs Table

  ## Overview
  This migration creates a comprehensive menstrual cycle tracking table for reproductive health monitoring.
  Captures cycle phases, flow characteristics, symptoms, and health indicators to help users understand
  their reproductive health patterns and identify potential correlations with other health metrics.

  ## Tables Created

  ### menstrual_cycle_logs
  Tracks menstrual cycle events with detailed health and symptom data.

  **Core Tracking Fields:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users, ensures user ownership
  - `cycle_start_date` (date, not null) - Start date of menstrual cycle
  - `logged_at` (timestamptz, not null) - When the entry was logged
  - `cycle_day` (integer, not null) - Day number in current cycle (calculated from start)
  - `estimated_cycle_length` (integer) - Expected total cycle length in days (typically 21-35)

  **Flow & Physical Indicators:**
  - `flow_intensity` (text, not null) - light, medium, heavy, spotting, or none
  - `color` (text) - Blood color observation (bright red, dark red, brown, etc.)
  - `tissue_passed` (boolean) - Presence of clots or tissue material
  - `pain_level` (integer, 0-10) - Associated pain/cramping intensity

  **Symptom Tracking:**
  - `symptoms` (text[]) - Array of symptoms: cramps, bloating, headaches, mood_changes, 
    breast_tenderness, fatigue, acne, food_cravings, backpain, etc.
  - `mood_notes` (text) - Mood observations (irritable, emotional, anxious, etc.)

  **Ovulation & Fertility Indicators:**
  - `ovulation_indicators` (text[]) - Optional indicators: temp_rise, cervical_mucus_fertile,
    ovulation_pain, luteal_phase, follicular_phase
  - `basal_temp` (decimal) - Optional basal body temperature reading
  - `cervical_mucus_type` (text) - Optional: dry, sticky, creamy, fertile (egg white)

  **Lifestyle & Contraception:**
  - `contraceptive_method` (text) - Birth control type if applicable (pill, iud, condom, none, etc.)
  - `sexual_activity` (boolean) - Whether sexual activity occurred
  - `sleep_quality` (integer, 1-10) - Sleep quality rating
  - `energy_level` (integer, 1-10) - Energy/fatigue rating

  **Additional Context:**
  - `notes` (text) - Free-form observations and additional context
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ## Data Validation Rules
  - flow_intensity: must be one of 'light', 'medium', 'heavy', 'spotting', 'none'
  - pain_level: 0-10 integer range
  - cycle_day: positive integer (calculated from cycle_start_date)
  - estimated_cycle_length: 15-60 days (valid biological range)
  - sleep_quality, energy_level: 1-10 range

  ## Security Implementation

  ### Row Level Security (RLS)
  - **Enabled** on menstrual_cycle_logs table
  - Four comprehensive policies: SELECT, INSERT, UPDATE, DELETE
  - All policies enforce user_id = auth.uid() for complete data isolation
  - No cross-user data access possible at database level
  - Users can only view, create, update, and delete their own menstrual cycle records

  ### Data Integrity
  - Foreign key constraint ensures valid user references
  - Check constraints validate all numeric ranges and categorical values
  - NOT NULL constraints on critical fields
  - Cascading deletes ensure data cleanup when users are deleted
  - Automatic updated_at triggers maintain audit trails

  ## Performance Optimization
  - Indexes on user_id, logged_at, and cycle_start_date for fast queries
  - Composite index on user_id + logged_at for dashboard queries
  - Supports efficient cycle analysis queries

  ## Important Notes
  - All timestamps use timestamptz for timezone-aware storage
  - Text arrays enable flexible symptom tracking without reliance on predefined enums
  - Optional fields allow quick-log entries while supporting detailed tracking
  - Users can track cycles even without hormonal contraception
  - Data designed to be used with other health metrics for comprehensive correlation analysis
*/

CREATE TABLE IF NOT EXISTS menstrual_cycle_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_start_date date NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now(),
  cycle_day integer NOT NULL CHECK (cycle_day > 0),
  estimated_cycle_length integer CHECK (estimated_cycle_length >= 15 AND estimated_cycle_length <= 60),
  flow_intensity text NOT NULL CHECK (flow_intensity IN ('light', 'medium', 'heavy', 'spotting', 'none')),
  color text,
  tissue_passed boolean DEFAULT false,
  pain_level integer CHECK (pain_level >= 0 AND pain_level <= 10),
  symptoms text[],
  mood_notes text,
  ovulation_indicators text[],
  basal_temp decimal(5,2),
  cervical_mucus_type text,
  contraceptive_method text,
  sexual_activity boolean DEFAULT false,
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE menstrual_cycle_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own menstrual cycle logs"
  ON menstrual_cycle_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own menstrual cycle logs"
  ON menstrual_cycle_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own menstrual cycle logs"
  ON menstrual_cycle_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own menstrual cycle logs"
  ON menstrual_cycle_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_menstrual_cycle_logs_user_id ON menstrual_cycle_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_menstrual_cycle_logs_logged_at ON menstrual_cycle_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_menstrual_cycle_logs_user_logged ON menstrual_cycle_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_menstrual_cycle_logs_cycle_start ON menstrual_cycle_logs(user_id, cycle_start_date DESC);

CREATE TRIGGER update_menstrual_cycle_logs_updated_at
  BEFORE UPDATE ON menstrual_cycle_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
