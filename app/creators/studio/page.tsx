'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

interface ExtLink { label: string; url: string }

export default function CreatorStudio() {
  const [me, setMe] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [posting, setPosting] = useState(false)
  const [postMsg, setPostMsg] = useState('')

  const [links, setLinks] = useState<ExtLink[]>([])
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkMsg, setLinkMsg] = useState('')

  const [myPosts, setMyPosts] = useState<any[]>([])
  const [gifts, setGifts] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login?next=/creators/studio'; return }
      setMe(session.user.id)
      setAuthChecked(true)
      const [{ data: prof }, { data: posts }, { data: giftData }] = await Promise.all([
        supabase.from('profiles').select('external_links').eq('id', session.user.id).maybeSingle(),
        supabase.from('creator_posts').select('id, caption, media_url, media_type, created_at').eq('creator_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('creator_gifts').select('id, amount_tokens, message, created_at, sender:sender_id(full_name, username)').eq('creator_id', session.user.id).order('created_at', { ascending: false }).limit(20),
      ])
      if (prof?.external_links && Array.isArray(prof.external_links)) setLinks(prof.external_links)
      setMyPosts(posts || [])
      setGifts(giftData || [])
    })()
  }, [])

  async function publish() {
    if (!caption.trim() && !file) { setPostMsg('Add a caption or media first.'); return }
    setPosting(true); setPostMsg('')
    try {
      const supabase = createClient()
      let mediaUrl: string | null = null
      let mediaType = 'image'
      if (file) {
        mediaType = file.type.startsWith('video') ? 'video' : 'image'
        const path = `creator-posts/${me}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`
        const { error: upErr } = await supabase.storage.from('listings').upload(path, file, { contentType: file.type, upsert: true })
        if (upErr) { setPostMsg(`Upload failed: ${upErr.message}`); setPosting(false); return }
        mediaUrl = supabase.storage.from('listings').getPublicUrl(path).data.publicUrl
      }
      const res = await fetch('/api/creators/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: caption.trim(), mediaUrl, mediaType }) })
      const json = await res.json()
      if (!res.ok) { setPostMsg(json.error || 'Failed to publish'); setPosting(false); return }
      setCaption(''); setFile(null); setPostMsg('Published ✓')
      const { data: posts } = await supabase.from('creator_posts').select('id, caption, media_url, media_type, created_at').eq('creator_id', me).order('created_at', { ascending: false })
      setMyPosts(posts || [])
    } catch { setPostMsg('Failed to publish') } finally { setPosting(false) }
  }

  async function deletePost(id: string) {
    try {
      await fetch(`/api/creators/posts?id=${id}`, { method: 'DELETE' })
      setMyPosts(prev => prev.filter(p => p.id !== id))
    } catch { /* ignore */ }
  }

  function addLink() {
    if (!linkUrl.trim()) return
    setLinks(prev => [...prev, { label: linkLabel.trim() || 'Link', url: linkUrl.trim() }])
    setLinkLabel(''); setLinkUrl('')
  }
  function removeLink(i: number) { setLinks(prev => prev.filter((_, idx) => idx !== i)) }

  async function saveLinks() {
    setLinkMsg('')
    try {
      const res = await fetch('/api/creators/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ links }) })
      const json = await res.json()
      if (!res.ok) { setLinkMsg(json.error || 'Failed to save'); return }
      setLinks(json.links || [])
      setLinkMsg('Saved ✓')
    } catch { setLinkMsg('Failed to save') }
  }

  const card: React.CSSProperties = { background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '14px', padding: '1.5rem' }
  const input: React.CSSProperties = { width: '100%', padding: '11px 13px', background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'var(--sans)' }

  if (!authChecked) return <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '58px', position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.96)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid var(--b)' }}>
        <Link href="/creators" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><i className="ti ti-arrow-left" /> Creators</Link>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--gold)', textDecoration: 'none' }}>Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em></Link>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1.5rem 5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '30px', fontWeight: 400, margin: '0 0 .4rem' }}>Creator Studio</h1>
          <p style={{ fontSize: '14px', color: 'var(--t3)', margin: 0 }}>Publish content, grow followers, and link your other platforms.</p>
        </div>

        {/* Compose */}
        <div style={card}>
          <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '12px' }}>New post</div>
          <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write a caption…" rows={3} style={{ ...input, resize: 'vertical', marginBottom: '12px' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--t2)', marginBottom: '14px', cursor: 'pointer' }}>
            <span style={{ padding: '8px 14px', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', background: 'var(--bg2)' }}><i className="ti ti-photo" /> {file ? 'Change media' : 'Add photo / video'}</span>
            <input type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            {file && <span style={{ color: 'var(--t3)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={publish} disabled={posting} style={{ padding: '11px 26px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', border: 'none', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '14px', fontWeight: 700, cursor: posting ? 'default' : 'pointer' }}>{posting ? 'Publishing…' : 'Publish'}</button>
            {postMsg && <span style={{ fontSize: '13px', color: postMsg.includes('✓') ? '#26d4a0' : '#e0607a' }}>{postMsg}</span>}
          </div>
        </div>

        {/* External links */}
        <div style={card}>
          <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '12px' }}>Your platform links</div>
          {links.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {links.map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--bg2)', borderRadius: 'var(--r)' }}>
                  <i className="ti ti-link" style={{ color: 'var(--gold)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>{l.label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{l.url}</span>
                  <button onClick={() => removeLink(i)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: '16px' }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <input value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="Label (e.g. OnlyFans)" style={{ ...input, flex: '1 1 130px' }} />
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://…" style={{ ...input, flex: '2 1 200px' }} />
            <button onClick={addLink} style={{ padding: '0 18px', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', background: 'var(--bg2)', color: 'var(--t)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Add</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={saveLinks} style={{ padding: '10px 22px', background: 'transparent', border: '0.5px solid rgba(197,160,90,0.4)', borderRadius: 'var(--r)', color: 'var(--gold)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Save links</button>
            {linkMsg && <span style={{ fontSize: '13px', color: linkMsg.includes('✓') ? '#26d4a0' : '#e0607a' }}>{linkMsg}</span>}
          </div>
        </div>

        {/* My posts */}
        {myPosts.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '12px' }}>Your posts ({myPosts.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myPosts.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'var(--bg2)', borderRadius: 'var(--r)' }}>
                  {p.media_url ? (
                    <div style={{ width: '46px', height: '46px', borderRadius: '8px', background: `url(${p.media_url}) center/cover`, flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '46px', height: '46px', borderRadius: '8px', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--t3)' }}><i className="ti ti-file-text" /></div>
                  )}
                  <span style={{ flex: 1, fontSize: '13px', color: 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.caption || '(no caption)'}</span>
                  <button onClick={() => deletePost(p.id)} style={{ background: 'none', border: '0.5px solid var(--b2)', borderRadius: '6px', color: 'var(--t3)', cursor: 'pointer', fontSize: '12px', padding: '5px 10px' }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gifts received */}
        <div style={card}>
          <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '12px' }}>Gifts received {gifts.length > 0 && `(${gifts.length})`}</div>
          {gifts.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--t3)', margin: 0 }}>No gifts yet — fans can send tokens from your posts.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gifts.map((g: any) => {
                const senderName = g.sender?.full_name || g.sender?.username || 'Anonymous'
                const d = new Date(g.created_at)
                return (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', background: 'var(--bg2)', borderRadius: 'var(--r)' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }}>✦</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t)' }}>{senderName} <span style={{ color: 'var(--gold)' }}>+{g.amount_tokens} tokens</span></div>
                      {g.message && <div style={{ fontSize: '12px', color: 'var(--t2)', marginTop: '3px', fontStyle: 'italic' }}>&ldquo;{g.message}&rdquo;</div>}
                      <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '4px' }}>{d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
