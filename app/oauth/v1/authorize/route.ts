import { NextRequest, NextResponse } from "next/server"
import { getClient, validateRedirectUri, validateOrigin } from "../clients/route"

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin") || ""
  const searchParams = request.nextUrl.searchParams
  const clientId = searchParams.get("client_id")
  const redirectUri = searchParams.get("redirect_uri")
  const responseType = searchParams.get("response_type")
  const state = searchParams.get("state")
  const scope = searchParams.get("scope") || "openid profile email"

  // Validate required parameters
  if (!clientId || !redirectUri || !responseType || !state) {
    return NextResponse.json({ 
      error: "invalid_request",
      error_description: "Missing required parameters" 
    }, { status: 400 })
  }

  // Validate response_type
  if (responseType !== "code") {
    return NextResponse.json({ 
      error: "unsupported_response_type",
      error_description: "Only 'code' response type is supported" 
    }, { status: 400 })
  }

  // Validate client exists
  const client = getClient(clientId)
  if (!client) {
    return NextResponse.json({ 
      error: "unauthorized_client",
      error_description: "Invalid client_id" 
    }, { status: 401 })
  }

  // Validate origin if provided
  if (origin && !validateOrigin(clientId, origin)) {
    return NextResponse.json({ 
      error: "unauthorized_client",
      error_description: "Origin not allowed for this client" 
    }, { status: 403 })
  }

  // Validate redirect_uri
  if (!validateRedirectUri(clientId, redirectUri)) {
    return NextResponse.json({ 
      error: "invalid_request",
      error_description: "Invalid redirect_uri" 
    }, { status: 400 })
  }

  // Store OAuth request in session
  const authUrl = new URL("/login", request.url)
  authUrl.searchParams.set("oauth", "true")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("client_name", client.name)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("scope", scope)

  return NextResponse.redirect(authUrl)
}
