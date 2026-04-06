import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  // Exchange code for tokens
  try {
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/oauth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET
      })
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      return NextResponse.redirect(new URL(`/?error=${error.error}`, request.url))
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/oauth/v1/userinfo`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })

    const user = await userResponse.json()

    // Create response with redirect
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    
    // Set cookies (in production, use httpOnly cookies)
    response.cookies.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600
    })
    
    response.cookies.set('user', JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600
    })

    return response
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
  }
}
