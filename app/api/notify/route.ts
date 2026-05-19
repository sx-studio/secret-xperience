import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Simple email notification via Supabase's built-in SMTP (or logs for now)
// Set RESEND_API_KEY env var to enable real email sending

export async function POST(req: NextRequest) {
  // Verify internal secret to prevent abuse
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.INTERNAL_SECRET || 'sx-internal'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { type, booking_id } = await req.json()
  if (!booking_id) return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, date, time, duration_hours, total_amount, status, notes,
      listings ( title, category, city ),
      client:profiles!bookings_client_id_fkey ( full_name, email ),
      provider:profiles!bookings_provider_id_fkey ( full_name, email )
    `)
    .eq('id', booking_id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const listing = (booking as any).listings
  const client  = (booking as any).client
  const provider = (booking as any).provider

  // If RESEND_API_KEY is set, send via Resend; otherwise log
  if (process.env.RESEND_API_KEY) {
    const emails = []

    if (type === 'booking_created' && provider?.email) {
      emails.push({
        from: 'SecretXperience <noreply@secret-xperience.eu>',
        to: [provider.email],
        subject: `New booking request — ${listing?.title}`,
        html: `<p>Hi ${provider?.full_name || 'there'},</p>
<p>You have a new booking request from <strong>${client?.full_name || 'a client'}</strong> for <strong>${listing?.title}</strong>.</p>
<p><strong>Date:</strong> ${booking.date}${booking.time ? ' at ' + booking.time : ''}<br>
<strong>Duration:</strong> ${booking.duration_hours}h<br>
<strong>Amount:</strong> €${booking.total_amount}</p>
${booking.notes ? '<p><strong>Notes:</strong> ' + booking.notes + '</p>' : ''}
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://secret-xperience.vercel.app'}/dashboard">View in dashboard →</a></p>`,
      })
    }

    if (type === 'booking_confirmed' && client?.email) {
      emails.push({
        from: 'SecretXperience <noreply@secret-xperience.eu>',
        to: [client.email],
        subject: `Booking confirmed — ${listing?.title}`,
        html: `<p>Hi ${client?.full_name || 'there'},</p>
<p>Your booking for <strong>${listing?.title}</strong> has been confirmed.</p>
<p><strong>Date:</strong> ${booking.date}${booking.time ? ' at ' + booking.time : ''}<br>
<strong>Duration:</strong> ${booking.duration_hours}h<br>
<strong>Total paid:</strong> €${booking.total_amount}</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://secret-xperience.vercel.app'}/dashboard">View in dashboard →</a></p>`,
      })
    }

    for (const email of emails) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify(email),
      })
    }
  } else {
    // Log for now when email service not configured
    console.log(`[notify] type=${type} booking=${booking_id} client=${client?.email} provider=${provider?.email}`)
  }

  return NextResponse.json({ ok: true })
}
