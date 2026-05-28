-- Allow providers to SELECT their own listings regardless of active status.
-- Without this, INSERT...RETURNING is filtered by the "active = true" SELECT
-- policy and PostgREST raises "new row violates row-level security policy".
CREATE POLICY "Providers can select own listings"
  ON listings FOR SELECT
  USING (auth.uid() = profile_id);
