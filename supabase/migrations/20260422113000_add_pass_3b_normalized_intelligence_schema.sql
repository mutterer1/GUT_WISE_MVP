/*
  # Pass 3B - normalized intelligence schema

  This migration adds the first normalized schema layer for:
  - ingredient reference data
  - food reference data and ingredient composition
  - per-log food item rows
  - normalized medication reference data
  - richer medication log metadata
  - document extraction metadata and evidence spans

  Design principles:
  - existing logs stay valid and continue to work
  - imported or extracted context remains reviewable before activation
  - evidence can be cited back to document spans
  - food and medication intelligence can mature without relying only on free text
*/

-- ============================================================
-- 1. GLOBAL REFERENCE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS ingredient_reference_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name text NOT NULL,
  display_name text NOT NULL,
  ingredient_category text,
  fodmap_level text CHECK (fodmap_level IN ('low', 'moderate', 'high', 'unknown')),
  common_aliases text[] NOT NULL DEFAULT '{}',
  default_signals text[] NOT NULL DEFAULT '{}',
  typical_gut_reactions text[] NOT NULL DEFAULT '{}',
  evidence_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ingredient_reference_items_canonical_name_key UNIQUE (canonical_name)
);

CREATE TABLE IF NOT EXISTS food_reference_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name text NOT NULL,
  display_name text NOT NULL,
  brand_name text,
  food_category text,
  default_serving_amount numeric,
  default_serving_unit text,
  common_aliases text[] NOT NULL DEFAULT '{}',
  default_signals text[] NOT NULL DEFAULT '{}',
  source_label text NOT NULL DEFAULT 'gutwise_seed',
  evidence_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_reference_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_reference_id uuid NOT NULL REFERENCES food_reference_items(id) ON DELETE CASCADE,
  ingredient_reference_id uuid NOT NULL REFERENCES ingredient_reference_items(id) ON DELETE RESTRICT,
  grams_per_default_serving numeric,
  ingredient_fraction numeric CHECK (ingredient_fraction IS NULL OR (ingredient_fraction >= 0 AND ingredient_fraction <= 1)),
  prominence_rank integer,
  is_primary boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT food_reference_ingredients_unique UNIQUE (food_reference_id, ingredient_reference_id)
);

CREATE TABLE IF NOT EXISTS medication_reference_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generic_name text NOT NULL,
  display_name text NOT NULL,
  brand_names text[] NOT NULL DEFAULT '{}',
  rxnorm_code text,
  medication_class text,
  route text,
  medication_type text CHECK (medication_type IN ('prescription', 'otc', 'supplement', 'unknown')),
  gut_relevance text CHECK (gut_relevance IN ('primary', 'secondary', 'indirect', 'unknown')),
  common_gut_effects text[] NOT NULL DEFAULT '{}',
  interaction_flags text[] NOT NULL DEFAULT '{}',
  evidence_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingredient_reference_items_display_name
  ON ingredient_reference_items(display_name);

CREATE INDEX IF NOT EXISTS idx_food_reference_items_display_name
  ON food_reference_items(display_name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_food_reference_items_canonical_brand
  ON food_reference_items(canonical_name, COALESCE(brand_name, ''));

CREATE INDEX IF NOT EXISTS idx_food_reference_ingredients_food_reference_id
  ON food_reference_ingredients(food_reference_id);

CREATE INDEX IF NOT EXISTS idx_food_reference_ingredients_ingredient_reference_id
  ON food_reference_ingredients(ingredient_reference_id);

CREATE INDEX IF NOT EXISTS idx_medication_reference_items_display_name
  ON medication_reference_items(display_name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_medication_reference_items_generic_route
  ON medication_reference_items(generic_name, COALESCE(route, ''));

ALTER TABLE ingredient_reference_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_reference_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_reference_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_reference_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ingredient_reference_items'
      AND policyname = 'Authenticated users can view ingredient references'
  ) THEN
    CREATE POLICY "Authenticated users can view ingredient references"
      ON ingredient_reference_items FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'food_reference_items'
      AND policyname = 'Authenticated users can view food references'
  ) THEN
    CREATE POLICY "Authenticated users can view food references"
      ON food_reference_items FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'food_reference_ingredients'
      AND policyname = 'Authenticated users can view food reference ingredients'
  ) THEN
    CREATE POLICY "Authenticated users can view food reference ingredients"
      ON food_reference_ingredients FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'medication_reference_items'
      AND policyname = 'Authenticated users can view medication references'
  ) THEN
    CREATE POLICY "Authenticated users can view medication references"
      ON medication_reference_items FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ============================================================
