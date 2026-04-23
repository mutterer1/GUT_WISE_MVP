/*
  # Allow reference review promotions to insert into live reference tables

  The reference review queue accepts pending custom foods and medications by
  promoting them into the live shared reference tables. Those tables already
  have RLS enabled, but only expose SELECT policies. This migration adds
  INSERT policies so authenticated users can promote reviewed candidates.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'food_reference_items'
      AND policyname = 'Authenticated users can insert food references'
  ) THEN
    CREATE POLICY "Authenticated users can insert food references"
      ON food_reference_items
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
      AND tablename = 'medication_reference_items'
      AND policyname = 'Authenticated users can insert medication references'
  ) THEN
    CREATE POLICY "Authenticated users can insert medication references"
      ON medication_reference_items
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;
