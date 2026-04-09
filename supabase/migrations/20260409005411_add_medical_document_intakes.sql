/*
  # Add medical document intakes table

  1. New Tables
    - `medical_document_intakes`
      - `id` (uuid, primary key) - unique intake record
      - `user_id` (uuid, FK to auth.users) - document owner
      - `file_name` (text) - original uploaded file name
      - `file_type` (text) - MIME type of the uploaded file
      - `file_size_bytes` (integer) - file size for display
      - `intake_status` (text) - processing lifecycle: uploaded, processing, review_ready, completed, failed
      - `document_notes` (text) - user-provided context about the document
      - `candidate_count` (integer) - cached count of candidate facts seeded from this intake
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to existing tables
    - Adds `source_document_id` FK on `candidate_medical_facts` pointing to `medical_document_intakes`

  3. Design Notes
    - Intake records track document metadata only, not raw document content
    - No raw text or parsed content stored in this table
    - candidate_medical_facts reference their source intake via source_document_id
    - intake_status drives the workflow UI state
    - candidate_count is a cached counter for quick display

  4. Security
    - RLS enabled with ownership-based policies for all CRUD operations
*/

CREATE TABLE IF NOT EXISTS medical_document_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL DEFAULT '',
  file_type text NOT NULL DEFAULT '',
  file_size_bytes integer NOT NULL DEFAULT 0,
  intake_status text NOT NULL DEFAULT 'uploaded' CHECK (intake_status IN (
    'uploaded', 'processing', 'review_ready', 'completed', 'failed'
  )),
  document_notes text,
  candidate_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_document_intakes_user
  ON medical_document_intakes(user_id);

CREATE INDEX IF NOT EXISTS idx_medical_document_intakes_user_status
  ON medical_document_intakes(user_id, intake_status)
  WHERE intake_status IN ('uploaded', 'processing', 'review_ready');

ALTER TABLE medical_document_intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own document intakes"
  ON medical_document_intakes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own document intakes"
  ON medical_document_intakes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own document intakes"
  ON medical_document_intakes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own document intakes"
  ON medical_document_intakes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'candidate_medical_facts_source_document_fk'
  ) THEN
    ALTER TABLE candidate_medical_facts
      ADD CONSTRAINT candidate_medical_facts_source_document_fk
      FOREIGN KEY (source_document_id) REFERENCES medical_document_intakes(id)
      ON DELETE SET NULL;
  END IF;
END $$;
