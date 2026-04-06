"use server";

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { sendVerificationEmail } from "@/lib/email";

export async function sendOTP(email: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  console.log("Generated OTP:", otp, "for email:", email);
  console.log("Expires at:", expiresAt.toISOString());

  try {
    // Delete any existing OTP for this email first
    await db.execute(sql`
      DELETE FROM verification WHERE identifier = ${email}
    `);
    
    // Store new OTP in verification table
    await db.execute(sql`
      INSERT INTO verification (id, identifier, value, "expiresAt")
      VALUES (${crypto.randomUUID()}, ${email}, ${otp}, ${expiresAt.toISOString()})
    `);

    // Send email
    const result = await sendVerificationEmail(email, otp);
    
    if (result.success) {
      console.log("Email sent successfully");
      return { success: true };
    } else {
      return { success: false, error: "Failed to send email" };
    }
  } catch (error) {
    console.error("OTP error:", error);
    return { success: false, error: "Failed to send OTP" };
  }
}

export async function verifyOTP(email: string, otp: string) {
  try {
    // First check what's in the database
    const checkResult = await db.execute(sql`
      SELECT identifier, value, "expiresAt" FROM verification WHERE identifier = ${email}
    `);
    const allRecords = (checkResult as any).rows || checkResult;
    console.log("Database records for", email, ":", JSON.stringify(allRecords, null, 2));
    console.log("Looking for OTP:", otp, "Type:", typeof otp);
    
    const result = await db.execute(sql`
      SELECT * FROM verification 
      WHERE identifier = ${email} 
      AND value = ${otp}
    `);

    const rows = (result as any).rows || result;
    console.log("Matching rows (without time check):", JSON.stringify(rows, null, 2));
    
    if (rows.length > 0) {
      const record = rows[0];
      // Database stores timestamp without timezone (treated as local IST)
      // Parse it as if it's UTC, then it will be correct
      const expiresAtStr = record.expiresAt.replace(' ', 'T');
      const expiresAt = new Date(expiresAtStr);
      const now = new Date();
      
      // Subtract IST offset from now to compare in same timezone
      const istOffset = 5.5 * 60 * 60 * 1000;
      const nowLocal = new Date(now.getTime() - istOffset);
      
      console.log("Raw expiresAt from DB:", record.expiresAt);
      console.log("Expires at (parsed):", expiresAt.toISOString());
      console.log("Current time (adjusted):", nowLocal.toISOString());
      console.log("Time difference (ms):", expiresAt.getTime() - nowLocal.getTime());
      console.log("Valid:", expiresAt > nowLocal);
      
      if (expiresAt > nowLocal) {
        // Delete used OTP
        await db.execute(sql`
          DELETE FROM verification WHERE identifier = ${email}
        `);
        return { success: true };
      } else {
        return { success: false, error: "OTP has expired" };
      }
    } else {
      return { success: false, error: "Invalid OTP code" };
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    return { success: false, error: "Verification failed" };
  }
}
