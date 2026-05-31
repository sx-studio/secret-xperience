'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

export interface Post {
  id: string
  caption: string | null
  media_url: string | null
  media_type: string
  created_at: string
  creator: {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
    verified: boolean
    external_links: { label: string; url: string }[] | null
  } | null
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function PostCard({ post, me, follows, onFollow }: { post: Post; me: string | null; follows: Set<string>; onFollow: (id: string) => void }) {
  const c = post.creator
  if (!c) return null
  const name = c.full_name || c.username || 'Creator'
  const following = follows.has(c.id)
  const isSelf = me === c.id
  const links = Array.isArray(c.external_links) ? c.external_links : []

  return (
    <article style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '14px', overflow: 'hidden' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px' }}>
        <Link href={`/profile/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flex: 1, minWidth: 0 }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, background: c.avatar_url ? `url(${c.avatar_url}) center/cover` : 'linear-gradient(135deg,var(--gold),var(--goldd))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a', fontWeight: 700, fontSize: '14px' }}>
            {!c.avatar_url && name.slice(0, 1).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {name} {c.verified && <i className="ti ti-rosette-discount-check-filled" style={{ color: 'var(--gold)', fontSize: '14px' }} />}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{timeAgo(post.created_at)}</div>
          </div>
        </Link>
        {!isSelf && me && (
          <button onClick={() => onFollow(c.id)} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: following ? '0.5px solid var(--b2)' : 'none', background: following ? 'transparent' : 'linear-gradient(135deg,var(--gold),var(--goldd))', color: following ? 'var(--t2)' : '#0a0a0a' }}>
            {following ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* media */}
      {post.media_url && (
        post.media_type === 'video' ? (
          <video src={post.media_url} controls style={{ width: '100%', maxHeight: '520px', background: '#000', display: 'block' }} />
        ) : (
          <img src={post.media_url} alt="" style={{ width: '100%', maxHeight: '560px', objectFit: 'cover', display: 'block' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
        )
      )}

      {/* body */}
      <div style={{ padding: '12px 14px 14px' }}>
        {post.caption && <p style={{ fontSize: '14px', color: 'var(--t)', lineHeight: 1.6, margin: '0 0 10px' }}>{post.caption}</p>}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {me && !isSelf && (
            <Link href={`/messages?provider_id=${c.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '20px', border: '0.5px solid var(--b2)', color: 'var(--t2)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
              <i className="ti ti-message-circle" /> Live chat
            </Link>
          )}
          {links.slice(0, 3).map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '20px', border: '0.5px solid rgba(197,160,90,0.3)', color: 'var(--gold)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
              <i className="ti ti-external-link" /> {l.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function CreatorFeed({ posts }: { posts: Post[] }) {
  const [me, setMe] = useState<string | null>(null)
  const [follows, setFollows] = useState<Set<string>>(new Set())

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        setMe(session.user.id)
        const { data } = await supabase.from('creator_follows').select('creator_id').eq('follower_id', session.user.id)
        setFollows(new Set((data || []).map((r: any) => r.creator_id)))
      } catch { /* ignore */ }
    })()
  }, [])

  async function onFollow(creatorId: string) {
    if (!me) { window.location.href = '/login?next=/creators'; return }
    // optimistic
    setFollows(prev => { const n = new Set(prev); n.has(creatorId) ? n.delete(creatorId) : n.add(creatorId); return n })
    try {
      const res = await fetch('/api/creators/follow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creatorId }) })
      if (!res.ok) throw new Error()
    } catch {
      // revert on failure
      setFollows(prev => { const n = new Set(prev); n.has(creatorId) ? n.delete(creatorId) : n.add(creatorId); return n })
    }
  }

  if (posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3.5rem 2rem', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '14px' }}>
        <div style={{ fontSize: '34px', marginBottom: '0.75rem' }}>✦</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '22px', marginBottom: '0.5rem' }}>No content yet</div>
        <p style={{ fontSize: '14px', color: 'var(--t3)', maxWidth: '360px', margin: '0 auto 1.5rem', lineHeight: 1.7 }}>
          Be the first creator to publish. Share photos and videos, build followers, and link your other platforms.
        </p>
        <Link href="/creators/studio" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 26px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
          Open Creator Studio →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '620px', margin: '0 auto' }}>
      {posts.map(p => <PostCard key={p.id} post={p} me={me} follows={follows} onFollow={onFollow} />)}
    </div>
  )
}
