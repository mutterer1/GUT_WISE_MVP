/*
  # Fix mutable search_path on update_updated_at_column function

  ## Security Fix
  - Replaces `public.update_updated_at_column` with a version that has an immutable
    `search_path` set to `''` (empty string).
  - Uses fully qualified `pg_catalog.now()` to avoid any schema resolution ambiguity.
  - Prevents privilege-escalation attacks that exploit a mutable search_path in triggers.

  ## Changes
  - `update_updated_at_column`: Recreated with `SET search_path = ''` and
    `pg_catalog.now()` instead of bare `now()`.
*/

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;
