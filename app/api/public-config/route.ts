import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const clean = (v: string | undefined) => {
    const t = (v ?? '').trim()
    return t.length > 0 ? t : null
  }

  return NextResponse.json({
    googleClientId: clean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID),
    facebookAppId: clean(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID),
    linkedInClientId: clean(process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID),
  })
}

