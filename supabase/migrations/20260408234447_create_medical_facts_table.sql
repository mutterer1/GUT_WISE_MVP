/*
  # Create medical facts table for structured medical context

  1. New Tables
    - `medical_facts`
      - `id` (uuid, primary key) - unique fact identifier
      - `user_id` (uuid, FK to auth.users) - owning user
      - `category` (text) - one of: diagnosis, suspected_condition, medication, surgery_procedure, allergy_intolerance, diet_guidance, red_flag_history
      - `confirmation_state` (text) - one of: confirmed, user_reported, candidate
      - `detail` (jsonb) - category-specific structured data
      - `provenance_source` (text) - one of: manual_entry, document_extraction, clinician_shared
      - `provenance_entered_at` (timestamptz) - when the fact was entered
      - `provenance_confirmed_at` (timestamptz) - when the fact was confirmed (nullable)
      - `provenance_source_document_id` (uuid) - reference to source document if applicable (nullable)
      - `provenance_notes` (text) - free-text notes about provenance (nullable)
      - `is_active` (boolean) - whether this fact is currently active
      - `deactivated_at` (timestamptz) - when the fact was deactivated (nullable)
      - `created_at` (timestamptz) - row creation time
      - `updated_at` (timestamptz) - row last update time

  2. Design Notes
    - Single table with JSONB detail column supports all fact categories while keeping querying simple
    - Confirmation state ensures unconfirmed/candidate facts never leak into active insight context
    - Provenance fields track where each fact came from for audit and trust
    - is_active flag supports soft-delete without data loss
    - Indexes on user_id, category, and confirmation_state for efficient filtered queries

  3. Security
    - RLS enabled: users can only access their own medical facts
    - Separate policies for SELECT, INSERT, UPDATE, DELETE
    - All policies restricted to authenticated users with ownership check
*/

CREATE TABLE IF NOT EXISTS medical_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN (
    'diagnosis', 'suspected_condition', 'medication',
    'surgery_procedure', 'allergy_intolerance',
    'diet_guidance', 'red_flag_history'
  )),
  confirmation_state text NOT NULL DEFAULT 'user_reported' CHECK (confirmation_state IN (
    'confirmed', 'user_reported', 'candidate'
  )),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  provenance_source text NOT NULL DEFAULT 'manual_entry' CHECK (provenance_source IN (
    'manual_entry', 'document_extraction', 'clinician_shared'
  )),
  provenance_entered_at timestamptz NOT NULL DEFAULT now(),
  provenance_confirmed_at timestamptz,
  provenance_source_document_id uuid,
  provenance_notes text,
  is_active boolean NOT NULL DEFAULT true,
  deactivated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_facts_user_id ON medical_facts(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_facts_user_category ON medical_facts(user_id, category);
CREATE INDEX IF NOT EXISTS idx_medical_facts_user_active ON medical_facts(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_medical_facts_user_confirmed ON medical_facts(user_id, confirmation_state) WHERE confirmation_state = 'confirmed';

ALTER TABLE medical_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical facts"
  ON medical_facts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical facts"
  ON medical_facts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical facts"
  ON medical_facts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical facts"
  ON medical_facts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
