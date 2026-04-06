import { LoginForm } from "@/components/login-form"
import { GalleryVerticalEndIcon } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - bLAZEnEURO",
  description: "Sign in to your bLAZEnEURO account",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="https://blazeneuro.com/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          bLAZEnEURO
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
