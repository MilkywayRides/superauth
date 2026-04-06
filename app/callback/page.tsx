"use client"

import { useEffect } from "react"
import { authClient } from "@/lib/auth-client"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"

export default function CallbackPage() {
  useEffect(() => {
    const saveAccountAndRedirect = async () => {
      const { data: session } = await authClient.getSession()
      
      if (session?.user) {
        localStorage.setItem("lastAccount", JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image
        }))
        
        // Redirect to main app
        window.location.href = SITE_URL
      }
    }

    saveAccountAndRedirect()
  }, [])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  )
}
