/*
  # Add medical context profiles table

  1. New Tables
    - `medical_context_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users, unique) - one profile per user
      - `profile_status` (text) - overall profile state: empty, partial, reviewed
      - `last_reviewed_at` (timestamptz) - when user last reviewed their medical context
      - `has_red_flags` (boolean) - cached flag for quick safety checks
      - `active_fact_count` (integer) - cached count of active confirmed/user_reported facts
      - `caution_notes` (text) - free-text caution summary for downstream consumers
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Design Notes
    - One row per user acts as the profile container
    - Cached fields (has_red_flags, active_fact_count) avoid repeated aggregation queries
    - profile_status tracks how complete the user's medical context is
    - caution_notes supports downstream safety messaging without re-scanning facts
    - Unique constraint on user_id enforces single profile per user

  3. Security
    - RLS enabled with ownership-based policies
    - Separate policies for SELECT, INSERT, UPDATE, DELETE
*/

CREATE TABLE IF NOT EXISTS medical_context_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_status text NOT NULL DEFAULT 'empty' CHECK (profile_status IN ('empty', 'partial', 'reviewed')),
  last_reviewed_at timestamptz,
  has_red_flags boolean NOT NULL DEFAULT false,
  active_fact_count integer NOT NULL DEFAULT 0,
  caution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_context_profiles_user ON medical_context_profiles(user_id);

ALTER TABLE medical_context_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical context profile"
  ON medical_context_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical context profile"
  ON medical_context_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical context profile"
  ON medical_context_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical context profile"
  ON medical_context_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
