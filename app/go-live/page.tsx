'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '../lib/supabase'

type Gate = 'loading' | 'verified' | 'pending' | 'rejected' | 'none' | 'anon'
type Phase = 'setup' | 'connecting' | 'live'
interface ChatMsg { id: string; username: string; body: string; is_tip?: boolean; tip_amount?: number | null }

export default function GoLivePage() {
  const [gate, setGate] = useState<Gate>('loading')
  const [me, setMe] = useState<{ id: string; name: string } | null>(null)
  const [phase, setPhase] = useState<Phase>('setup')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [viewers, setViewers] = useState(0)
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')

  const videoRef   = useRef<HTMLVideoElement>(null)
  const roomRef    = useRef<any>(null)
  const streamId   = useRef<string | null>(null)
  const previewStream = useRef<MediaStream | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ── Auth + verification gate ──────────────────────────────
  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setGate('anon'); return }
      const { data: prof } = await supabase
        .from('profiles').select('verified, role, full_name, username').eq('id', session.user.id).maybeSingle()
      setMe({ id: session.user.id, name: prof?.full_name || prof?.username || 'Host' })
      if (prof?.verified === true || prof?.role === 'admin') { setGate('verified'); return }
      const { data: verif } = await supabase
        .from('identity_verifications').select('status').eq('user_id', session.user.id).maybeSingle()
      setGate(verif?.status === 'approved' ? 'verified'
        : verif?.status === 'pending' ? 'pending'
        : verif?.status === 'rejected' ? 'rejected' : 'none')
    })()
  }, [])

  // ── Camera preview during setup ───────────────────────────
  useEffect(() => {
    if (gate !== 'verified' || phase !== 'setup') return
    let cancelled = false
    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        previewStream.current = stream
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.muted = true; videoRef.current.play().catch(() => {}) }
      })
      .catch(() => setError('Camera/microphone access was blocked. Allow access in your browser to go live.'))
    return () => {
      cancelled = true
      previewStream.current?.getTracks().forEach(t => t.stop())
    }
  }, [gate, phase])

  const scrollChat = useCallback(() => {
    requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }, [])

  // ── Go live ───────────────────────────────────────────────
  async function goLive() {
    setError(''); setPhase('connecting')
    try {
      const res = await fetch('/api/live/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() || 'Live Show' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not start the stream.')
        setPhase('setup'); return
      }
      streamId.current = data.streamId
      setRecording(!!data.recording)

      const { Room, RoomEvent } = await import('livekit-client')
      const room = new Room({ adaptiveStream: true, dynacast: true })
      roomRef.current = room

      room.on(RoomEvent.ParticipantConnected, () => setViewers(room.numParticipants))
      room.on(RoomEvent.ParticipantDisconnected, () => setViewers(room.numParticipants))

      await room.connect(data.url, data.token)
      // Publish the existing preview tracks so there's no second permission prompt.
      const ms = previewStream.current
      if (ms) {
        for (const track of ms.getTracks()) {
          await room.localParticipant.publishTrack(track)
        }
      } else {
        await room.localParticipant.enableCameraAndMicrophone()
        const camPub = room.localParticipant.getTrackPublication('camera' as any)
        const mt = camPub?.track?.mediaStreamTrack
        if (mt && videoRef.current) videoRef.current.srcObject = new MediaStream([mt])
      }
      setViewers(room.numParticipants)
      setPhase('live')
      subscribeChat()
    } catch (e) {
      setError('Connection failed: ' + (e as Error).message)
      setPhase('setup')
    }
  }

  // ── Live timer + viewer heartbeat ─────────────────────────
  useEffect(() => {
    if (phase !== 'live') return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    const hb = setInterval(() => {
      if (streamId.current && roomRef.current) {
        fetch('/api/live/heartbeat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamId: streamId.current, viewers: roomRef.current.numParticipants }),
        }).catch(() => {})
      }
    }, 15000)
    return () => { clearInterval(t); clearInterval(hb) }
  }, [phase])

  // ── Chat (Supabase Realtime) ──────────────────────────────
  function subscribeChat() {
    if (!streamId.current) return
    const supabase = createClient()
    supabase.from('live_chat_messages')
      .select('id, username, body, is_tip, tip_amount')
      .eq('stream_id', streamId.current).order('created_at', { ascending: true }).limit(100)
      .then(({ data }) => { setMessages(data || []); scrollChat() })
    supabase.channel(`live_chat_${streamId.current}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_chat_messages', filter: `stream_id=eq.${streamId.current}` },
        payload => { setMessages(prev => [...prev, payload.new as ChatMsg]); scrollChat() })
      .subscribe()
  }

  async function sendChat() {
    const body = chatInput.trim()
    if (!body || !streamId.current || !me) return
    setChatInput('')
    const supabase = createClient()
    await supabase.from('live_chat_messages').insert({
      stream_id: streamId.current, user_id: me.id, username: me.name, body,
    })
  }

  // ── End stream ────────────────────────────────────────────
  async function endStream() {
    if (!confirm('End your live stream?')) return
    try { roomRef.current?.disconnect() } catch {}
    previewStream.current?.getTracks().forEach(t => t.stop())
    if (streamId.current) {
      await fetch('/api/live/stop', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId: streamId.current }),
      }).catch(() => {})
    }
    window.location.href = '/livestreams'
  }

  useEffect(() => () => { roomRef.current?.disconnect?.() }, [])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // ── Gate screens ──────────────────────────────────────────
  if (gate === 'loading') return <Centered><div className="gl-spin" /></Centered>
  if (gate === 'anon') { if (typeof window !== 'undefined') window.location.href = '/login?next=/go-live'; return null }
  if (gate !== 'verified') {
    const copy = {
      none:     { icon: 'ti-id-badge-2', title: 'Verify to go live', body: 'All performers must confirm their identity and age before broadcasting. It takes about two minutes.', cta: 'Verify my identity', href: '/verify' },
      pending:  { icon: 'ti-clock-hour-4', title: 'Verification in review', body: 'We have your documents and are reviewing them. You can go live as soon as you are approved.', cta: 'Check status', href: '/verify' },
      rejected: { icon: 'ti-alert-triangle', title: 'Verification needed', body: 'We could not verify your last submission. Please resubmit clearer documents.', cta: 'Resubmit', href: '/verify' },
    }[gate]!
    return (
      <Centered>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(197,160,90,0.12)', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem' }}>
            <i className={`ti ${copy.icon}`} style={{ fontSize: 30, color: '#c5a05a' }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 400, marginBottom: '0.75rem' }}>{copy.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: '2rem' }}>{copy.body}</p>
          <a href={copy.href} style={{ display: 'inline-block', padding: '13px 30px', background: 'linear-gradient(90deg,#c5a05a,#e8c97a)', borderRadius: 12, color: '#0a0a0a', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>{copy.cta} →</a>
        </div>
      </Centered>
    )
  }

  // ── Studio ────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="gl">
        <a href="/livestreams" className="gl-back"><i className="ti ti-arrow-left" /> Live shows</a>

        <div className="gl-stage">
          <div className="gl-video-wrap">
            <video ref={videoRef} className="gl-video" autoPlay playsInline muted />
            {phase === 'live' && (
              <div className="gl-overlay">
                <div className="gl-live-badge"><span className="gl-dot" /> LIVE · {fmt(elapsed)}</div>
                <div className="gl-stat"><i className="ti ti-eye" /> {viewers}</div>
                {recording && <div className="gl-rec"><span className="gl-recdot" /> REC</div>}
              </div>
            )}
            {phase === 'connecting' && <div className="gl-connecting"><div className="gl-spin" /> Going live…</div>}
          </div>

          {phase !== 'live' ? (
            <div className="gl-setup">
              <h1 className="gl-h1">Go <em>Live</em></h1>
              <p className="gl-sub">Broadcast straight from your camera. Viewers can watch and chat in real time.</p>
              <label className="gl-label">Stream title</label>
              <input className="gl-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Friday night with Mia" maxLength={80} />
              {error && <div className="gl-err">{error}</div>}
              <button className="gl-golive" onClick={goLive} disabled={phase === 'connecting'}>
                <i className="ti ti-broadcast" /> {phase === 'connecting' ? 'Connecting…' : 'Go Live Now'}
              </button>
              <p className="gl-note">By going live you confirm you are 18+, the performer shown, and agree to our <a href="/terms">Terms</a>.</p>
            </div>
          ) : (
            <div className="gl-chatbox">
              <div className="gl-chat-head"><i className="ti ti-message-circle" /> Live chat · {viewers} watching</div>
              <div className="gl-chat-scroll">
                {messages.length === 0 && <div className="gl-chat-empty">No messages yet. Say hi to your viewers!</div>}
                {messages.map(m => (
                  <div key={m.id} className={`gl-msg${m.is_tip ? ' gl-msg-tip' : ''}`}>
                    <span className="gl-msg-user">{m.username}</span>
                    {m.is_tip ? <span className="gl-msg-tipamt"><i className="ti ti-coins" /> {m.tip_amount}</span> : null}
                    <span className="gl-msg-body">{m.body}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="gl-chat-input">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Message your viewers…" maxLength={300} />
                <button onClick={sendChat}><i className="ti ti-send" /></button>
              </div>
              <button className="gl-end" onClick={endStream}><i className="ti ti-player-stop" /> End Stream</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: '100vh', background: '#050505', display: 'grid', placeItems: 'center', padding: 24 }}>{children}</div>
    </>
  )
}

const styles = `
*{box-sizing:border-box}
.gl{min-height:100vh;background:#050505;color:#ece8e1;font-family:'Poppins',sans-serif;padding:14px 24px 48px}
.gl-back{display:inline-flex;align-items:center;gap:6px;color:#8c8880;font:400 13px 'Poppins';text-decoration:none;transition:color .2s}
.gl-back:hover{color:#ece8e1}
.gl-stage{max-width:1180px;margin:18px auto 0;display:grid;grid-template-columns:1fr 360px;gap:20px;align-items:start}
.gl-video-wrap{position:relative;background:#0c0c0c;border-radius:16px;overflow:hidden;aspect-ratio:16/10;border:0.5px solid rgba(255,255,255,.08)}
.gl-video{width:100%;height:100%;object-fit:cover;background:#000;transform:scaleX(-1)}
.gl-overlay{position:absolute;top:12px;left:12px;right:12px;display:flex;gap:8px;align-items:center}
.gl-live-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(239,68,68,.92);color:#fff;padding:5px 11px;border-radius:20px;font:700 11px 'Poppins';letter-spacing:.06em}
.gl-dot{width:7px;height:7px;border-radius:50%;background:#fff;animation:gldot 1.3s infinite}
.gl-recdot{width:7px;height:7px;border-radius:50%;background:#fff;animation:gldot 1s infinite}
@keyframes gldot{0%,100%{opacity:1}50%{opacity:.25}}
.gl-stat{display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,.55);color:#fff;padding:5px 10px;border-radius:20px;font:600 12px 'Poppins';backdrop-filter:blur(6px)}
.gl-rec{display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,.55);color:#ef4444;padding:5px 10px;border-radius:20px;font:700 11px 'Poppins';margin-left:auto}
.gl-connecting{position:absolute;inset:0;display:flex;flex-direction:column;gap:14px;align-items:center;justify-content:center;background:rgba(0,0,0,.5);color:#fff;font:500 14px 'Poppins'}
.gl-setup{background:#0c0c0c;border:0.5px solid rgba(255,255,255,.08);border-radius:16px;padding:28px}
.gl-h1{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:400;line-height:1.05;margin-bottom:6px}
.gl-h1 em{font-style:italic;background:linear-gradient(90deg,#c5a05a,#e8cc88);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.gl-sub{color:#8c8880;font-size:13px;line-height:1.6;margin-bottom:22px}
.gl-label{display:block;font:600 10px 'Poppins';letter-spacing:.12em;text-transform:uppercase;color:#4c4a47;margin-bottom:8px}
.gl-input{width:100%;background:rgba(255,255,255,.03);border:0.5px solid rgba(255,255,255,.12);border-radius:10px;color:#ece8e1;padding:12px 14px;font:400 14px 'Poppins';outline:none;margin-bottom:18px}
.gl-input:focus{border-color:rgba(197,160,90,.5)}
.gl-golive{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(90deg,#ef4444,#f87171);color:#fff;border:none;border-radius:12px;padding:15px;font:700 15px 'Poppins';cursor:pointer;transition:transform .15s,filter .15s}
.gl-golive:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.06)}
.gl-golive:disabled{opacity:.6;cursor:default}
.gl-note{color:#4c4a47;font-size:11px;line-height:1.6;margin-top:14px}
.gl-note a{color:#8c8880}
.gl-err{background:rgba(239,68,68,.1);border:0.5px solid rgba(239,68,68,.3);color:#f87171;padding:10px 12px;border-radius:9px;font-size:12.5px;margin-bottom:16px}
.gl-chatbox{background:#0c0c0c;border:0.5px solid rgba(255,255,255,.08);border-radius:16px;display:flex;flex-direction:column;height:560px;overflow:hidden}
.gl-chat-head{padding:14px 16px;border-bottom:0.5px solid rgba(255,255,255,.06);font:600 12px 'Poppins';color:#c5a05a;display:flex;align-items:center;gap:7px}
.gl-chat-scroll{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:9px}
.gl-chat-empty{color:#4c4a47;font-size:12.5px;text-align:center;margin:auto 0}
.gl-msg{font-size:13px;line-height:1.45}
.gl-msg-user{color:#c5a05a;font-weight:600;margin-right:6px}
.gl-msg-body{color:#d8d4cc}
.gl-msg-tip{background:rgba(197,160,90,.1);border-radius:8px;padding:6px 8px}
.gl-msg-tipamt{color:#e8cc88;font-weight:700;margin-right:6px}
.gl-chat-input{display:flex;gap:8px;padding:12px;border-top:0.5px solid rgba(255,255,255,.06)}
.gl-chat-input input{flex:1;background:rgba(255,255,255,.04);border:0.5px solid rgba(255,255,255,.1);border-radius:9px;color:#ece8e1;padding:9px 12px;font:400 13px 'Poppins';outline:none}
.gl-chat-input button{background:#c5a05a;border:none;border-radius:9px;color:#050505;width:40px;cursor:pointer;font-size:15px}
.gl-end{margin:0 12px 12px;background:rgba(239,68,68,.12);border:0.5px solid rgba(239,68,68,.3);color:#ef4444;border-radius:10px;padding:11px;font:700 13px 'Poppins';cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px}
.gl-end:hover{background:rgba(239,68,68,.2)}
.gl-spin{width:32px;height:32px;border:2.5px solid rgba(197,160,90,.2);border-top-color:#c5a05a;border-radius:50%;animation:glspin .8s linear infinite}
@keyframes glspin{to{transform:rotate(360deg)}}
@media(max-width:820px){.gl-stage{grid-template-columns:1fr}.gl-chatbox{height:420px}}
`
