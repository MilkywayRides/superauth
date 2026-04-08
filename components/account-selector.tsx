"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

export function AccountSelector({ className, ...props }: React.ComponentProps<"div">) {
  const [accounts, setAccounts] = useState<Array<{email: string, name?: string, image?: string}>>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check URL params first
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    
    if (emailParam) {
      const account = {
        email: emailParam,
        name: params.get('name') || undefined,
        image: params.get('image') || undefined,
        provider: params.get('provider') || 'email'
      }
      localStorage.setItem("lastAccount", JSON.stringify(account))
      setAccounts([account])
      // Clean URL
      window.history.replaceState({}, '', '/')
    } else {
      const saved = localStorage.getItem("lastAccount")
      if (saved) {
        setAccounts([JSON.parse(saved)])
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading && accounts.length === 0) {
      router.push("/login")
    }
  }, [loading, accounts, router])

  const handleAccountClick = async (account: {email: string, provider?: string, image?: string}) => {
    // Check if user already has an active session
    const { data: session } = await authClient.getSession()
    
    if (session?.user && session.user.email === account.email) {
      // User is already logged in, redirect directly to main site
      window.location.href = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
      return
    }
    
    // No active session - need to re-authenticate
    // For now, redirect to login page for all accounts
    localStorage.setItem("selectedAccount", account.email)
    router.push("/login")
  }

  if (loading || accounts.length === 0) return null

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">Choose an account</CardTitle>
          <CardDescription>to continue to BlazeNeuro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {accounts.map((account) => (
              <button
                key={account.email}
                onClick={() => handleAccountClick(account)}
                className="flex items-center gap-4 w-full p-4 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {account.image ? (
                  <img src={account.image} alt={account.name || account.email} className="w-12 h-12 rounded-full ring-2 ring-background" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary ring-2 ring-background">
                    {account.email[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium truncate">{account.name || account.email}</div>
                  <div className="text-sm text-muted-foreground truncate">{account.email}</div>
                </div>
              </button>
            ))}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
              Use another account
            </Button>
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground px-8">
        By continuing, you agree to our{" "}
        <a href="https://blazeneuro.com/terms" className="underline underline-offset-4 hover:text-primary transition-colors">Terms of Service</a>
        {" "}and{" "}
        <a href="https://blazeneuro.com/privacy" className="underline underline-offset-4 hover:text-primary transition-colors">Privacy Policy</a>.
      </p>
    </div>
  )
}
