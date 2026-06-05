import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  // Vercel injects x-vercel-ip-country on all requests (2-letter ISO code, e.g. "BE")
  const country = req.headers.get('x-vercel-ip-country') || ''
  return NextResponse.json({ country: country.toUpperCase() })
}
