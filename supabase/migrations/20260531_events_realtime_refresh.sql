-- Keeps the events feed current:
--   • one-off events are deactivated the day after they end
--   • recurring events roll forward to their next occurrence (preserving duration)
-- Runs daily via pg_cron (04:10 UTC). Applied to project duwuzaelmggldhkgoebn.

create or replace function public.refresh_events()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ev        record;
  step      interval;
  dur       int;
  new_start date;
  new_end   date;
begin
  for ev in
    select id, date_start, date_end, recurring
      from public.events
     where active = true
       and coalesce(date_end, date_start) < current_date
  loop
    step := case lower(coalesce(ev.recurring, ''))
              when 'weekly'    then interval '1 week'
              when 'monthly'   then interval '1 month'
              when 'quarterly' then interval '3 months'
              when 'annual'    then interval '1 year'
              when 'yearly'    then interval '1 year'
              else null
            end;

    if step is null then
      update public.events set active = false where id = ev.id;
    else
      dur       := coalesce(ev.date_end, ev.date_start) - ev.date_start;
      new_start := ev.date_start;
      while new_start < current_date loop
        new_start := (new_start + step)::date;
      end loop;
      new_end := (new_start + (dur || ' days')::interval)::date;
      update public.events
         set date_start = new_start,
             date_end   = new_end
       where id = ev.id;
    end if;
  end loop;
end;
$$;

select public.refresh_events();

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('refresh-events-daily')
      where exists (select 1 from cron.job where jobname = 'refresh-events-daily');
    perform cron.schedule('refresh-events-daily', '10 4 * * *', $cron$ select public.refresh_events(); $cron$);
  end if;
end $$;
