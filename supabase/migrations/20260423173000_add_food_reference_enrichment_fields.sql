/*
  # Pass 4A - food reference enrichment fields

  Adds nutrition and reviewed-serving metadata to food_reference_items so
  accepted review-queue foods can carry a real nutrition profile, source
  provenance, and confidence instead of only tags and free-text notes.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'food_reference_items' AND column_name = 'reviewed_serving_label'
  ) THEN
    ALTER TABLE food_reference_items
      ADD COLUMN reviewed_serving_label text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'food_reference_items' AND column_name = 'calories_kcal'
  ) THEN
    ALTER TABLE food_reference_items
      ADD COLUMN calories_kcal numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'food_reference_items' AND column_name = 'protein_g'
  ) THEN
    ALTER TABLE food_reference_items
      ADD COLUMN protein_g numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'food_reference_items' AND column_name = 'fat_g'
  ) THEN
    ALTER TABLE food_reference_items
      ADD COLUMN fat_g numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'food_reference_items' AND column_name = 'carbs_g'
  ) THEN
    ALTER TABLE food_reference_items
      ADD COLUMN carbs_g numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'food_reference_items' AND column_name = 'fiber_g'
  ) THEN
    ALTER TABLE food_reference_items
      ADD COLUMN fiber_g numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'food_reference_items' AND column_name = 'sugar_g'
  ) THEN
    ALTER TABLE food_reference_items
      ADD COLUMN sugar_g numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'food_reference_items' AND column_name = 'sodium_mg'
  ) THEN
    ALTER TABLE food_reference_items
      ADD COLUMN sodium_mg numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'food_reference_items' AND column_name = 'nutrition_confidence'
  ) THEN
    ALTER TABLE food_reference_items
      ADD COLUMN nutrition_confidence numeric CHECK (
        nutrition_confidence IS NULL OR
        (nutrition_confidence >= 0 AND nutrition_confidence <= 1)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'food_reference_items' AND column_name = 'nutrition_source_label'
  ) THEN
    ALTER TABLE food_reference_items
      ADD COLUMN nutrition_source_label text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'food_reference_items' AND column_name = 'nutrition_source_ref'
  ) THEN
    ALTER TABLE food_reference_items
      ADD COLUMN nutrition_source_ref text;
  END IF;
END $$;

COMMENT ON COLUMN food_reference_items.reviewed_serving_label IS
  'Human-readable serving label reviewed or accepted during food reference promotion.';

COMMENT ON COLUMN food_reference_items.calories_kcal IS
  'Reviewed calorie estimate for the accepted serving.';

COMMENT ON COLUMN food_reference_items.protein_g IS
  'Reviewed protein grams for the accepted serving.';

COMMENT ON COLUMN food_reference_items.fat_g IS
  'Reviewed fat grams for the accepted serving.';

COMMENT ON COLUMN food_reference_items.carbs_g IS
  'Reviewed carbohydrate grams for the accepted serving.';

COMMENT ON COLUMN food_reference_items.fiber_g IS
  'Reviewed fiber grams for the accepted serving.';

COMMENT ON COLUMN food_reference_items.sugar_g IS
  'Reviewed sugar grams for the accepted serving.';

COMMENT ON COLUMN food_reference_items.sodium_mg IS
  'Reviewed sodium milligrams for the accepted serving.';

COMMENT ON COLUMN food_reference_items.nutrition_confidence IS
  'Confidence score for the saved nutrition profile.';

COMMENT ON COLUMN food_reference_items.nutrition_source_label IS
  'Label describing where the nutrition estimate came from.';

COMMENT ON COLUMN food_reference_items.nutrition_source_ref IS
  'Optional citation or provider reference for the saved nutrition estimate.';
