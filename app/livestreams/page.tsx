'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'

export default function LiveStreamsPage() {
  const [streams, setStreams] = useState<any[]>([])
  const [replays, setReplays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [canHost, setCanHost] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data } = await supabase
        .from('live_streams')
        .select('id, title, viewer_count, started_at, profiles:provider_id(full_name, username, avatar_url)')
        .eq('status', 'live').order('viewer_count', { ascending: false })
      setStreams(data || [])
      setLoading(false)
      // Past shows that have a saved recording.
      const { data: past } = await supabase
        .from('live_streams')
        .select('id, title, peak_viewers, ended_at, recording_url, profiles:provider_id(full_name, username, avatar_url)')
        .eq('status', 'ended').not('recording_url', 'is', null)
        .order('ended_at', { ascending: false }).limit(12)
      setReplays(past || [])
    }
    load()
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('verified, role').eq('id', session.user.id).maybeSingle()
      if (p?.verified || p?.role === 'admin') setCanHost(true)
    })()
    // Refresh the grid + viewer counts on any change.
    const ch = supabase.channel('live_grid')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, load)
      .subscribe()
    const t = setInterval(load, 20000)
    return () => { supabase.removeChannel(ch); clearInterval(t) }
  }, [])

  return (
    <>
      <style>{styles}</style>
      <div className="ls">
        <a href="/" className="ls-back"><i className="ti ti-arrow-left" /> SecretXperience</a>

        <div className="ls-hero">
          <div>
            <div className="ls-badge"><span className="ls-dot" /> SecretXperience Live</div>
            <h1 className="ls-title">Our performers, <em>live now</em></h1>
            <p className="ls-sub">Verified SecretXperience providers broadcasting in real time. Watch, chat, and tip with tokens.</p>
          </div>
          {canHost && (
            <a href="/go-live" className="ls-golive"><i className="ti ti-broadcast" /> Go Live</a>
          )}
        </div>

        {loading ? (
          <div className="ls-grid">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="ls-skel" />)}
          </div>
        ) : streams.length === 0 ? (
          <div className="ls-empty">
            <i className="ti ti-broadcast-off" style={{ fontSize: 30, display: 'block', marginBottom: 10 }} />
            No one is live right now.
            {canHost && <div style={{ marginTop: 14 }}><a href="/go-live" className="ls-cta">Be the first — go live →</a></div>}
          </div>
        ) : (
          <div className="ls-grid">
            {streams.map(s => {
              const host = s.profiles?.full_name || s.profiles?.username || 'Host'
              return (
                <a key={s.id} href={`/livestreams/${s.id}`} className="ls-card">
                  <div className="ls-card-media">
                    {s.profiles?.avatar_url
                      ? <img src={s.profiles.avatar_url} alt={host} />
                      : <div className="ls-card-ph"><i className="ti ti-video" /></div>}
                    <div className="ls-card-live"><span /> LIVE</div>
                    <div className="ls-card-viewers"><i className="ti ti-eye" /> {s.viewer_count}</div>
                  </div>
                  <div className="ls-card-info">
                    <div className="ls-card-title">{s.title}</div>
                    <div className="ls-card-host">{host}</div>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {replays.length > 0 && (
          <div className="ls-replays">
            <div className="ls-rep-head"><i className="ti ti-player-play" /> Recent replays</div>
            <div className="ls-grid">
              {replays.map(s => {
                const host = s.profiles?.full_name || s.profiles?.username || 'Host'
                return (
                  <a key={s.id} href={`/livestreams/${s.id}`} className="ls-card">
                    <div className="ls-card-media">
                      {s.profiles?.avatar_url
                        ? <img src={s.profiles.avatar_url} alt={host} />
                        : <div className="ls-card-ph"><i className="ti ti-player-play" /></div>}
                      <div className="ls-card-replay"><i className="ti ti-player-play" /> REPLAY</div>
                    </div>
                    <div className="ls-card-info">
                      <div className="ls-card-title">{s.title}</div>
                      <div className="ls-card-host">{host}{s.peak_viewers ? ` · ${s.peak_viewers} watched` : ''}</div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        <div className="ls-disc">
          All performers are verified SecretXperience providers, consenting adults aged 18+. By watching you confirm you are 18 or older and agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
        </div>
      </div>
    </>
  )
}

const styles = `
*{box-sizing:border-box;margin:0;padding:0}
.ls{min-height:100vh;background:#050505;color:#ece8e1;font-family:'Poppins',sans-serif}
.ls-back{display:inline-flex;align-items:center;gap:6px;padding:14px 24px;color:#8c8880;font:400 13px 'Poppins';text-decoration:none}
.ls-back:hover{color:#ece8e1}
.ls-hero{max-width:1280px;margin:0 auto;padding:8px 24px 28px;display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap}
.ls-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(239,68,68,.12);border:0.5px solid rgba(239,68,68,.3);color:#ef4444;padding:3px 10px;border-radius:20px;font:600 11px 'Poppins';letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}
.ls-dot{width:6px;height:6px;border-radius:50%;background:#ef4444;animation:lsdot 1.4s infinite}
@keyframes lsdot{0%,100%{opacity:1}50%{opacity:.3}}
.ls-title{font-family:'Cormorant Garamond',serif;font-size:clamp(26px,4.5vw,44px);font-weight:400;line-height:1.1;margin-bottom:6px}
.ls-title em{font-style:italic;background:linear-gradient(90deg,#c5a05a,#e8cc88,#c5a05a);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.ls-sub{font-size:13px;color:#8c8880;line-height:1.6;max-width:460px}
.ls-golive{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(90deg,#ef4444,#f87171);color:#fff;padding:12px 22px;border-radius:12px;font:700 14px 'Poppins';text-decoration:none}
.ls-golive:hover{filter:brightness(1.06)}
.ls-grid{max-width:1280px;margin:0 auto;padding:0 24px 48px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
.ls-card{border-radius:14px;overflow:hidden;background:#0c0c0c;border:0.5px solid rgba(255,255,255,.06);text-decoration:none;color:inherit;transition:transform .2s,box-shadow .2s}
.ls-card:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(0,0,0,.6),0 0 0 .5px rgba(197,160,90,.3)}
.ls-card-media{position:relative;aspect-ratio:4/5;background:#111}
.ls-card-media img{width:100%;height:100%;object-fit:cover}
.ls-card-ph{width:100%;height:100%;display:grid;place-items:center;color:#2a2a2a;font-size:40px}
.ls-card-live{position:absolute;top:9px;left:9px;display:inline-flex;align-items:center;gap:4px;background:rgba(239,68,68,.9);color:#fff;padding:3px 8px;border-radius:20px;font:700 9px 'Poppins';letter-spacing:.08em}
.ls-card-live span{width:5px;height:5px;border-radius:50%;background:#fff;animation:lsdot 1.2s infinite}
.ls-card-viewers{position:absolute;top:9px;right:9px;display:inline-flex;align-items:center;gap:4px;background:rgba(0,0,0,.6);color:#fff;padding:3px 8px;border-radius:20px;font:600 10px 'Poppins';backdrop-filter:blur(4px)}
.ls-card-replay{position:absolute;top:9px;left:9px;display:inline-flex;align-items:center;gap:4px;background:rgba(0,0,0,.65);color:#c5a05a;padding:3px 8px;border-radius:20px;font:700 9px 'Poppins';letter-spacing:.06em;backdrop-filter:blur(4px)}
.ls-replays{max-width:1280px;margin:0 auto;padding:8px 24px 40px}
.ls-rep-head{display:flex;align-items:center;gap:8px;font:600 13px 'Poppins';color:#c5a05a;margin-bottom:16px;text-transform:uppercase;letter-spacing:.08em}
.ls-replays .ls-grid{padding:0}
.ls-card-info{padding:11px 13px}
.ls-card-title{font:600 13px 'Poppins';white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ls-card-host{font:400 11px 'Poppins';color:#8c8880;margin-top:3px}
.ls-skel{aspect-ratio:4/5;border-radius:14px;background:linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%);background-size:200% 100%;animation:lsshim 1.4s infinite}
@keyframes lsshim{to{background-position:-200% 0}}
.ls-empty{max-width:1280px;margin:40px auto;padding:48px 24px;text-align:center;color:#8c8880;font-size:14px}
.ls-cta{color:#c5a05a;text-decoration:none;font-weight:600}
.ls-disc{max-width:1280px;margin:0 auto;padding:20px 24px 48px;font-size:11px;color:#4c4a47;line-height:1.8;border-top:0.5px solid rgba(255,255,255,.05)}
.ls-disc a{color:inherit;text-decoration:underline;opacity:.7}
@media(max-width:640px){.ls-grid{grid-template-columns:repeat(2,1fr);gap:10px;padding:0 16px 40px}.ls-hero{padding:8px 16px 20px}}
`
