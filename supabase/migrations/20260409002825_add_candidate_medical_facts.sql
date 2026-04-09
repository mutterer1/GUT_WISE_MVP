/*
  # Add candidate medical facts table for future extraction pipeline

  1. New Tables
    - `candidate_medical_facts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `category` (text) - same categories as medical_facts
      - `detail` (jsonb) - extracted structured data
      - `extraction_source` (text) - where candidate was extracted from
      - `source_document_id` (uuid) - reference to source document (nullable)
      - `extraction_confidence` (numeric) - machine confidence in extraction accuracy (0-1)
      - `extraction_notes` (text) - notes from extraction process
      - `review_status` (text) - pending_review, accepted, rejected, merged
      - `reviewed_at` (timestamptz) - when user reviewed this candidate
      - `promoted_fact_id` (uuid) - FK to medical_facts if accepted and promoted
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Design Notes
    - Separate table from medical_facts ensures candidates never leak into active medical context
    - review_status tracks the user confirmation workflow lifecycle
    - promoted_fact_id links back to the confirmed fact if accepted
    - extraction_confidence allows sorting/filtering candidates by quality
    - Same category enum as medical_facts for consistency

  3. Security
    - RLS enabled with ownership-based policies
    - Separate policies for SELECT, INSERT, UPDATE, DELETE
*/

CREATE TABLE IF NOT EXISTS candidate_medical_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN (
    'diagnosis', 'suspected_condition', 'medication',
    'surgery_procedure', 'allergy_intolerance',
    'diet_guidance', 'red_flag_history'
  )),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  extraction_source text NOT NULL DEFAULT 'document_extraction' CHECK (extraction_source IN (
    'document_extraction', 'clinician_shared', 'inference'
  )),
  source_document_id uuid,
  extraction_confidence numeric CHECK (extraction_confidence >= 0.0 AND extraction_confidence <= 1.0),
  extraction_notes text,
  review_status text NOT NULL DEFAULT 'pending_review' CHECK (review_status IN (
    'pending_review', 'accepted', 'rejected', 'merged'
  )),
  reviewed_at timestamptz,
  promoted_fact_id uuid REFERENCES medical_facts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_medical_facts_user ON candidate_medical_facts(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_medical_facts_user_status ON candidate_medical_facts(user_id, review_status) WHERE review_status = 'pending_review';

ALTER TABLE candidate_medical_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own candidate medical facts"
  ON candidate_medical_facts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own candidate medical facts"
  ON candidate_medical_facts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own candidate medical facts"
  ON candidate_medical_facts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own candidate medical facts"
  ON candidate_medical_facts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
