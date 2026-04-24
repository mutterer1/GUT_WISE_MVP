DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medication_reference_items'
      AND column_name = 'medication_family'
  ) THEN
    ALTER TABLE public.medication_reference_items
      ADD COLUMN medication_family text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medication_reference_items'
      AND column_name = 'dosage_form'
  ) THEN
    ALTER TABLE public.medication_reference_items
      ADD COLUMN dosage_form text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medication_reference_items'
      AND column_name = 'active_ingredients'
  ) THEN
    ALTER TABLE public.medication_reference_items
      ADD COLUMN active_ingredients text[] NOT NULL DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medication_reference_items'
      AND column_name = 'common_dose_units'
  ) THEN
    ALTER TABLE public.medication_reference_items
      ADD COLUMN common_dose_units text[] NOT NULL DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medication_reference_items'
      AND column_name = 'source_label'
  ) THEN
    ALTER TABLE public.medication_reference_items
      ADD COLUMN source_label text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medication_reference_items'
      AND column_name = 'source_ref'
  ) THEN
    ALTER TABLE public.medication_reference_items
      ADD COLUMN source_ref text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medication_reference_items'
      AND column_name = 'source_confidence'
  ) THEN
    ALTER TABLE public.medication_reference_items
      ADD COLUMN source_confidence numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'medication_reference_items_source_confidence_check'
  ) THEN
    ALTER TABLE public.medication_reference_items
      ADD CONSTRAINT medication_reference_items_source_confidence_check
      CHECK (
        source_confidence IS NULL OR
        (source_confidence >= 0 AND source_confidence <= 1)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_medication_reference_items_medication_family
  ON public.medication_reference_items(medication_family);