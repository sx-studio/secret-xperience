'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
)

type LiveStream = {
  id: string
  title: string
  viewer_count: number
  profiles: { full_name: string | null; username: string | null } | null
}

// Scrolling "live now" strip on the homepage. Renders nothing when no advertiser
// is broadcasting, so it stays invisible until there's something to watch.
export default function LiveBanner() {
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const el = document.getElementById('liveBannerMount')
    if (el) setMountEl(el)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data } = await supabase
        .from('live_streams')
        .select('id, title, viewer_count, profiles:provider_id(full_name, username)')
        .eq('status', 'live')
        .order('viewer_count', { ascending: false })
        .limit(8)
      if (!cancelled) setStreams((data as any) || [])
    }
    load()
    const ch = supabase
      .channel('live_banner')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, load)
      .subscribe()
    const t = setInterval(load, 25000)
    return () => { cancelled = true; supabase.removeChannel(ch); clearInterval(t) }
  }, [])

  if (!mountEl || streams.length === 0) return null

  const names = streams.map(s => s.profiles?.full_name || s.profiles?.username || 'A performer')
  const totalViewers = streams.reduce((n, s) => n + (s.viewer_count || 0), 0)
  // One live = link straight to that show; many = the live grid.
  const href = streams.length === 1 ? `/livestreams/${streams[0].id}` : '/livestreams'

  // Build a repeatable ticker phrase so the marquee reads continuously.
  const phrase = streams.length === 1
    ? `${names[0]} is LIVE now — ${streams[0].title}`
    : `${names.slice(0, 3).join(', ')}${streams.length > 3 ? ` +${streams.length - 3} more` : ''} are LIVE right now`

  const banner = (
    <>
      <style>{`
        .lvbar{display:flex;align-items:stretch;width:100%;border-radius:14px;overflow:hidden;
          background:linear-gradient(90deg,rgba(239,68,68,.16),rgba(239,68,68,.06) 60%,rgba(10,10,10,.4));
          border:0.5px solid rgba(239,68,68,.35);text-decoration:none;margin:6px 0 14px;
          box-shadow:0 8px 30px rgba(239,68,68,.10)}
        .lvbar:hover{border-color:rgba(239,68,68,.6);box-shadow:0 10px 36px rgba(239,68,68,.18)}
        .lvbar-tag{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:0 18px;
          background:linear-gradient(90deg,#ef4444,#f05656);color:#fff;font:700 12px 'Poppins',sans-serif;
          letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
        .lvbar-tag .d{width:8px;height:8px;border-radius:50%;background:#fff;animation:lvblink 1.2s infinite}
        @keyframes lvblink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}
        .lvbar-track{flex:1;overflow:hidden;position:relative;display:flex;align-items:center;-webkit-mask-image:linear-gradient(90deg,transparent,#000 4%,#000 96%,transparent)}
        .lvbar-move{display:inline-flex;white-space:nowrap;will-change:transform;animation:lvscroll 26s linear infinite;padding-left:100%}
        .lvbar:hover .lvbar-move{animation-play-state:paused}
        @keyframes lvscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .lvbar-item{color:#f3e4d6;font:500 13.5px 'Poppins',sans-serif;padding:11px 0;margin-right:46px;display:inline-flex;align-items:center;gap:9px}
        .lvbar-item b{color:#fff;font-weight:600}
        .lvbar-item i{color:#ef4444}
        .lvbar-cta{flex:0 0 auto;display:flex;align-items:center;gap:6px;padding:0 18px;color:#fff;
          font:700 12.5px 'Poppins',sans-serif;white-space:nowrap;background:rgba(0,0,0,.18)}
        .lvbar-cta i{transition:transform .18s}
        .lvbar:hover .lvbar-cta i{transform:translateX(3px)}
        @media(max-width:560px){
          .lvbar-tag span.txt{display:none}
          .lvbar-tag{padding:0 12px}
          .lvbar-cta span.txt{display:none}
          .lvbar-cta{padding:0 14px}
          .lvbar-item{font-size:12.5px}
        }
      `}</style>
      <a href={href} className="lvbar" aria-label="Watch live now">
        <div className="lvbar-tag"><span className="d" /><span className="txt">Live Now</span></div>
        <div className="lvbar-track">
          <div className="lvbar-move">
            {[0, 1].map(dup => (
              <span key={dup} style={{ display: 'inline-flex' }} aria-hidden={dup === 1}>
                <span className="lvbar-item"><i className="ti ti-broadcast" /> <b>{phrase}</b></span>
                <span className="lvbar-item"><i className="ti ti-eye" /> {totalViewers} watching</span>
                <span className="lvbar-item"><i className="ti ti-flame" /> Tap to join the show</span>
              </span>
            ))}
          </div>
        </div>
        <div className="lvbar-cta"><span className="txt">Watch</span><i className="ti ti-arrow-right" /></div>
      </a>
    </>
  )

  return createPortal(banner, mountEl)
}
