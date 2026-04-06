"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { verifyOTP, sendOTP } from "./actions"
import { authClient } from "@/lib/auth-client"
import { useSearchParams } from "next/navigation"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") ?? ""
  const email = emailParam
  
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [signupData, setSignupData] = useState<{ email: string; password: string; name: string } | null>(null)

  useEffect(() => {
    const data = sessionStorage.getItem('pendingSignup')
    if (data) {
      setSignupData(JSON.parse(data))
    }
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !signupData) return

    setLoading(true)
    setError("")

    const result = await verifyOTP(email, otp)

    if (result.success) {
      const signupResult = await authClient.signUp.email({
        email: signupData.email,
        password: signupData.password,
        name: signupData.name,
        callbackURL: "http://localhost:3001"
      })

      if (signupResult.error) {
        setError(signupResult.error.message ?? "Signup failed")
      } else {
        sessionStorage.removeItem('pendingSignup')
        window.location.href = "http://localhost:3001"
      }
    } else {
      setError(result.error || "Verification failed")
    }
    setLoading(false)
  }

  const handleResend = async () => {
    if (!email) return
    
    setLoading(true)
    const result = await sendOTP(email)
    setLoading(false)

    if (result.success) {
      setError("")
      alert("New OTP sent to your email")
    } else {
      setError(result.error || "Failed to resend OTP")
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verify your email</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify}>
              <FieldGroup>
                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
                <Field>
                  <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    required
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={loading || otp.length !== 6}>
                    {loading ? "Verifying..." : "Verify Email"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResend}
                    disabled={loading}
                  >
                    Resend Code
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
