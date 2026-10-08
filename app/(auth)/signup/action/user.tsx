"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email";

export async function checkUserExists(email: string) {
  try {
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    // অ্যারেতে অন্তত ১ জন ইউজার থাকলে (existingUser[0] ব্যবহার করতে হবে)
    if (existingUser.length > 0) {
      const foundUser = existingUser[0];

      await sendEmail({
        to: foundUser.email,
        subject: "Sign-up Attempt Alert",
        html: `
          <p>Someone tried to register an account using your email (${foundUser.email}).</p>
          <p>If this was you, please sign in instead.</p>
        `,
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
}