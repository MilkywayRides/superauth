import { NextRequest, NextResponse } from "next/server"
import { createAuthorizationCode } from "../token/route"
import { authClient } from "@/lib/auth-client"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const clientId = searchParams.get("client_id")
  const redirectUri = searchParams.get("redirect_uri")
  const state = searchParams.get("state")
  const scope = searchParams.get("scope") || "openid profile email"

  if (!clientId || !redirectUri || !state) {
    return NextResponse.json({ error: "invalid_request", error_description: "Missing required parameters" }, { status: 400 })
  }

  // Get current session to get user_id
  try {
    const { data: session } = await authClient.getSession({
      fetchOptions: {
        headers: request.headers
      }
    })

    if (!session?.user) {
      return NextResponse.json({ error: "unauthorized", error_description: "No active session" }, { status: 401 })
    }

    // Generate authorization code with user data
    const code = createAuthorizationCode(session.user.id, clientId, redirectUri, scope, session.user)

    // Redirect back to client with code
    const callbackUrl = new URL(redirectUri)
    callbackUrl.searchParams.set("code", code)
    callbackUrl.searchParams.set("state", state)

    return NextResponse.redirect(callbackUrl)
  } catch (error) {
    return NextResponse.json({ error: "server_error", error_description: "Failed to process callback" }, { status: 500 })
  }
}

