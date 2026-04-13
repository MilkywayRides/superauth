import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code || !state) {
    return NextResponse.redirect("blazeneuro://github-callback?error=missing_params")
  }

  // Redirect to Android app with code and state
  return NextResponse.redirect(`blazeneuro://github-callback?code=${code}&state=${state}`)
}
