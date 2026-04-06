import { NextRequest, NextResponse } from "next/server"
import { validateAccessToken } from "../token/route"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ 
      error: "invalid_token",
      error_description: "Missing or invalid authorization header" 
    }, { status: 401 })
  }

  const accessToken = authHeader.substring(7)

  // Validate access token
  const tokenData = validateAccessToken(accessToken)
  if (!tokenData || !tokenData.userData) {
    return NextResponse.json({ 
      error: "invalid_token",
      error_description: "Invalid or expired access token" 
    }, { status: 401 })
  }

  try {
    const user = tokenData.userData

    // Return user info based on requested scope
    const scopes = tokenData.scope.split(" ")
    const userInfo: any = {}

    if (scopes.includes("openid")) {
      userInfo.sub = user.id
    }

    if (scopes.includes("email")) {
      userInfo.email = user.email
      userInfo.email_verified = user.emailVerified
    }

    if (scopes.includes("profile")) {
      userInfo.name = user.name
      userInfo.picture = user.image
      userInfo.updated_at = user.updatedAt
    }

    return NextResponse.json(userInfo)
  } catch (error) {
    return NextResponse.json({ 
      error: "server_error",
      error_description: "Failed to retrieve user information" 
    }, { status: 500 })
  }
}
