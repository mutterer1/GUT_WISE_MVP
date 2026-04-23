/*
  # Allow reference review to refine existing food reference ingredient links

  Pass 4F lets the review queue update prominence, fraction, and notes on
  existing food_reference_ingredients rows when a reviewed food is merged into
  an already-known food reference.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'food_reference_ingredients'
      AND policyname = 'Authenticated users can update food reference ingredients'
  ) THEN
    CREATE POLICY "Authenticated users can update food reference ingredients"
      ON food_reference_ingredients
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;