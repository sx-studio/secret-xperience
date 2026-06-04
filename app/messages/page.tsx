'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '../lib/supabase'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  listing_id: string | null
  body: string
  created_at: string
  read: boolean
}

interface Conversation {
  other_id: string
  other_name: string
  listing_id: string | null
  listing_title: string | null
  last_message: string
  last_at: string
  unread: number
}

export default function MessagesPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [ownName, setOwnName] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const activeConvRef = useRef<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toasts, setToasts] = useState<{ id: string; name: string; body: string; otherId: string }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function pushToast(name: string, body: string, otherId: string) {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, name, body, otherId }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
    // Browser notification (if permission already granted)
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      new Notification(`New message from ${name}`, { body, icon: '/favicon.ico', tag: otherId })
    }
  }

  // Sync activeConv to ref so realtime handler has a non-stale reference
  useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

  // Mobile panel: show/hide left vs right pane based on whether a conversation is active
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth > 640) return
    document.documentElement.style.setProperty('--conv-list-display', activeConv ? 'none' : 'flex')
    document.documentElement.style.setProperty('--thread-panel-display', activeConv ? 'flex' : 'none')
  }, [activeConv])

  useEffect(() => {
    let channel: any = null
    async function init() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      const uid = session.user.id
      setUserId(uid)

      const params = new URLSearchParams(window.location.search)
      const providerId = params.get('provider_id')
      const listingId = params.get('listing_id')
      const listingTitle = params.get('listing_title')
      const preset = params.get('preset')

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
        .order('created_at', { ascending: true })

      const allMsgs: Message[] = msgs || []

      const convMap = new Map<string, Conversation>()
      allMsgs.forEach(m => {
        const otherId = m.sender_id === uid ? m.receiver_id : m.sender_id
        const existing = convMap.get(otherId)
        const unread = !m.read && m.receiver_id === uid ? 1 : 0
        if (!existing || m.created_at > existing.last_at) {
          convMap.set(otherId, {
            other_id: otherId,
            other_name: 'Anonymous',
            listing_id: m.listing_id,
            listing_title: null,
            last_message: m.body,
            last_at: m.created_at,
            unread: (existing?.unread || 0) + unread,
          })
        } else if (unread) {
          existing.unread += 1
        }
      })

      // Fix 1: fetch profiles with email fallback; show "Anonymous" not UUID
      // Fetch own name for use in message notifications
      const { data: ownProfile } = await supabase.from('profiles').select('full_name, username').eq('id', uid).maybeSingle()
      setOwnName(ownProfile?.full_name || ownProfile?.username || null)

      const otherIds = [...convMap.keys()]
      if (otherIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username, email')
          .in('id', otherIds)
        profiles?.forEach(p => {
          const c = convMap.get(p.id)
          if (c) c.other_name = p.full_name || p.username || p.email || 'Anonymous'
        })
      }

      // Fix 6: fetch listing titles for all conversations that have a listing_id
      const listingIds = [...convMap.values()].map(c => c.listing_id).filter(Boolean) as string[]
      if (listingIds.length > 0) {
        const { data: listings } = await supabase
          .from('listings')
          .select('id, title')
          .in('id', listingIds)
        listings?.forEach(l => {
          convMap.forEach(c => {
            if (c.listing_id === l.id) c.listing_title = l.title
          })
        })
      }

      const convList = [...convMap.values()].sort((a, b) => b.last_at.localeCompare(a.last_at))
      setConversations(convList)

      if (providerId) {
        let conv = convList.find(c => c.other_id === providerId)
        if (!conv) {
          const { data: profile } = await supabase.from('profiles').select('full_name, username, email').eq('id', providerId).maybeSingle()
          conv = {
            other_id: providerId,
            other_name: profile?.full_name || profile?.username || profile?.email || 'Advertiser',
            listing_id: listingId || null,
            listing_title: listingTitle,
            last_message: '',
            last_at: new Date().toISOString(),
            unread: 0,
          }
          setConversations(prev => [conv!, ...prev])
        }
        setActiveConv(conv)
        const thread = allMsgs.filter(m =>
          (m.sender_id === uid && m.receiver_id === providerId) ||
          (m.sender_id === providerId && m.receiver_id === uid)
        )
        setMessages(thread)
        // Pre-fill message body when preset=book
        if (preset === 'book' && listingTitle) {
          setBody(`Hi, I'm interested in booking "${decodeURIComponent(listingTitle)}". Could you let me know your availability?`)
        }
        // Fix 2: mark messages as read when opening conversation
        await supabase.from('messages').update({ read: true }).eq('receiver_id', uid).eq('sender_id', providerId)
      } else if (convList.length > 0) {
        setActiveConv(convList[0])
        const thread = allMsgs.filter(m =>
          (m.sender_id === uid && m.receiver_id === convList[0].other_id) ||
          (m.sender_id === convList[0].other_id && m.receiver_id === uid)
        )
        setMessages(thread)
        // Fix 2: mark messages as read when opening conversation
        await supabase.from('messages').update({ read: true }).eq('receiver_id', uid).eq('sender_id', convList[0].other_id)
      }

      setLoading(false)

      // Request browser notification permission
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }

      channel = supabase.channel(`messages-${uid}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${uid}` }, (payload) => {
          const newMsg = payload.new as Message
          const isActive = activeConvRef.current?.other_id === newMsg.sender_id
          // Only inject into message thread if this is from the active conversation
          if (isActive) {
            setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
          }
          // Show toast + browser notification for messages not in the active thread
          if (!isActive) {
            setConversations(prev => {
              const sender = prev.find(c => c.other_id === newMsg.sender_id)
              pushToast(sender?.other_name || 'Someone', newMsg.body, newMsg.sender_id)
              return prev
            })
          }
          setConversations(prev => {
            const otherId = newMsg.sender_id
            const updated = prev.map(c => c.other_id === otherId ? { ...c, last_message: newMsg.body, last_at: newMsg.created_at, unread: activeConvRef.current?.other_id === otherId ? c.unread : c.unread + 1 } : c)
            if (!updated.find(c => c.other_id === otherId)) {
              updated.unshift({ other_id: otherId, other_name: 'Anonymous', listing_id: newMsg.listing_id, listing_title: null, last_message: newMsg.body, last_at: newMsg.created_at, unread: 1 })
            }
            return updated.sort((a, b) => b.last_at.localeCompare(a.last_at))
          })
        })
        .subscribe()
    }
    init()
    return () => { channel?.unsubscribe() }
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Fix 2: mark-as-read helper called when switching conversations
  async function openConversation(c: Conversation, _allMessages: Message[], uid: string) {
    setActiveConv(c)
    const supabase = createClient()
    const { data } = await supabase.from('messages').select('*').or(`sender_id.eq.${uid},receiver_id.eq.${uid}`).order('created_at', { ascending: true })
    setMessages((data || []).filter((m: Message) => (m.sender_id === uid && m.receiver_id === c.other_id) || (m.sender_id === c.other_id && m.receiver_id === uid)))
    setConversations(prev => prev.map(x => x.other_id === c.other_id ? { ...x, unread: 0 } : x))
    // Fix 2: mark received messages as read
    await supabase.from('messages').update({ read: true }).eq('receiver_id', uid).eq('sender_id', c.other_id)
  }

  async function sendMessage() {
    if (!body.trim() || !userId || !activeConv || sending) return
    setSending(true)
    const supabase = createClient()
    const optimistic: Message = { id: crypto.randomUUID(), sender_id: userId, receiver_id: activeConv.other_id, listing_id: activeConv.listing_id, body: body.trim(), created_at: new Date().toISOString(), read: false }
    setMessages(prev => [...prev, optimistic])
    setBody('')
    // Reset textarea height
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }
    await supabase.from('messages').insert({ sender_id: userId, receiver_id: activeConv.other_id, listing_id: activeConv.listing_id, body: optimistic.body })
    setSending(false)
    // Notify receiver by email (fire-and-forget)
    fetch('/api/messages/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: activeConv.other_id, sender_name: ownName || null, listing_title: activeConv.listing_title || null, listing_id: activeConv.listing_id }),
    }).catch(() => {})
    // Fix 3: update conversations list locally after send so sender sees the bump
    setConversations(prev => {
      const updated = prev.map(c => c.other_id === activeConv.other_id ? { ...c, last_message: optimistic.body, last_at: optimistic.created_at } : c)
      if (!updated.find(c => c.other_id === activeConv.other_id)) {
        updated.unshift({ ...activeConv, last_message: optimistic.body, last_at: optimistic.created_at })
      }
      return updated.sort((a, b) => b.last_at.localeCompare(a.last_at))
    })
  }

  // Fix 4: auto-resize textarea, capped at 120px
  function handleTextareaInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const fmt = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #050505)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3, #4c4a47)', fontFamily: 'var(--sans, sans-serif)', fontSize: '13px' }}>Loading messages…</div>
  )

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const hasAdvertiserParam = params.get('provider_id')

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - var(--nav-h, 60px))', overflow: 'hidden', fontFamily: 'var(--sans, "Poppins", sans-serif)', color: 'var(--t, #ece8e1)' }}>
      <style>{`
        
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(197,160,90,0.15); border-radius: 4px; }

        .msg-left-pane {
          width: 320px;
          flex-shrink: 0;
          border-right: 0.5px solid var(--b, rgba(255,255,255,0.06));
          overflow-y: auto;
          background: var(--bg, #050505);
          display: flex;
          flex-direction: column;
        }

        .msg-pane-header {
          height: 56px;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 0.5px solid var(--b, rgba(255,255,255,0.06));
          flex-shrink: 0;
        }
        .msg-pane-title {
          font-family: var(--serif, 'Cormorant Garamond', serif);
          font-size: 20px;
          font-weight: 400;
          color: var(--t, #ece8e1);
          letter-spacing: 0.01em;
        }
        .msg-back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 5px 12px 5px 8px;
          color: var(--t2, rgba(255,255,255,0.45));
          font: 400 12px var(--sans, 'Poppins', sans-serif);
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: border-color 0.15s, color 0.15s;
        }
        .msg-back-btn:hover { border-color: rgba(197,160,90,0.35); color: var(--gold, #c5a05a); }

        /* Toast notifications */
        .msg-toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }
        .msg-toast {
          background: var(--bg1, #1a1117);
          border: 0.5px solid rgba(197,160,90,0.3);
          border-radius: var(--rl, 13px);
          padding: 13px 15px;
          width: 300px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(197,160,90,0.08);
          pointer-events: all;
          cursor: pointer;
          animation: toastIn 0.25s ease;
          display: flex;
          gap: 11px;
          align-items: flex-start;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .msg-toast-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(197,160,90,0.12);
          border: 0.5px solid rgba(197,160,90,0.25);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--serif, 'Cormorant Garamond', serif);
          font-size: 15px;
          color: var(--gold, #c5a05a);
          flex-shrink: 0;
        }
        .msg-toast-name {
          font: 600 13px var(--sans, 'Poppins', sans-serif);
          color: var(--t, #ece8e1);
          margin-bottom: 3px;
        }
        .msg-toast-body {
          font: 400 12px var(--sans, 'Poppins', sans-serif);
          color: var(--t2, rgba(255,255,255,0.45));
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 210px;
        }
        .msg-toast-close {
          margin-left: auto;
          background: none; border: none;
          color: var(--t3, rgba(255,255,255,0.25));
          cursor: pointer; font-size: 14px;
          padding: 0; line-height: 1;
          flex-shrink: 0;
        }
        .msg-toast-close:hover { color: var(--t2, rgba(255,255,255,0.5)); }

        .msg-search-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .msg-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--t3, rgba(255,255,255,0.3));
          font-size: 15px;
          pointer-events: none;
        }
        .msg-search-input {
          width: 100%;
          height: 44px;
          padding: 0 14px 0 38px;
          background: var(--bg2, rgba(255,255,255,0.03));
          border: none;
          border-bottom: 0.5px solid var(--b, rgba(255,255,255,0.06));
          color: var(--t, #ece8e1);
          font: 400 13px var(--sans, 'Poppins', sans-serif);
          outline: none;
        }
        .msg-search-input::placeholder { color: var(--t3, rgba(255,255,255,0.3)); }

        .msg-thread-row {
          height: 72px;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          border-bottom: 0.5px solid var(--b, rgba(255,255,255,0.04));
          transition: background var(--t-fast, 0.15s);
          flex-shrink: 0;
        }
        .msg-thread-row:hover { background: var(--bg2, rgba(255,255,255,0.03)); }
        .msg-thread-row.active { background: var(--bg2, rgba(197,160,90,0.06)); border-left: 2px solid var(--gold, #c5a05a); }

        .msg-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--bg3, rgba(255,255,255,0.06));
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--t3, rgba(255,255,255,0.3));
          font: 500 16px var(--serif, 'Cormorant Garamond', serif);
        }

        .msg-unread-badge {
          background: var(--grad-gold, linear-gradient(135deg,#c5a05a,#a0803d));
          color: var(--t-on-gold, #080808);
          border-radius: 50%;
          min-width: 18px;
          height: 18px;
          font: 700 10px/18px var(--sans, 'Poppins', sans-serif);
          text-align: center;
          padding: 0 4px;
          flex-shrink: 0;
        }

        .msg-right-pane {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .msg-chat-header {
          height: 58px;
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 0.5px solid var(--b, rgba(255,255,255,0.06));
          flex-shrink: 0;
          background: var(--bg, #050505);
        }

        .msg-messages-list {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .msg-bubble-mine {
          align-self: flex-end;
          background: var(--grad-gold, linear-gradient(135deg,#c5a05a,#a0803d));
          color: var(--t-on-gold, #080808);
          border-radius: 14px 14px 4px 14px;
          padding: 10px 14px;
          max-width: 70%;
          font: 400 13px var(--sans, 'Poppins', sans-serif);
        }

        .msg-bubble-theirs {
          align-self: flex-start;
          background: var(--bg2, rgba(255,255,255,0.05));
          color: var(--t, #ece8e1);
          border-radius: 14px 14px 14px 4px;
          padding: 10px 14px;
          max-width: 70%;
          font: 400 13px var(--sans, 'Poppins', sans-serif);
        }

        .msg-composer {
          padding: 1rem 1.25rem;
          border-top: 0.5px solid var(--b, rgba(255,255,255,0.06));
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
          flex-shrink: 0;
          background: var(--bg, #050505);
        }

        .msg-compose-textarea {
          flex: 1;
          min-height: 44px;
          max-height: 120px;
          background: var(--bg2, rgba(255,255,255,0.04));
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          padding: 10px 14px;
          color: var(--t, #ece8e1);
          font: 400 13px var(--sans, 'Poppins', sans-serif);
          resize: none;
          outline: none;
          line-height: 1.5;
          overflow: hidden;
          transition: border-color var(--t-fast, 0.15s), box-shadow var(--t-fast, 0.15s);
        }
        .msg-compose-textarea::placeholder { color: var(--t3, rgba(255,255,255,0.3)); }
        .msg-compose-textarea:focus {
          border-color: var(--gold, rgba(197,160,90,0.5));
          box-shadow: 0 0 0 3px var(--gbg, rgba(197,160,90,0.06));
        }

        .msg-attach-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: transparent;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          color: var(--t3, rgba(255,255,255,0.3));
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          flex-shrink: 0;
          transition: border-color 0.2s, color 0.2s;
        }
        .msg-attach-btn:hover { border-color: var(--b3, rgba(255,255,255,0.2)); color: var(--t2, rgba(255,255,255,0.5)); }

        .msg-send-btn {
          width: 36px;
          height: 36px;
          background: var(--grad-gold, linear-gradient(135deg,#c5a05a,#a0803d));
          color: var(--t-on-gold, #080808);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-gold, 0 4px 16px rgba(197,160,90,0.25));
          cursor: pointer;
          font-size: 16px;
          flex-shrink: 0;
          transition: opacity 0.2s, transform 0.15s;
        }
        .msg-send-btn:disabled { opacity: 0.4; cursor: default; }
        .msg-send-btn:not(:disabled):hover { opacity: 0.88; transform: scale(1.05); }

        .msg-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-align: center;
          padding: 2rem;
        }

        @media (max-width: 640px) {
          .msg-left-pane { width: 100%; display: var(--conv-list-display, flex) !important; }
          .msg-right-pane { display: var(--thread-panel-display, none) !important; }
          .mobile-back-btn { display: inline-block !important; }
        }
      `}</style>

      {/* ── Toast notifications ── */}
      <div className="msg-toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className="msg-toast"
            onClick={() => {
              const conv = conversations.find(c => c.other_id === t.otherId)
              if (conv) openConversation(conv, messages, userId!)
              setToasts(prev => prev.filter(x => x.id !== t.id))
            }}
          >
            <div className="msg-toast-avatar">{t.name.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="msg-toast-name">{t.name}</div>
              <div className="msg-toast-body">{t.body}</div>
            </div>
            <button
              className="msg-toast-close"
              onClick={e => { e.stopPropagation(); setToasts(prev => prev.filter(x => x.id !== t.id)) }}
            >
              <i className="ti ti-x" />
            </button>
          </div>
        ))}
      </div>

      {/* ── Left pane (thread list) ── */}
      <div className="msg-left-pane">
        {/* Header with back button */}
        <div className="msg-pane-header">
          <span className="msg-pane-title">Messages</span>
          <button className="msg-back-btn" onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/dashboard'}>
            <i className="ti ti-arrow-left" style={{ fontSize: '14px' }} />
            Back
          </button>
        </div>

        {/* Search */}
        <div className="msg-search-wrap">
          <i className="ti ti-search msg-search-icon" />
          <input
            className="msg-search-input"
            placeholder="Search conversations…"
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Fix 5: empty state onboarding */}
        {conversations.length === 0 && !hasAdvertiserParam ? (
          <div className="msg-empty-state">
            <i className="ti ti-message-circle" style={{ fontSize: '48px', color: 'var(--t3, rgba(255,255,255,0.2))' }} />
            <div style={{ fontFamily: 'var(--serif, "Cormorant Garamond", serif)', fontSize: '22px', color: 'var(--t, #ece8e1)' }}>No conversations yet</div>
            <div style={{ fontSize: '13px', color: 'var(--t2, rgba(255,255,255,0.4))', lineHeight: 1.6 }}>Browse advertisements and message a advertiser to get started</div>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                marginTop: '0.5rem', padding: '9px 20px',
                background: 'var(--grad-gold, linear-gradient(135deg,#c5a05a,#a0803d))',
                border: 'none', borderRadius: 'var(--r, 8px)',
                color: 'var(--t-on-gold, #080808)', fontWeight: 600, fontSize: '13px',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Browse Listings
            </button>
          </div>
        ) : (
          conversations.filter(c => {
            if (!searchQuery.trim()) return true
            const q = searchQuery.toLowerCase()
            return (c.other_name || '').toLowerCase().includes(q) ||
                   (c.last_message || '').toLowerCase().includes(q) ||
                   (c.listing_title || '').toLowerCase().includes(q)
          }).map(c => (
            <div
              key={c.other_id}
              className={`msg-thread-row${activeConv?.other_id === c.other_id ? ' active' : ''}`}
              onClick={() => openConversation(c, messages, userId!)}
            >
              {/* Avatar */}
              <div className="msg-avatar">
                {c.other_name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <div style={{
                    fontFamily: 'var(--serif, "Cormorant Garamond", serif)',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: 'var(--t, #ece8e1)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {c.other_name}
                  </div>
                  <div style={{
                    font: '400 11px var(--sans, "Poppins", sans-serif)',
                    color: 'var(--t3, rgba(255,255,255,0.3))',
                    flexShrink: 0,
                    marginLeft: '8px',
                  }}>
                    {fmt(c.last_at)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--t2, rgba(255,255,255,0.4))',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    {c.listing_title ? (
                      <span style={{ color: 'var(--gold, #c5a05a)' }}>{c.listing_title} · </span>
                    ) : null}
                    {c.last_message}
                  </div>
                  {c.unread > 0 && (
                    <span className="msg-unread-badge">{c.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Right pane (chat) ── */}
      <div className="msg-right-pane">
        {!activeConv ? (
          <div className="msg-empty-state">
            <i className="ti ti-message-circle" style={{ fontSize: '48px', color: 'var(--t3, rgba(255,255,255,0.2))' }} />
            <div style={{
              fontFamily: 'var(--serif, "Cormorant Garamond", serif)',
              fontSize: '22px',
              color: 'var(--t, #ece8e1)',
            }}>
              No conversations yet
            </div>
            <div style={{ fontSize: '13px', color: 'var(--t2, rgba(255,255,255,0.4))' }}>
              Messages from advertisers will appear here.
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="msg-chat-header">
              {/* Mobile back button */}
              <button
                onClick={() => setActiveConv(null)}
                aria-label="Back to conversations"
                style={{
                  background: 'none', border: 'none', color: 'var(--t3, rgba(255,255,255,0.4))',
                  cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0, display: 'none',
                }}
                className="mobile-back-btn"
              >←</button>

              {/* Avatar */}
              <div className="msg-avatar" style={{ width: 36, height: 36, fontSize: '14px' }}>
                {activeConv.other_name.charAt(0).toUpperCase()}
              </div>

              {/* Name + listing */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--serif, "Cormorant Garamond", serif)',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: 'var(--t, #ece8e1)',
                }}>
                  {activeConv.other_name}
                  {/* Verified badge placeholder */}
                </div>
                {activeConv.listing_title && (
                  <div style={{ fontSize: '12px', color: 'var(--gold, #c5a05a)', marginTop: '1px' }}>
                    {activeConv.listing_title}
                  </div>
                )}
              </div>

              {/* Menu icon */}
              <button style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--t3, rgba(255,255,255,0.3))', fontSize: '20px',
                display: 'flex', alignItems: 'center',
              }}>
                <i className="ti ti-dots-vertical" />
              </button>
            </div>

            {/* Messages list */}
            <div className="msg-messages-list">
              {messages.length === 0 && (
                <div style={{ color: 'var(--t3, rgba(255,255,255,0.3))', fontSize: '13px', textAlign: 'center', marginTop: '2rem' }}>
                  No messages yet. Say hello!
                </div>
              )}
              {messages.map(m => {
                const mine = m.sender_id === userId
                return (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className={mine ? 'msg-bubble-mine' : 'msg-bubble-theirs'}>
                      <div style={{ lineHeight: 1.5 }}>{m.body}</div>
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--t3, rgba(255,255,255,0.3))',
                      marginTop: '4px',
                      textAlign: mine ? 'right' : 'left',
                      font: '400 11px var(--sans, "Poppins", sans-serif)',
                    }}>
                      {fmt(m.created_at)}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className="msg-composer">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                className="msg-compose-textarea"
                value={body}
                onChange={e => setBody(e.target.value)}
                onInput={handleTextareaInput}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Type a message…"
                rows={1}
              />

              {/* Send button */}
              <button
                className="msg-send-btn"
                onClick={sendMessage}
                disabled={!body.trim() || sending}
                aria-label="Send message"
              >
                <i className="ti ti-send" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
