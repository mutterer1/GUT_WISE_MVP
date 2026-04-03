/*
  # Create Insights Storage Table

  1. New Tables
    - `user_insights`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `insight_type` (text) - Type of pattern detected (sleep_symptom, stress_urgency, hydration_consistency, food_symptom, temporal_pattern)
      - `summary` (text) - Clear one-sentence description of the pattern
      - `evidence` (jsonb) - Structured data points supporting the insight
      - `confidence_level` (text) - low, medium, high based on occurrence frequency
      - `occurrence_count` (integer) - Number of times pattern was observed
      - `first_detected_at` (timestamptz) - When pattern first appeared
      - `last_detected_at` (timestamptz) - Most recent occurrence
      - `is_active` (boolean) - Whether insight is still relevant
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_insights` table
    - Add policy for authenticated users to read their own insights
    - Add policy for authenticated users to manage their own insights

  3. Indexes
    - Index on user_id for fast user-specific queries
    - Index on insight_type for filtering by pattern type
    - Index on is_active for retrieving current insights
*/

CREATE TABLE IF NOT EXISTS user_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('sleep_symptom', 'stress_urgency', 'hydration_consistency', 'food_symptom', 'temporal_pattern')),
  summary text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}',
  confidence_level text NOT NULL CHECK (confidence_level IN ('low', 'medium', 'high')),
  occurrence_count integer NOT NULL DEFAULT 0,
  first_detected_at timestamptz NOT NULL,
  last_detected_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON user_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON user_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON user_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON user_insights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_insights_user_id ON user_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_insights_type ON user_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_user_insights_active ON user_insights(is_active);
CREATE INDEX IF NOT EXISTS idx_user_insights_last_detected ON user_insights(last_detected_at DESC);