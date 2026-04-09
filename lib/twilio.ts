import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

if (!accountSid || !authToken || !serviceSid) {
  console.warn('[Twilio] Missing credentials')
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export async function sendOTP(phone: string) {
  if (!client || !serviceSid) {
    throw new Error('Twilio not configured')
  }

  try {
    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phone, channel: 'sms' })

    return { success: true, status: verification.status }
  } catch (error) {
    console.error('[Twilio] Send OTP error:', error)
    throw new Error('Failed to send OTP')
  }
}

export async function verifyOTP(phone: string, code: string) {
  if (!client || !serviceSid) {
    throw new Error('Twilio not configured')
  }

  try {
    const verification = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phone, code })

    return { success: verification.status === 'approved', status: verification.status }
  } catch (error) {
    console.error('[Twilio] Verify OTP error:', error)
    throw new Error('Failed to verify OTP')
  }
}
