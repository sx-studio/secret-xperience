-- identity_verifications was created without standard Supabase role grants.
-- service_role needs SELECT/INSERT/UPDATE/DELETE to bypass RLS.
-- authenticated needs SELECT/INSERT/UPDATE for users managing their own record.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.identity_verifications TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.identity_verifications TO authenticated;
