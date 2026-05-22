-- Fix: wallet trigger failed with "relation user_wallets does not exist"
-- because the function lacked an explicit search_path.
-- Already applied live via Supabase MCP.
CREATE OR REPLACE FUNCTION public.create_wallet_for_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
