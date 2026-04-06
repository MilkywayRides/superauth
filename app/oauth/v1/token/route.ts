import { NextRequest, NextResponse } from "next/server"
import { validateClient, validateOrigin } from "../clients/route"
import crypto from "crypto"

// In-memory store for authorization codes (use Redis in production)
const authCodes = new Map<string, {
  userId: string
  clientId: string
  redirectUri: string
  scope: string
  expiresAt: number
  userData: any
}>()

// In-memory store for access tokens (use Redis/database in production)
const accessTokens = new Map<string, {
  userId: string
  clientId: string
  scope: string
  expiresAt: number
  userData: any
}>()

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || ""
  
  try {
    const body = await request.json()
    const { grant_type, code, redirect_uri, client_id, client_secret } = body

    // Validate grant_type
    if (grant_type !== "authorization_code") {
      return NextResponse.json({ 
        error: "unsupported_grant_type",
        error_description: "Only 'authorization_code' grant type is supported" 
      }, { status: 400 })
    }

    // Validate required parameters
    if (!code || !redirect_uri || !client_id || !client_secret) {
      return NextResponse.json({ 
        error: "invalid_request",
        error_description: "Missing required parameters" 
      }, { status: 400 })
    }

    // Validate client credentials
    if (!validateClient(client_id, client_secret)) {
      return NextResponse.json({ 
        error: "invalid_client",
        error_description: "Invalid client credentials" 
      }, { status: 401 })
    }

    // Validate origin if provided
    if (origin && !validateOrigin(client_id, origin)) {
      return NextResponse.json({ 
        error: "unauthorized_client",
        error_description: "Origin not allowed for this client" 
      }, { status: 403 })
    }

    // Retrieve and validate authorization code
    const authCode = authCodes.get(code)
    if (!authCode) {
      console.log('[OAuth] Invalid auth code:', code, 'Available codes:', Array.from(authCodes.keys()))
      return NextResponse.json({ 
        error: "invalid_grant",
        error_description: "Invalid or expired authorization code" 
      }, { status: 400 })
    }

    // Validate code hasn't expired (5 minutes)
    if (Date.now() > authCode.expiresAt) {
      authCodes.delete(code)
      console.log('[OAuth] Auth code expired:', code)
      return NextResponse.json({ 
        error: "invalid_grant",
        error_description: "Authorization code expired" 
      }, { status: 400 })
    }

    // Validate redirect_uri matches
    if (authCode.redirectUri !== redirect_uri) {
      console.log('[OAuth] Redirect URI mismatch. Expected:', authCode.redirectUri, 'Got:', redirect_uri)
      return NextResponse.json({ 
        error: "invalid_grant",
        error_description: "Redirect URI mismatch" 
      }, { status: 400 })
    }

    // Validate client_id matches
    if (authCode.clientId !== client_id) {
      console.log('[OAuth] Client ID mismatch. Expected:', authCode.clientId, 'Got:', client_id)
      return NextResponse.json({ 
        error: "invalid_grant",
        error_description: "Client ID mismatch" 
      }, { status: 400 })
    }

    console.log('[OAuth] Auth code validated successfully:', code)

    // Delete code (one-time use)
    authCodes.delete(code)

    // Generate tokens
    const accessToken = crypto.randomBytes(32).toString("hex")
    const refreshToken = crypto.randomBytes(32).toString("hex")
    const idToken = generateIdToken(authCode.userId, client_id)

    // Store access token with user data from auth code
    accessTokens.set(accessToken, {
      userId: authCode.userId,
      clientId: client_id,
      scope: authCode.scope,
      expiresAt: Date.now() + 3600 * 1000, // 1 hour
      userData: authCode.userData
    })

    return NextResponse.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: refreshToken,
      id_token: idToken,
      scope: authCode.scope
    })
  } catch (error) {
    return NextResponse.json({ 
      error: "server_error",
      error_description: "Failed to process token request" 
    }, { status: 500 })
  }
}

function generateIdToken(userId: string, clientId: string): string {
  // In production, use proper JWT signing with RS256
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const payload = Buffer.from(JSON.stringify({
    iss: process.env.BETTER_AUTH_URL,
    sub: userId,
    aud: clientId,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  })).toString("base64url")
  
  const signature = crypto
    .createHmac("sha256", process.env.BETTER_AUTH_SECRET || "")
    .update(`${header}.${payload}`)
    .digest("base64url")
  
  return `${header}.${payload}.${signature}`
}

// Export function to create auth codes (called after successful login)
export function createAuthorizationCode(userId: string, clientId: string, redirectUri: string, scope: string, userData?: any): string {
  const code = crypto.randomBytes(32).toString("hex")
  console.log('[OAuth] Creating auth code:', code, 'for user:', userId, 'client:', clientId)
  authCodes.set(code, {
    userId,
    clientId,
    redirectUri,
    scope,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    userData
  })
  return code
}

// Export function to validate access token
export function validateAccessToken(token: string): { userId: string; clientId: string; scope: string; userData: any } | null {
  const tokenData = accessTokens.get(token)
  if (!tokenData) return null
  if (Date.now() > tokenData.expiresAt) {
    accessTokens.delete(token)
    return null
  }
  return tokenData
}