-- 2. FOOD LOG NORMALIZATION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS food_log_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_log_id uuid NOT NULL REFERENCES food_logs(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  normalized_food_id uuid REFERENCES food_reference_items(id) ON DELETE SET NULL,
  quantity_value numeric,
  quantity_unit text,
  preparation_method text,
  brand_name text,
  restaurant_name text,
  consumed_order integer,
  source_method text NOT NULL DEFAULT 'manual_entry' CHECK (source_method IN ('manual_entry', 'autocomplete_match', 'import_candidate', 'derived_from_note')),
  confidence_score numeric CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_log_item_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_log_item_id uuid NOT NULL REFERENCES food_log_items(id) ON DELETE CASCADE,
  ingredient_reference_id uuid REFERENCES ingredient_reference_items(id) ON DELETE SET NULL,
  ingredient_name_text text NOT NULL,
  quantity_estimate numeric,
  quantity_unit text,
  source_method text NOT NULL DEFAULT 'manual_entry' CHECK (source_method IN ('manual_entry', 'catalog_match', 'document_extraction', 'llm_inference')),
  confidence_score numeric CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
  gut_signals_override text[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_log_items_user_logged
  ON food_log_items(user_id, food_log_id, consumed_order);

CREATE INDEX IF NOT EXISTS idx_food_log_items_normalized_food_id
  ON food_log_items(normalized_food_id);

CREATE INDEX IF NOT EXISTS idx_food_log_item_ingredients_food_log_item_id
  ON food_log_item_ingredients(food_log_item_id);

CREATE INDEX IF NOT EXISTS idx_food_log_item_ingredients_ingredient_reference_id
  ON food_log_item_ingredients(ingredient_reference_id);

ALTER TABLE food_log_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_log_item_ingredients ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'food_log_items'
      AND policyname = 'Users can view own food log items'
  ) THEN
    CREATE POLICY "Users can view own food log items"
      ON food_log_items FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'food_log_items'
      AND policyname = 'Users can insert own food log items'
  ) THEN
    CREATE POLICY "Users can insert own food log items"
      ON food_log_items FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'food_log_items'
      AND policyname = 'Users can update own food log items'
  ) THEN
    CREATE POLICY "Users can update own food log items"
      ON food_log_items FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'food_log_items'
      AND policyname = 'Users can delete own food log items'
  ) THEN
    CREATE POLICY "Users can delete own food log items"
      ON food_log_items FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'food_log_item_ingredients'
      AND policyname = 'Users can view own food log item ingredients'
  ) THEN
    CREATE POLICY "Users can view own food log item ingredients"
      ON food_log_item_ingredients FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'food_log_item_ingredients'
      AND policyname = 'Users can insert own food log item ingredients'
  ) THEN
    CREATE POLICY "Users can insert own food log item ingredients"
      ON food_log_item_ingredients FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'food_log_item_ingredients'
      AND policyname = 'Users can update own food log item ingredients'
  ) THEN
    CREATE POLICY "Users can update own food log item ingredients"
      ON food_log_item_ingredients FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'food_log_item_ingredients'
      AND policyname = 'Users can delete own food log item ingredients'
  ) THEN
    CREATE POLICY "Users can delete own food log item ingredients"
      ON food_log_item_ingredients FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- 3. MEDICATION LOG NORMALIZATION
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medication_logs' AND column_name = 'normalized_medication_id'
  ) THEN
    ALTER TABLE medication_logs
      ADD COLUMN normalized_medication_id uuid REFERENCES medication_reference_items(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medication_logs' AND column_name = 'dose_value'
  ) THEN
    ALTER TABLE medication_logs
      ADD COLUMN dose_value numeric;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medication_logs' AND column_name = 'dose_unit'
  ) THEN
    ALTER TABLE medication_logs
      ADD COLUMN dose_unit text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medication_logs' AND column_name = 'route'
  ) THEN
    ALTER TABLE medication_logs
      ADD COLUMN route text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medication_logs' AND column_name = 'reason_for_use'
  ) THEN
    ALTER TABLE medication_logs
      ADD COLUMN reason_for_use text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medication_logs' AND column_name = 'regimen_status'
  ) THEN
    ALTER TABLE medication_logs
      ADD COLUMN regimen_status text CHECK (regimen_status IN ('scheduled', 'as_needed', 'one_time', 'unknown'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medication_logs' AND column_name = 'timing_context'
  ) THEN
    ALTER TABLE medication_logs
      ADD COLUMN timing_context text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_medication_logs_normalized_medication_id
  ON medication_logs(normalized_medication_id);

-- ============================================================
-- 4. DOCUMENT EXTRACTION AND EVIDENCE
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medical_document_intakes' AND column_name = 'storage_bucket'
  ) THEN
    ALTER TABLE medical_document_intakes
      ADD COLUMN storage_bucket text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medical_document_intakes' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE medical_document_intakes
      ADD COLUMN storage_path text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medical_document_intakes' AND column_name = 'content_sha256'
  ) THEN
    ALTER TABLE medical_document_intakes
      ADD COLUMN content_sha256 text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medical_document_intakes' AND column_name = 'extraction_status'
  ) THEN
    ALTER TABLE medical_document_intakes
      ADD COLUMN extraction_status text NOT NULL DEFAULT 'not_started'
      CHECK (extraction_status IN ('not_started', 'queued', 'processing', 'completed', 'failed'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medical_document_intakes' AND column_name = 'extraction_error'
  ) THEN
    ALTER TABLE medical_document_intakes
      ADD COLUMN extraction_error text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medical_document_intakes' AND column_name = 'extracted_text'
  ) THEN
    ALTER TABLE medical_document_intakes
      ADD COLUMN extracted_text text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medical_document_intakes' AND column_name = 'extracted_at'
  ) THEN
    ALTER TABLE medical_document_intakes
      ADD COLUMN extracted_at timestamptz;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medical_document_intakes' AND column_name = 'page_count'
  ) THEN
    ALTER TABLE medical_document_intakes
      ADD COLUMN page_count integer;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS medical_document_evidence_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_intake_id uuid NOT NULL REFERENCES medical_document_intakes(id) ON DELETE CASCADE,
  page_number integer,
  section_label text,
  quoted_text text NOT NULL,
  normalized_text text,
  span_start integer,
  span_end integer,
  extractor_label text,
  confidence_score numeric CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidate_medical_fact_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_medical_fact_id uuid NOT NULL REFERENCES candidate_medical_facts(id) ON DELETE CASCADE,
  document_intake_id uuid NOT NULL REFERENCES medical_document_intakes(id) ON DELETE CASCADE,
  evidence_segment_id uuid REFERENCES medical_document_evidence_segments(id) ON DELETE SET NULL,
  evidence_kind text NOT NULL DEFAULT 'quote' CHECK (evidence_kind IN ('quote', 'summary', 'lab_value', 'medication_list', 'diagnosis_statement', 'procedure_statement')),
  page_number integer,
  cited_text text,
  confidence_score numeric CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_document_intakes_extraction_status
  ON medical_document_intakes(user_id, extraction_status);

