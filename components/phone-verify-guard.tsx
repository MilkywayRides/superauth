import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function PhoneVerifyGuard({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (session?.user?.id) {
    try {
      const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
      
      if (dbUser[0] && !dbUser[0].phone) {
        redirect('/phone-verify')
      }
    } catch (error) {
      console.error('[PhoneVerifyGuard]', error)
    }
  }
  
  return <>{children}</>
}
