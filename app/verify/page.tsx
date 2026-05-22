'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '../lib/supabase'

const S = {
  bg: '#080808', bg2: '#0e0c18', t: '#e8e0d0', t2: '#888', t3: '#444',
  gold: '#c5a05a', green: '#1dc98f', red: '#e05a5a',
  serif: "'Cormorant Garamond', serif", sans: "'Jost', sans-serif",
}

type VerifStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected'

const STATUS_CONFIG: Record<VerifStatus, { label: string; color: string; icon: string; desc: string }> = {
  not_submitted: { label: 'Not submitted',  color: S.t3,    icon: '○', desc: 'Submit your ID and selfie to unlock listing.' },
  pending:       { label: 'Under review',   color: S.gold,  icon: '◌', desc: 'We\'ll review your documents within 24–48 hours.' },
  approved:      { label: 'Verified',       color: S.green, icon: '✓', desc: 'Your identity is verified. You can publish listings.' },
  rejected:      { label: 'Rejected',       color: S.red,   icon: '✕', desc: 'Your submission was rejected. Please re-submit with clearer documents.' },
}

export default function VerifyPage() {
  const [status,    setStatus]    = useState<VerifStatus>('not_submitted')
  const [session,   setSession]   = useState<any>(null)
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState('')

  const frontRef  = useRef<HTMLInputElement>(null)
  const backRef   = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  const [frontFile,  setFrontFile]  = useState<File | null>(null)
  const [backFile,   setBackFile]   = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)

  const [frontPreview,  setFrontPreview]  = useState<string | null>(null)
  const [backPreview,   setBackPreview]   = useState<string | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/login?next=/verify'; return }
      setSession(session)
      supabase.from('identity_verifications').select('status').eq('user_id', session.user.id).maybeSingle()
        .then(({ data }) => { if (data?.status) setStatus(data.status as VerifStatus) })
    })
  }, [])

  function handleFile(file: File, setter: (f: File) => void, previewSetter: (s: string) => void) {
    setter(file)
    const reader = new FileReader()
    reader.onload = e => previewSetter(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!frontFile || !selfieFile) { setError('Front of ID and selfie are required.'); return }
    if (!session) { window.location.href = '/login?next=/verify'; return }
    setLoading(true); setError('')

    try {
      const supabase = createClient()
      const uid = session.user.id
      const prefix = `${uid}/${Date.now()}`
      const bucket = 'identity-docs'

      async function uploadToStorage(file: File, name: string): Promise<string> {
        const { error } = await supabase.storage.from(bucket).upload(
          `${prefix}/${name}`, file, { contentType: file.type, upsert: true }
        )
        if (error) throw new Error(`Upload failed (${name}): ${error.message}`)
        return `${prefix}/${name}`
      }

      const frontPath  = await uploadToStorage(frontFile, 'doc_front')
      const backPath   = backFile ? await uploadToStorage(backFile, 'doc_back') : null
      const selfiePath = await uploadToStorage(selfieFile, 'selfie')

      const res = await fetch('/api/verify/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frontPath, backPath, selfiePath }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Submission failed'); setLoading(false); return }
      setStatus('pending')
      setSubmitted(true)
    } catch (e: any) {
      setError(e?.message || 'Submission failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const cfg = STATUS_CONFIG[status]

  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
      <style>{`
        
        *{box-sizing:border-box;margin:0;padding:0}
        a{color:${S.gold};text-decoration:none}
        .upload-zone{border:1.5px dashed #ffffff20;border-radius:12px;padding:2rem;text-align:center;cursor:pointer;transition:border-color .2s,background .2s}
        .upload-zone:hover{border-color:${S.gold}55;background:rgba(197,160,90,0.04)}
        .upload-zone.has-file{border-color:${S.green}55;background:rgba(29,201,143,0.04)}
        input[type=file]{display:none}
      `}</style>

      <header style={{ position:'sticky', top:0, zIndex:100, background:'rgba(8,8,8,0.96)', backdropFilter:'blur(12px)', borderBottom:`0.5px solid #c5a05a22`, padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <a href="/" style={{ fontFamily:S.serif, fontSize:18, fontWeight:600, color:S.t, letterSpacing:'0.04em' }}>Secret<span style={{ color:S.gold }}>Xperience</span></a>
        <a href="/dashboard" style={{ fontSize:13, color:S.t2 }}>← Dashboard</a>
      </header>

      <main style={{ maxWidth:640, margin:'0 auto', padding:'4rem 24px 6rem' }}>

        {/* Status banner */}
        <div style={{ background:`${cfg.color}12`, border:`0.5px solid ${cfg.color}44`, borderRadius:14, padding:'1.25rem 1.5rem', marginBottom:'2.5rem', display:'flex', alignItems:'flex-start', gap:14 }}>
          <span style={{ fontSize:24, color:cfg.color, lineHeight:1, marginTop:2 }}>{cfg.icon}</span>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:cfg.color, marginBottom:'0.25rem', letterSpacing:'0.04em', textTransform:'uppercase' }}>{cfg.label}</p>
            <p style={{ fontSize:13, color:S.t2, lineHeight:1.6 }}>{cfg.desc}</p>
          </div>
        </div>

        <p style={{ fontSize:11, letterSpacing:'0.14em', color:S.gold, textTransform:'uppercase', marginBottom:'1rem' }}>Identity Verification</p>
        <h1 style={{ fontFamily:S.serif, fontSize:'clamp(28px,5vw,42px)', fontWeight:400, lineHeight:1.1, marginBottom:'1rem' }}>
          Verify your <em style={{ color:S.gold, fontStyle:'italic' }}>identity</em>
        </h1>
        <p style={{ fontSize:14, color:S.t2, lineHeight:1.75, marginBottom:'2.5rem' }}>
          SecretXperience requires identity verification for all providers before publishing listings. Your documents are stored securely and only reviewed by our compliance team. We accept national ID cards, passports, and driver's licences.
        </p>

        {submitted || status === 'approved' ? (
          <div style={{ textAlign:'center', padding:'3rem 0' }}>
            <p style={{ fontFamily:S.serif, fontSize:28, color:S.gold, marginBottom:'1rem' }}>
              {status === 'approved' ? 'Verified ✓' : 'Documents submitted'}
            </p>
            <p style={{ fontSize:14, color:S.t2, marginBottom:'2rem' }}>
              {status === 'approved'
                ? 'You can now publish listings on SecretXperience.'
                : 'We\'ll review your submission within 24–48 hours and notify you by email.'}
            </p>
            <a href="/dashboard" style={{ display:'inline-block', padding:'12px 28px', background:'linear-gradient(90deg,#c5a05a,#d4b06e)', borderRadius:8, color:'#080808', fontWeight:600, fontSize:13, letterSpacing:'0.04em' }}>
              Back to dashboard
            </a>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

            {/* Doc front */}
            <div>
              <p style={{ fontSize:12, fontWeight:600, color:S.t, marginBottom:'0.6rem', letterSpacing:'0.04em' }}>
                Front of ID <span style={{ color:S.red }}>*</span>
              </p>
              <div className={`upload-zone ${frontFile ? 'has-file' : ''}`} onClick={() => frontRef.current?.click()}>
                {frontPreview ? (
                  <img src={frontPreview} alt="Front" style={{ maxHeight:120, borderRadius:8, objectFit:'contain' }} />
                ) : (
                  <>
                    <p style={{ fontSize:28, marginBottom:'0.5rem' }}>🪪</p>
                    <p style={{ fontSize:13, color:S.t2 }}>Click to upload front of ID</p>
                    <p style={{ fontSize:11, color:S.t3, marginTop:'0.4rem' }}>JPG, PNG or PDF — max 10 MB</p>
                  </>
                )}
              </div>
              <input ref={frontRef} type="file" accept="image/*,.pdf"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], setFrontFile, setFrontPreview)} />
            </div>

            {/* Doc back */}
            <div>
              <p style={{ fontSize:12, fontWeight:600, color:S.t, marginBottom:'0.6rem', letterSpacing:'0.04em' }}>
                Back of ID <span style={{ color:S.t3 }}>(optional)</span>
              </p>
              <div className={`upload-zone ${backFile ? 'has-file' : ''}`} onClick={() => backRef.current?.click()}>
                {backPreview ? (
                  <img src={backPreview} alt="Back" style={{ maxHeight:120, borderRadius:8, objectFit:'contain' }} />
                ) : (
                  <>
                    <p style={{ fontSize:28, marginBottom:'0.5rem' }}>🪪</p>
                    <p style={{ fontSize:13, color:S.t2 }}>Click to upload back of ID</p>
                  </>
                )}
              </div>
              <input ref={backRef} type="file" accept="image/*,.pdf"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], setBackFile, setBackPreview)} />
            </div>

            {/* Selfie */}
            <div>
              <p style={{ fontSize:12, fontWeight:600, color:S.t, marginBottom:'0.6rem', letterSpacing:'0.04em' }}>
                Selfie holding your ID <span style={{ color:S.red }}>*</span>
              </p>
              <div className={`upload-zone ${selfieFile ? 'has-file' : ''}`} onClick={() => selfieRef.current?.click()}>
                {selfiePreview ? (
                  <img src={selfiePreview} alt="Selfie" style={{ maxHeight:160, borderRadius:8, objectFit:'contain' }} />
                ) : (
                  <>
                    <p style={{ fontSize:28, marginBottom:'0.5rem' }}>🤳</p>
                    <p style={{ fontSize:13, color:S.t2 }}>Selfie with your ID clearly visible</p>
                    <p style={{ fontSize:11, color:S.t3, marginTop:'0.4rem' }}>Hold your open ID next to your face — both must be clearly visible</p>
                  </>
                )}
              </div>
              <input ref={selfieRef} type="file" accept="image/*"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], setSelfieFile, setSelfiePreview)} />
            </div>

            {error && (
              <p style={{ fontSize:13, color:S.red, background:'rgba(224,90,90,0.08)', border:`0.5px solid ${S.red}44`, borderRadius:8, padding:'10px 14px' }}>
                {error}
              </p>
            )}

            <button onClick={handleSubmit} disabled={loading || !frontFile || !selfieFile}
              style={{ padding:'14px 28px', background: (!frontFile || !selfieFile) ? '#1a1a1a' : 'linear-gradient(90deg,#c5a05a,#d4b06e)', border:'none', borderRadius:10, color: (!frontFile || !selfieFile) ? S.t3 : '#080808', fontFamily:S.sans, fontWeight:600, fontSize:14, cursor: (!frontFile || !selfieFile) ? 'not-allowed' : 'pointer', letterSpacing:'0.04em' }}>
              {loading ? 'Submitting…' : 'Submit for review'}
            </button>

            <p style={{ fontSize:12, color:S.t3, lineHeight:1.7 }}>
              Your documents are encrypted and stored securely. They are only accessible to the SecretXperience compliance team and are never shared with third parties. By submitting you confirm that all documents belong to you.
            </p>
          </div>
        )}
      </main>

      <footer style={{ borderTop:`0.5px solid #c5a05a22`, padding:'2rem 24px', textAlign:'center' }}>
        <p style={{ fontSize:12, color:S.t2 }}>© 2025 SecretXperience.eu · <a href="/privacy">Privacy Policy</a> · <a href="/contact">Support</a></p>
      </footer>
    </div>
  )
}