CREATE INDEX IF NOT EXISTS idx_medical_document_evidence_segments_document_intake_id
  ON medical_document_evidence_segments(document_intake_id);

CREATE INDEX IF NOT EXISTS idx_candidate_medical_fact_evidence_candidate_id
  ON candidate_medical_fact_evidence(candidate_medical_fact_id);

CREATE INDEX IF NOT EXISTS idx_candidate_medical_fact_evidence_document_intake_id
  ON candidate_medical_fact_evidence(document_intake_id);

ALTER TABLE medical_document_evidence_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_medical_fact_evidence ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'medical_document_evidence_segments'
      AND policyname = 'Users can view own document evidence segments'
  ) THEN
    CREATE POLICY "Users can view own document evidence segments"
      ON medical_document_evidence_segments FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'medical_document_evidence_segments'
      AND policyname = 'Users can insert own document evidence segments'
  ) THEN
    CREATE POLICY "Users can insert own document evidence segments"
      ON medical_document_evidence_segments FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'medical_document_evidence_segments'
      AND policyname = 'Users can update own document evidence segments'
  ) THEN
    CREATE POLICY "Users can update own document evidence segments"
      ON medical_document_evidence_segments FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'medical_document_evidence_segments'
      AND policyname = 'Users can delete own document evidence segments'
  ) THEN
    CREATE POLICY "Users can delete own document evidence segments"
      ON medical_document_evidence_segments FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'candidate_medical_fact_evidence'
      AND policyname = 'Users can view own candidate medical fact evidence'
  ) THEN
    CREATE POLICY "Users can view own candidate medical fact evidence"
      ON candidate_medical_fact_evidence FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'candidate_medical_fact_evidence'
      AND policyname = 'Users can insert own candidate medical fact evidence'
  ) THEN
    CREATE POLICY "Users can insert own candidate medical fact evidence"
      ON candidate_medical_fact_evidence FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'candidate_medical_fact_evidence'
      AND policyname = 'Users can update own candidate medical fact evidence'
  ) THEN
    CREATE POLICY "Users can update own candidate medical fact evidence"
      ON candidate_medical_fact_evidence FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'candidate_medical_fact_evidence'
      AND policyname = 'Users can delete own candidate medical fact evidence'
  ) THEN
    CREATE POLICY "Users can delete own candidate medical fact evidence"
      ON candidate_medical_fact_evidence FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- 5. UPDATED_AT TRIGGERS
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ingredient_reference_items_updated_at') THEN
    CREATE TRIGGER update_ingredient_reference_items_updated_at
      BEFORE UPDATE ON ingredient_reference_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_food_reference_items_updated_at') THEN
    CREATE TRIGGER update_food_reference_items_updated_at
      BEFORE UPDATE ON food_reference_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_food_reference_ingredients_updated_at') THEN
    CREATE TRIGGER update_food_reference_ingredients_updated_at
      BEFORE UPDATE ON food_reference_ingredients
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_medication_reference_items_updated_at') THEN
    CREATE TRIGGER update_medication_reference_items_updated_at
      BEFORE UPDATE ON medication_reference_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_food_log_items_updated_at') THEN
    CREATE TRIGGER update_food_log_items_updated_at
      BEFORE UPDATE ON food_log_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_food_log_item_ingredients_updated_at') THEN
    CREATE TRIGGER update_food_log_item_ingredients_updated_at
      BEFORE UPDATE ON food_log_item_ingredients
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_medical_document_evidence_segments_updated_at') THEN
    CREATE TRIGGER update_medical_document_evidence_segments_updated_at
      BEFORE UPDATE ON medical_document_evidence_segments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_candidate_medical_fact_evidence_updated_at') THEN
    CREATE TRIGGER update_candidate_medical_fact_evidence_updated_at
      BEFORE UPDATE ON candidate_medical_fact_evidence
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================
-- 6. COLUMN COMMENTS
-- ============================================================

COMMENT ON TABLE food_log_items IS
  'Normalized per-item rows associated with a food log. Existing food_logs remain the canonical event parent.';

COMMENT ON TABLE food_log_item_ingredients IS
  'Ingredient-level evidence for a logged food item, allowing manual, imported, or inferred ingredient breakdown.';

COMMENT ON TABLE medical_document_evidence_segments IS
  'Document spans or excerpts that can be cited during medical candidate review.';

COMMENT ON TABLE candidate_medical_fact_evidence IS
  'Evidence links connecting a pending medical candidate to one or more cited document spans.';
