/*
  # Add generic medical import framework support

  1. Purpose
    - Allow non-document external imports to enter the existing evidence-review pipeline
    - Preserve explicit provenance for imported candidates and promoted medical facts
    - Add intake-level metadata so imports can be reviewed alongside uploaded documents

  2. Changes
    - Expand `medical_facts.provenance_source` to include `external_import`
    - Expand `candidate_medical_facts.extraction_source` to include `external_import`
    - Add intake-level metadata to `medical_document_intakes`:
      - `intake_source`
      - `source_label`
      - `source_reference`
      - `source_metadata`

  3. Notes
    - Existing rows are preserved
    - Existing review queues continue to work
    - Future importers can reuse the same candidate/evidence tables without bypassing review
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'medical_facts_provenance_source_check'
  ) THEN
    ALTER TABLE medical_facts
      DROP CONSTRAINT medical_facts_provenance_source_check;
  END IF;

  ALTER TABLE medical_facts
    ADD CONSTRAINT medical_facts_provenance_source_check
    CHECK (
      provenance_source IN (
        'manual_entry',
        'document_extraction',
        'clinician_shared',
        'external_import'
      )
    );
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'candidate_medical_facts_extraction_source_check'
  ) THEN
    ALTER TABLE candidate_medical_facts
      DROP CONSTRAINT candidate_medical_facts_extraction_source_check;
  END IF;

  ALTER TABLE candidate_medical_facts
    ADD CONSTRAINT candidate_medical_facts_extraction_source_check
    CHECK (
      extraction_source IN (
        'document_extraction',
        'clinician_shared',
        'inference',
        'external_import'
      )
    );
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medical_document_intakes'
      AND column_name = 'intake_source'
  ) THEN
    ALTER TABLE medical_document_intakes
      ADD COLUMN intake_source text NOT NULL DEFAULT 'document_upload';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medical_document_intakes'
      AND column_name = 'source_label'
  ) THEN
    ALTER TABLE medical_document_intakes
      ADD COLUMN source_label text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medical_document_intakes'
      AND column_name = 'source_reference'
  ) THEN
    ALTER TABLE medical_document_intakes
      ADD COLUMN source_reference text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medical_document_intakes'
      AND column_name = 'source_metadata'
  ) THEN
    ALTER TABLE medical_document_intakes
      ADD COLUMN source_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'medical_document_intakes_intake_source_check'
  ) THEN
    ALTER TABLE medical_document_intakes
      DROP CONSTRAINT medical_document_intakes_intake_source_check;
  END IF;

  ALTER TABLE medical_document_intakes
    ADD CONSTRAINT medical_document_intakes_intake_source_check
    CHECK (intake_source IN ('document_upload', 'external_import'));
END $$;

UPDATE medical_document_intakes
SET source_metadata = '{}'::jsonb
WHERE source_metadata IS NULL;

CREATE INDEX IF NOT EXISTS idx_medical_document_intakes_user_source
ON medical_document_intakes(user_id, intake_source);