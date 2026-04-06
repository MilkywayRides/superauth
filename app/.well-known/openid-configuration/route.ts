import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json({
    issuer: process.env.BETTER_AUTH_URL,
    authorization_endpoint: `${process.env.BETTER_AUTH_URL}/oauth/v1/authorize`,
    token_endpoint: `${process.env.BETTER_AUTH_URL}/oauth/v1/token`,
    userinfo_endpoint: `${process.env.BETTER_AUTH_URL}/oauth/v1/userinfo`,
    jwks_uri: `${process.env.BETTER_AUTH_URL}/oauth/v1/jwks`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256", "HS256"],
    scopes_supported: ["openid", "profile", "email"],
    token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
    claims_supported: ["sub", "email", "email_verified", "name", "picture", "updated_at"]
  })
}
