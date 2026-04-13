import { NextRequest, NextResponse } from "next/server"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { users, sessions, accounts } from "@/lib/schema"
import { eq } from "drizzle-orm"

const dbClient = postgres(process.env.DATABASE_URL!)
const db = drizzle(dbClient)

export async function POST(req: NextRequest) {
  try {
    const { code, state } = await req.json()

    if (!code || !state) {
      return NextResponse.json(
        { error: "Code and state are required" },
        { status: 400 }
      )
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.BETTER_AUTH_URL}/api/auth/github/android/callback`
      })
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error || !tokenData.access_token) {
      return NextResponse.json(
        { error: tokenData.error_description || "Failed to get access token" },
        { status: 401 }
      )
    }

    // Get user info from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json"
      }
    })

    const githubUser = await userResponse.json()

    // Get user email if not public
    let email = githubUser.email
    if (!email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json"
        }
      })
      const emails = await emailResponse.json()
      const primaryEmail = emails.find((e: any) => e.primary)
      email = primaryEmail?.email || emails[0]?.email
    }

    if (!email) {
      return NextResponse.json(
        { error: "No email found for GitHub account" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email))
    let user = existingUsers[0]

    if (!user) {
      // Create new user
      const [newUser] = await db.insert(users).values({
        email,
        name: githubUser.name || githubUser.login,
        emailVerified: true,
        image: githubUser.avatar_url
      }).returning()
      user = newUser

      // Create account link
      await db.insert(accounts).values({
        userId: user.id,
        accountId: githubUser.id.toString(),
        providerId: "github",
        accessToken: tokenData.access_token
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
    console.error("GitHub Android auth error:", error)
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    )
  }
}
