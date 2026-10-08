import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "./email"; 

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  // Google Provider কনফিগারেশন যুক্ত করা হলো
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `<p>Click the link to verify your email: <a href="${url}">${url}</a></p>`,
      });
    },
  },

  plugins: [
    admin(),
    emailOTP({
      expiresIn: 120, // ওটিপির মেয়াদের সময় (সেকেন্ড)
      async sendVerificationOTP({ email, otp, type }, request) {
        if (type === "sign-in") {
          await sendEmail({
            to: email,
            subject: "Sign in Reset OTP Code",
            html: `<p>Your OTP for signing in is: <strong>${otp}</strong></p>`,
          });
        } else if (type === "forget-password") {
          await sendEmail({
            to: email,
            subject: "Password Reset OTP Code",
            html: `<p>Your OTP to reset your password is: <strong>${otp}</strong></p>`,
          });
        }
      },
    }),
  ],
});