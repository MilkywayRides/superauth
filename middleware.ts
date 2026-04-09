import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://local.blazeneuro.com:3001',
  'https://blazeneuro.com',
  'https://auth.blazeneuro.com',
  'https://www.blazeneuro.com'
]

export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  const pathname = request.nextUrl.pathname

  // Handle preflight
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400')
    return response
  }

  // Check if user needs phone verification
  if (pathname !== '/phone-verify' && pathname !== '/login' && pathname !== '/signup' && !pathname.startsWith('/api/')) {
    try {
      const session = await auth.api.getSession({ headers: request.headers })
      
      if (session?.user?.id) {
        const { db } = await import('@/lib/db')
        const { user } = await import('@/lib/schema')
        const { eq } = await import('drizzle-orm')
        
        const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
        
        if (dbUser[0] && !dbUser[0].phone) {
          const redirectUrl = new URL('/phone-verify', request.url)
          redirectUrl.searchParams.set('redirectTo', pathname)
          return NextResponse.redirect(redirectUrl)
        }
      }
    } catch (error) {
      console.error('[Middleware] Phone check error:', error)
    }
  }

  const response = NextResponse.next()
  
  // CORS
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
