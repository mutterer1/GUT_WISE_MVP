/*
  # Create Health Tracking Tables

  ## Overview
  This migration creates core health tracking tables for bowel movements, symptoms, and food intake.
  Each table includes strict user isolation and comprehensive audit trails.

  ## Tables Created

  ### 1. bm_logs (Bowel Movement Logs)
  Tracks bowel movement events with detailed characteristics
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users, ensures user ownership
  - `logged_at` (timestamptz, not null) - When the BM occurred
  - `bristol_type` (integer, 1-7) - Bristol Stool Scale classification
  - `color` (text) - Stool color observation
  - `consistency` (text) - Additional consistency notes
  - `urgency` (integer, 1-5) - Urgency level rating
  - `pain_level` (integer, 0-10) - Associated pain intensity
  - `blood_present` (boolean) - Blood detection flag
  - `mucus_present` (boolean) - Mucus detection flag
  - `notes` (text) - Free-form additional observations
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 2. symptom_logs
  Records various health symptoms with severity tracking
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users
  - `logged_at` (timestamptz, not null) - When symptom was experienced
  - `symptom_type` (text, not null) - Type of symptom (bloating, cramping, nausea, etc.)
  - `severity` (integer, 1-10, not null) - Symptom intensity rating
  - `duration_minutes` (integer) - How long symptom lasted
  - `location` (text) - Body location of symptom
  - `triggers` (text[]) - Potential trigger factors
  - `notes` (text) - Additional context
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 3. food_logs
  Tracks dietary intake for correlation analysis
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users
  - `logged_at` (timestamptz, not null) - When food was consumed
  - `meal_type` (text, not null) - breakfast, lunch, dinner, snack
  - `food_items` (jsonb, not null) - Array of food items with details
  - `portion_size` (text) - Serving size description
  - `calories` (integer) - Estimated caloric content
  - `tags` (text[]) - Food categories/allergens (dairy, gluten, spicy, etc.)
  - `location` (text) - Where meal was consumed
  - `notes` (text) - Additional observations
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ## Security Implementation

  ### Row Level Security (RLS)
  - **Enabled** on all three tables
  - Each table has four policies: SELECT, INSERT, UPDATE, DELETE
  - All policies enforce user_id = auth.uid() for complete data isolation
  - No cross-user data access possible at database level

  ### Data Integrity
  - Foreign key constraints ensure valid user references
  - Check constraints validate data ranges (severity 1-10, bristol_type 1-7, etc.)
  - NOT NULL constraints on critical fields
  - Cascading deletes ensure data cleanup when users are deleted

  ## Notes
  - All timestamps use timestamptz for timezone-aware storage
  - JSONB fields allow flexible structured data storage
  - Arrays (text[]) enable multi-value fields without junction tables
  - Automatic updated_at triggers maintain audit trails
*/

-- Create bm_logs table
CREATE TABLE IF NOT EXISTS bm_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  bristol_type integer CHECK (bristol_type >= 1 AND bristol_type <= 7),
  color text,
  consistency text,
  urgency integer CHECK (urgency >= 1 AND urgency <= 5),
  pain_level integer CHECK (pain_level >= 0 AND pain_level <= 10),
  blood_present boolean DEFAULT false,
  mucus_present boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create symptom_logs table
CREATE TABLE IF NOT EXISTS symptom_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  symptom_type text NOT NULL,
  severity integer NOT NULL CHECK (severity >= 1 AND severity <= 10),
  duration_minutes integer CHECK (duration_minutes > 0),
  location text,
  triggers text[],
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create food_logs table
CREATE TABLE IF NOT EXISTS food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items jsonb NOT NULL,
  portion_size text,
  calories integer CHECK (calories >= 0),
  tags text[],
  location text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE bm_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- BM Logs policies
CREATE POLICY "Users can view own bm logs"
  ON bm_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bm logs"
  ON bm_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bm logs"
  ON bm_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bm logs"
  ON bm_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Symptom Logs policies
CREATE POLICY "Users can view own symptom logs"
  ON symptom_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom logs"
  ON symptom_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom logs"
  ON symptom_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom logs"
  ON symptom_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Food Logs policies
CREATE POLICY "Users can view own food logs"
  ON food_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
  ON food_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
  ON food_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
  ON food_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_bm_logs_updated_at
  BEFORE UPDATE ON bm_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptom_logs_updated_at
  BEFORE UPDATE ON symptom_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_logs_updated_at
  BEFORE UPDATE ON food_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bm_logs_user_id ON bm_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_bm_logs_logged_at ON bm_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_bm_logs_user_logged ON bm_logs(user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_id ON symptom_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_logged_at ON symptom_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_logged ON symptom_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_type ON symptom_logs(symptom_type);

CREATE INDEX IF NOT EXISTS idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_logged_at ON food_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_logged ON food_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_logs_meal_type ON food_logs(meal_type);