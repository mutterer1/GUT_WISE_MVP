/*
  # Add ranked_explanation_cache table

  ## Purpose
  Persists validated LLM explanation results so they survive page refreshes without
  requiring re-generation. One record per user + fingerprint. The fingerprint is
  the existing hardened ranked insight identity computed in useRankedInsights.

  ## New Tables
  - `ranked_explanation_cache`
    - `id` (uuid, pk)
    - `user_id` (uuid, FK → auth.users, cascades on delete)
    - `fingerprint` (text) – ranked insight identity string
    - `explanation_output` (jsonb) – validated LLMExplanationOutput
    - `validation_status` (text) – 'valid' | 'valid_with_warnings'
    - `item_count` (integer) – explanation item count from meta
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Constraints
  - UNIQUE (user_id, fingerprint) – one current result per user per ranked set

  ## Security
  - RLS enabled; four separate policies for SELECT / INSERT / UPDATE / DELETE
  - Only the owning authenticated user can access their own rows
*/

CREATE TABLE IF NOT EXISTS ranked_explanation_cache (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint     text        NOT NULL,
  explanation_output jsonb    NOT NULL,
  validation_status  text     NOT NULL,
  item_count      integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ranked_explanation_cache_user_fingerprint_unique UNIQUE (user_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS ranked_explanation_cache_user_fingerprint_idx
  ON ranked_explanation_cache (user_id, fingerprint);

ALTER TABLE ranked_explanation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own explanation cache"
  ON ranked_explanation_cache FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own explanation cache"
  ON ranked_explanation_cache FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own explanation cache"
  ON ranked_explanation_cache FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own explanation cache"
  ON ranked_explanation_cache FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
