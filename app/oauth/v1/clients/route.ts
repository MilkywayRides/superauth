import { NextRequest, NextResponse } from "next/server"

// OAuth client registry - in production, store in database
interface OAuthClient {
  id: string
  secret: string
  name: string
  redirectUris: string[]
  allowedOrigins: string[]
  createdAt: string
}

// This should be stored in a database in production
const clients = new Map<string, OAuthClient>()

// Pre-register demo client
clients.set('bn_6a482efa70b1dc11bb9eab5a7f59f3b9', {
  id: 'bn_6a482efa70b1dc11bb9eab5a7f59f3b9',
  secret: 'c9274764395809b09ef21f43c0704c2745435ad1cd1d05ec0957a619e834f321',
  name: 'Demo App',
  redirectUris: ['http://localhost:3002/auth/callback'],
  allowedOrigins: ['http://localhost:3002'],
  createdAt: new Date().toISOString()
})

// Register Data Flow client
clients.set('bn_9ede824872be0ca76131cc37626e5717', {
  id: 'bn_9ede824872be0ca76131cc37626e5717',
  secret: '7abd910be52c8d55d68fc3ef8ee8e80f901963488b307c3187708a153b51be18',
  name: 'Data Flow',
  redirectUris: ['http://localhost:3000/api/auth/callback'],
  allowedOrigins: ['http://localhost:3000'],
  createdAt: new Date().toISOString()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, redirect_uris, allowed_origins } = body

    if (!name || !redirect_uris || !Array.isArray(redirect_uris) || redirect_uris.length === 0) {
      return NextResponse.json({ 
        error: "invalid_request",
        error_description: "Missing or invalid required fields" 
      }, { status: 400 })
    }

    // Generate client credentials
    const clientId = `client_${crypto.randomUUID().replace(/-/g, '')}`
    const clientSecret = `secret_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`

    const client: OAuthClient = {
      id: clientId,
      secret: clientSecret,
      name,
      redirectUris: redirect_uris,
      allowedOrigins: allowed_origins || [],
      createdAt: new Date().toISOString()
    }

    clients.set(clientId, client)

    return NextResponse.json({
      client_id: clientId,
      client_secret: clientSecret,
      name: client.name,
      redirect_uris: client.redirectUris,
      created_at: client.createdAt
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ 
      error: "server_error",
      error_description: "Failed to register client" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("client_id")
  
  if (!clientId) {
    return NextResponse.json({ 
      error: "invalid_request",
      error_description: "Missing client_id parameter" 
    }, { status: 400 })
  }

  const client = clients.get(clientId)
  
  if (!client) {
    return NextResponse.json({ 
      error: "not_found",
      error_description: "Client not found" 
    }, { status: 404 })
  }

  return NextResponse.json({
    client_id: client.id,
    name: client.name,
    redirect_uris: client.redirectUris,
    created_at: client.createdAt
  })
}

// Export for use in other routes
export function getClient(clientId: string): OAuthClient | undefined {
  return clients.get(clientId)
}

export function validateClient(clientId: string, clientSecret: string): boolean {
  const client = clients.get(clientId)
  return client !== undefined && client.secret === clientSecret
}

export function validateRedirectUri(clientId: string, redirectUri: string): boolean {
  const client = clients.get(clientId)
  return client !== undefined && client.redirectUris.includes(redirectUri)
}

export function validateOrigin(clientId: string, origin: string): boolean {
  const client = clients.get(clientId)
  if (!client) return false
  if (client.allowedOrigins.length === 0) return true // No origin restriction
  return client.allowedOrigins.includes(origin)
}
