/*
  # Create Bowel Movement Logs Table

  1. New Tables
    - `bm_logs`
      - `id` (uuid, primary key) - Unique identifier for each log entry
      - `user_id` (uuid, foreign key) - References auth.users
      - `logged_at` (timestamptz) - Timestamp of the bowel movement
      - `bristol_scale` (integer) - Bristol Stool Scale rating (1-7)
      - `urgency_level` (integer) - Urgency rating (1-10)
      - `pain_level` (integer) - Pain rating (1-10)
      - `difficulty_level` (integer) - Difficulty rating (1-10)
      - `incomplete_evacuation` (boolean) - Whether evacuation felt incomplete
      - `blood_present` (boolean) - Presence of blood
      - `mucus_present` (boolean) - Presence of mucus
      - `amount` (text) - Amount: small, medium, or large
      - `notes` (text, optional) - Additional notes
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `bm_logs` table
    - Add policies for authenticated users to manage their own logs
    - Users can only access their own bowel movement logs

  3. Indexes
    - Index on user_id and logged_at for efficient querying
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS bm_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now(),
  bristol_scale integer NOT NULL CHECK (bristol_scale >= 1 AND bristol_scale <= 7),
  urgency_level integer NOT NULL CHECK (urgency_level >= 1 AND urgency_level <= 10),
  pain_level integer NOT NULL CHECK (pain_level >= 1 AND pain_level <= 10),
  difficulty_level integer NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
  incomplete_evacuation boolean NOT NULL DEFAULT false,
  blood_present boolean NOT NULL DEFAULT false,
  mucus_present boolean NOT NULL DEFAULT false,
  amount text NOT NULL CHECK (amount IN ('small', 'medium', 'large')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bm_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own BM logs"
  ON bm_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own BM logs"
  ON bm_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own BM logs"
  ON bm_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own BM logs"
  ON bm_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS bm_logs_user_logged_at_idx ON bm_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS bm_logs_created_at_idx ON bm_logs(created_at DESC);