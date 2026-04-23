/*
  # Allow reference review promotions to insert ingredient reference rows

  Pass 4E promotes accepted enriched foods into:
  - ingredient_reference_items
  - food_reference_ingredients

  Those tables already have RLS enabled, but only expose SELECT policies.
  This migration adds INSERT policies so authenticated users can create
  ingredient references and attach them to accepted food references.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ingredient_reference_items'
      AND policyname = 'Authenticated users can insert ingredient references'
  ) THEN
    CREATE POLICY "Authenticated users can insert ingredient references"
      ON ingredient_reference_items
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'food_reference_ingredients'
      AND policyname = 'Authenticated users can insert food reference ingredients'
  ) THEN
    CREATE POLICY "Authenticated users can insert food reference ingredients"
      ON food_reference_ingredients
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;
