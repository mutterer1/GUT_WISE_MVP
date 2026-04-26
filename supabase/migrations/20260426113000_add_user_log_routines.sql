/*
  # Add user log routines

  Routines are user-pinned reusable log templates. They let a user turn a
  frequently repeated entry into a dashboard shortcut without changing the
  original saved log.
*/

CREATE TABLE IF NOT EXISTS user_log_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_type text NOT NULL CHECK (
    log_type IN (
      'bm',
      'food',
      'symptoms',
      'sleep',
      'stress',
      'hydration',
      'medication',
      'menstrual-cycle',
      'exercise'
    )
  ),
  routine_name text NOT NULL CHECK (length(trim(routine_name)) > 0),
  source_log_id uuid,
  routine_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  usage_count integer NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  last_used_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_log_routines_user_order
  ON user_log_routines(user_id, sort_order ASC, usage_count DESC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_log_routines_user_type
  ON user_log_routines(user_id, log_type, updated_at DESC);

ALTER TABLE user_log_routines ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_log_routines'
      AND policyname = 'Users can view own log routines'
  ) THEN
    CREATE POLICY "Users can view own log routines"
      ON user_log_routines FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_log_routines'
      AND policyname = 'Users can insert own log routines'
  ) THEN
    CREATE POLICY "Users can insert own log routines"
      ON user_log_routines FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_log_routines'
      AND policyname = 'Users can update own log routines'
  ) THEN
    CREATE POLICY "Users can update own log routines"
      ON user_log_routines FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_log_routines'
      AND policyname = 'Users can delete own log routines'
  ) THEN
    CREATE POLICY "Users can delete own log routines"
      ON user_log_routines FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_user_log_routines_updated_at'
  ) THEN
    CREATE TRIGGER update_user_log_routines_updated_at
      BEFORE UPDATE ON user_log_routines
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION increment_user_log_routine_usage(p_routine_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE user_log_routines
  SET
    usage_count = usage_count + 1,
    last_used_at = now(),
    updated_at = now()
  WHERE id = p_routine_id
    AND user_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION increment_user_log_routine_usage(uuid) TO authenticated;

COMMENT ON TABLE user_log_routines IS
  'User-pinned reusable log templates for dashboard fast logging.';