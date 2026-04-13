import { NextRequest, NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { users, sessions, accounts } from "@/lib/schema"
import { eq } from "drizzle-orm"

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_CLIENT_ID)
const dbClient = postgres(process.env.DATABASE_URL!)
const db = drizzle(dbClient)

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      )
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, payload.email))
    let user = existingUsers[0]

    if (!user) {
      // Create new user
      const [newUser] = await db.insert(users).values({
        email: payload.email,
        name: payload.name || payload.email.split("@")[0],
        emailVerified: true,
        image: payload.picture
      }).returning()
      user = newUser

      // Create account link
      await db.insert(accounts).values({
        userId: user.id,
        accountId: payload.sub,
        providerId: "google",
        accessToken: idToken,
        idToken: idToken
      })
    }

    // Create session
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await db.insert(sessions).values({
      userId: user.id,
      token: sessionToken,
      expiresAt
    })

    return NextResponse.json({
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || "user"
      }
    })
  } catch (error: any) {
    console.error("Google Android auth error:", error)
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    )
  }
}
