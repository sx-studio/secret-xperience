-- SecretXperience native livestreams (provider phone/webcam broadcasts).
-- Distinct from the Stripchat affiliate cam grid at /live.
-- Video transport is LiveKit; chat is Supabase Realtime on live_chat_messages.

CREATE TABLE IF NOT EXISTS public.live_streams (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         text NOT NULL DEFAULT 'Live Show',
  room_name     text NOT NULL UNIQUE,
  status        text NOT NULL DEFAULT 'live' CHECK (status IN ('live','ended')),
  viewer_count  int  NOT NULL DEFAULT 0,
  peak_viewers  int  NOT NULL DEFAULT 0,
  thumbnail_url text,
  recording_url text,
  egress_id     text,
  started_at    timestamptz NOT NULL DEFAULT now(),
  ended_at      timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS live_streams_status_idx ON public.live_streams (status, started_at DESC);
CREATE INDEX IF NOT EXISTS live_streams_provider_idx ON public.live_streams (provider_id);

ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- Anyone may read streams (viewers browse the live grid + watch pages).
DROP POLICY IF EXISTS "live_streams public read" ON public.live_streams;
CREATE POLICY "live_streams public read" ON public.live_streams
  FOR SELECT TO anon, authenticated USING (true);

-- Writes go through service-role server routes only (start/stop/heartbeat).
GRANT SELECT ON public.live_streams TO anon, authenticated;
GRANT ALL    ON public.live_streams TO service_role;

-- ── Live chat ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.live_chat_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id  uuid NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  username   text NOT NULL DEFAULT 'Guest',
  body       text NOT NULL,
  is_tip     boolean NOT NULL DEFAULT false,
  tip_amount int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS live_chat_stream_idx ON public.live_chat_messages (stream_id, created_at);

ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone may read chat for a stream.
DROP POLICY IF EXISTS "live_chat public read" ON public.live_chat_messages;
CREATE POLICY "live_chat public read" ON public.live_chat_messages
  FOR SELECT TO anon, authenticated USING (true);

-- Authenticated users may post their own messages.
DROP POLICY IF EXISTS "live_chat insert own" ON public.live_chat_messages;
CREATE POLICY "live_chat insert own" ON public.live_chat_messages
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

GRANT SELECT ON public.live_chat_messages TO anon, authenticated;
GRANT INSERT ON public.live_chat_messages TO authenticated;
GRANT ALL    ON public.live_chat_messages TO service_role;

-- Realtime broadcast of new chat rows.
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;
