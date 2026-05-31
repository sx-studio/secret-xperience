-- Phone & WhatsApp number verification (Twilio Verify OTP).
-- Providers verify a number via SMS or WhatsApp; verified numbers show on listings.
-- Applied to project duwuzaelmggldhkgoebn via MCP on 2026-05-31; kept here for version control.

alter table public.profiles
  add column if not exists phone_verified       boolean not null default false,
  add column if not exists phone_verified_at    timestamptz,
  add column if not exists whatsapp             text,
  add column if not exists whatsapp_verified    boolean not null default false,
  add column if not exists whatsapp_verified_at timestamptz,
  add column if not exists show_phone           boolean not null default true,
  add column if not exists show_whatsapp        boolean not null default true;
