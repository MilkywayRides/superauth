import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  // Generate RSA key pair for JWT signing (in production, use persistent keys)
  const publicKey = process.env.JWT_PUBLIC_KEY || ""
  
  if (!publicKey) {
    return NextResponse.json({ 
      error: "server_error",
      error_description: "JWT public key not configured" 
    }, { status: 500 })
  }

  // Return JWKS (JSON Web Key Set)
  return NextResponse.json({
    keys: [
      {
        kty: "RSA",
        use: "sig",
        kid: "1",
        alg: "RS256",
        n: publicKey,
        e: "AQAB"
      }
    ]
  })
}
