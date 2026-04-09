import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendOTP } from '@/lib/twilio'

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phone } = await req.json()

    if (!phone || !/^\+\d{1,4}\d{6,14}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    await sendOTP(phone)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Send OTP]', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
