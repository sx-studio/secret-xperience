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
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
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
          const { data: profile } = await supabase.from('profiles').select('full_name, username, email').eq('id', providerId).single()
          conv = {
            other_id: providerId,
            other_name: profile?.full_name || profile?.username || profile?.email || 'Provider',
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

      supabase.channel(`messages-${uid}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${uid}` }, (payload) => {
          const newMsg = payload.new as Message
          setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
          setConversations(prev => {
            const otherId = newMsg.sender_id
            const updated = prev.map(c => c.other_id === otherId ? { ...c, last_message: newMsg.body, last_at: newMsg.created_at, unread: c.unread + 1 } : c)
            if (!updated.find(c => c.other_id === otherId)) {
              updated.unshift({ other_id: otherId, other_name: 'Anonymous', listing_id: newMsg.listing_id, listing_title: null, last_message: newMsg.body, last_at: newMsg.created_at, unread: 1 })
            }
            return updated.sort((a, b) => b.last_at.localeCompare(a.last_at))
          })
        })
        .subscribe()
    }
    init()
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
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4c4a47', fontFamily: 'sans-serif', fontSize: '13px' }}>Loading messages…</div>
  )

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const hasProviderParam = params.get('provider_id')

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#ece8e1', fontFamily: "'Jost', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Jost:wght@300;400;500&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(197,160,90,0.15);border-radius:4px}@media(max-width:640px){.conv-list{width:100%!important;display:var(--conv-list-display,flex)!important;flex-direction:column}.thread-panel{display:var(--thread-panel-display,none)!important}}`}</style>
      <nav style={{ background: '#080808', borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <button onClick={() => window.location.href = '/'} style={{ background: 'none', border: 'none', color: '#4c4a47', cursor: 'pointer', fontSize: '18px' }}>←</button>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c5a05a', fontSize: '18px' }}>Messages</span>
      </nav>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Conversation list — hidden on mobile when a thread is open */}
        <div
          className="conv-list"
          style={{
            width: '280px',
            borderRight: '0.5px solid rgba(255,255,255,0.06)',
            overflowY: 'auto',
            flexShrink: 0,
            display: activeConv ? undefined : 'flex',
            flexDirection: 'column' as const,
          }}
        >
          {/* Fix 5: empty state onboarding */}
          {conversations.length === 0 && !hasProviderParam ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', textAlign: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '36px', color: '#c5a05a', lineHeight: 1 }}>✉</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: '#ece8e1' }}>No conversations yet</div>
              <div style={{ fontSize: '12px', color: '#4c4a47', lineHeight: 1.6 }}>Browse listings and message a provider to get started</div>
              <button onClick={() => window.location.href = '/'} style={{ marginTop: '0.5rem', padding: '9px 20px', background: '#c5a05a', border: 'none', borderRadius: '8px', color: '#080808', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Browse Listings</button>
            </div>
          ) : (
            conversations.map(c => (
              <div key={c.other_id} onClick={() => openConversation(c, messages, userId!)}
                style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: activeConv?.other_id === c.other_id ? 'rgba(197,160,90,0.06)' : 'transparent', borderLeft: activeConv?.other_id === c.other_id ? '2px solid #c5a05a' : '2px solid transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{c.other_name}</div>
                  {c.unread > 0 && <span style={{ background: '#c5a05a', color: '#080808', borderRadius: '20px', padding: '1px 7px', fontSize: '10px', fontWeight: 700 }}>{c.unread}</span>}
                </div>
                {c.listing_title && <div style={{ fontSize: '10px', color: '#c5a05a', marginBottom: '3px' }}>{c.listing_title}</div>}
                <div style={{ fontSize: '12px', color: '#4c4a47', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last_message}</div>
              </div>
            ))
          )}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4c4a47', fontSize: '13px' }}>Select a conversation</div>
          ) : (
            <>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: '#080808', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Fix 7: mobile back button */}
                <button
                  onClick={() => setActiveConv(null)}
                  aria-label="Back to conversations"
                  style={{ background: 'none', border: 'none', color: '#4c4a47', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0, display: 'none' }}
                  className="mobile-back-btn"
                >←</button>
                <style>{`@media(max-width:640px){.mobile-back-btn{display:inline-block!important}}`}</style>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{activeConv.other_name}</div>
                  {activeConv.listing_title && <div style={{ fontSize: '11px', color: '#c5a05a', marginTop: '2px' }}>{activeConv.listing_title}</div>}
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.length === 0 && <div style={{ color: '#4c4a47', fontSize: '13px', textAlign: 'center', marginTop: '2rem' }}>No messages yet. Say hello!</div>}
                {messages.map(m => {
                  const mine = m.sender_id === userId
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '65%', background: mine ? 'rgba(197,160,90,0.15)' : 'rgba(255,255,255,0.05)', border: mine ? '0.5px solid rgba(197,160,90,0.3)' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px' }}>
                        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{m.body}</div>
                        <div style={{ fontSize: '10px', color: '#4c4a47', marginTop: '4px', textAlign: 'right' }}>{fmt(m.created_at)}</div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid rgba(255,255,255,0.06)', background: '#080808', display: 'flex', gap: '10px', alignItems: 'flex-end', flexShrink: 0 }}>
                {/* Fix 4: auto-resize textarea */}
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  onInput={handleTextareaInput}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Type a message…"
                  rows={1}
                  style={{ flex: 1, background: '#111', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#ece8e1', fontSize: '13px', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, outline: 'none', overflow: 'hidden' }}
                />
                <button onClick={sendMessage} disabled={!body.trim() || sending} style={{ padding: '10px 18px', background: body.trim() ? '#c5a05a' : '#222', border: 'none', borderRadius: '10px', color: body.trim() ? '#080808' : '#4c4a47', cursor: body.trim() ? 'pointer' : 'default', fontWeight: 600, fontSize: '13px', flexShrink: 0 }}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
