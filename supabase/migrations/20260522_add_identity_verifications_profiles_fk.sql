-- The existing FK on user_id points to auth.users (invisible to PostgREST).
-- Adding a second FK to public.profiles so the admin panel embedded join works.
ALTER TABLE public.identity_verifications
  ADD CONSTRAINT identity_verifications_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
