import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { verifyOTP } from '@/lib/twilio'

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phone, code } = await req.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code required' }, { status: 400 })
    }

    const result = await verifyOTP(phone, code)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    await db.update(user).set({ 
      phone, 
      phoneVerified: true 
    }).where(eq(user.id, session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Verify OTP]', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
