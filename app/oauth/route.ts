import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'OAuth service is running',
    endpoints: {
      register: '/oauth/v1/clients',
      authorize: '/oauth/v1/authorize',
      token: '/oauth/v1/token',
      userinfo: '/oauth/v1/userinfo',
      discovery: '/.well-known/openid-configuration'
    }
  })
}
