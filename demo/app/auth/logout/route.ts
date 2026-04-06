import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL!))
  
  response.cookies.delete('access_token')
  response.cookies.delete('user')
  
  return response
}
