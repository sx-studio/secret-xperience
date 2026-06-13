/**
 * AI Content Moderation
 * Uses Claude Haiku to evaluate listing text for policy compliance.
 * Called automatically when a listing is created.
 *
 * POST { listingId, title, description, category }
 * Returns { approved: boolean, score: number, flags: string[], reason: string }
 *
 * Auto-approves clean listings. Flags borderline/violating for admin review.
 */
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SYSTEM_PROMPT = `You are a content moderation system for SecretXperience.eu, a legal adult services advertising platform operating in Belgium under Belgian law.

Your job is to evaluate whether a listing is compliant with these rules:
ALLOWED: Legal adult escort/companionship advertising, massage, nightlife venues, adult creators, legal rentals, events, hotels.
NOT ALLOWED: Any indication of minors, explicit references to human trafficking or coercion, content that is illegal under Belgian law, malware or phishing content, content clearly designed to deceive or defraud.

Be realistic — this is a legal adult advertising platform. Explicit descriptions of legal adult services are expected and acceptable. Only flag genuine policy violations.

Respond ONLY with valid JSON in this exact format:
{
  "approved": true or false,
  "score": 0.0 to 1.0 (1.0 = fully compliant, 0.0 = clear violation),
  "flags": ["flag1", "flag2"] or [],
  "reason": "brief explanation"
}`

export async function POST(req: NextRequest) {
  // Only callable from internal API routes (webhook from listing create)
  const auth = req.headers.get('authorization')
  const secret = process.env.INTERNAL_SECRET || 'sx-internal'
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { listingId, title, description, category } = await req.json()
  if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  let result = { approved: true, score: 1.0, flags: [] as string[], reason: 'Auto-approved (no API key)' }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const content = `Category: ${category}\nTitle: ${title}\nDescription: ${description || '(none)'}`

      const msg = await client.messages.create({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content }],
      })

      const text = msg.content?.[0]?.type === 'text' ? (msg.content[0] as any).text : ''
      const parsed = JSON.parse(text)
      result = {
        approved: !!parsed.approved,
        score:    parseFloat(parsed.score) || 0,
        flags:    Array.isArray(parsed.flags) ? parsed.flags : [],
        reason:   parsed.reason || '',
      }
    } catch (e) {
      console.error('Moderation API error:', e)
      // On error, leave pending for human review rather than auto-approving
      result = { approved: false, score: 0.5, flags: ['moderation_error'], reason: 'Moderation check failed — pending human review' }
    }
  }

  // Update listing based on result
  const updateData: Record<string, any> = {
    moderation_score: result.score,
    moderation_flags: result.flags,
    moderation_at:    new Date().toISOString(),
  }

  if (result.approved && result.score >= 0.7) {
    // Clean — publish immediately
    updateData.status = 'approved'
    updateData.active  = true
  } else if (result.score < 0.3) {
    // Clear violation — reject
    updateData.status = 'rejected'
    updateData.active  = false
  } else {
    // Borderline — leave pending for human review
    updateData.status = 'pending'
    updateData.active  = false
  }

  await admin.from('listings').update(updateData).eq('id', listingId)

  return NextResponse.json(result)
}
