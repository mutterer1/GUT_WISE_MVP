/*
  # Add reviewable reference intake candidates

  This migration adds a review queue for custom foods and medications that do
  not match the current normalized reference tables at log-save time.

  Design goals:
  - preserve review-first behavior before new reference rows become active
  - let food and medication autocomplete learn from accepted user entries
  - keep candidate rows separate from the live reference tables
*/

CREATE TABLE IF NOT EXISTS reference_review_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_kind text NOT NULL CHECK (candidate_kind IN ('food', 'medication')),
  display_name text NOT NULL,
  normalized_name_key text NOT NULL,
  source_log_type text NOT NULL CHECK (source_log_type IN ('food_log', 'medication_log')),
  source_log_id uuid,
  source_item_id uuid,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_status text NOT NULL DEFAULT 'pending_review' CHECK (review_status IN ('pending_review', 'accepted', 'rejected', 'merged')),
  review_notes text,
  times_seen integer NOT NULL DEFAULT 1 CHECK (times_seen >= 1),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  promoted_reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reference_review_candidates_user_status
  ON reference_review_candidates(user_id, review_status, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_reference_review_candidates_user_kind_status
  ON reference_review_candidates(user_id, candidate_kind, review_status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reference_review_candidates_pending_unique
  ON reference_review_candidates(user_id, candidate_kind, normalized_name_key)
  WHERE review_status = 'pending_review';

ALTER TABLE reference_review_candidates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reference_review_candidates'
      AND policyname = 'Users can view own reference review candidates'
  ) THEN
    CREATE POLICY "Users can view own reference review candidates"
      ON reference_review_candidates FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reference_review_candidates'
      AND policyname = 'Users can insert own reference review candidates'
  ) THEN
    CREATE POLICY "Users can insert own reference review candidates"
      ON reference_review_candidates FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reference_review_candidates'
      AND policyname = 'Users can update own reference review candidates'
  ) THEN
    CREATE POLICY "Users can update own reference review candidates"
      ON reference_review_candidates FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reference_review_candidates'
      AND policyname = 'Users can delete own reference review candidates'
  ) THEN
    CREATE POLICY "Users can delete own reference review candidates"
      ON reference_review_candidates FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_reference_review_candidates_updated_at'
  ) THEN
    CREATE TRIGGER update_reference_review_candidates_updated_at
      BEFORE UPDATE ON reference_review_candidates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

COMMENT ON TABLE reference_review_candidates IS
  'Review-first queue for custom food and medication entries that do not yet exist in the live normalized reference tables.';
