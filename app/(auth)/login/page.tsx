"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, LogIn, ArrowRight, KeyRound, RefreshCw, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

// Google SVG Icon Component
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
      />
    </svg>
  );
}

// Zod Validation Schemas
const otpSendSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const otpVerifySchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  otp: z.string().min(6, { message: "OTP must be at least 6 characters long" }),
});

const OTP_EXPIRATION_TIME = 120; // ১২০ সেকেন্ড (২ মিনিট)

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRATION_TIME);

  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
  }>({});

  const router = useRouter();

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign in with Google.");
    }
  };

  // OTP Expiration Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, timeLeft]);

  // সময়ের ফরমেট (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ১. OTP পাঠানো
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});

    const result = otpSendSchema.safeParse({ email });
    if (!result.success) {
      const msg = result.error.format().email?._errors[0] || "Invalid email";
      setErrors({ email: msg });
      toast.error(msg);
      return;
    }

    setLoading(true);

    await authClient.emailOtp.sendVerificationOtp(
      { email, type: "sign-in" },
      {
        onSuccess: () => {
          setLoading(false);
          setOtpSent(true);
          setTimeLeft(OTP_EXPIRATION_TIME); // টাইমার রিসেট করা
          toast.success("OTP sent to your email!");
        },
        onError: (ctx) => {
          setLoading(false);
          toast.error(ctx.error.message || "Failed to send OTP.");
        },
      }
    );
  };

  // ২. OTP ভেরিফাই করে সরাসরি লগইন
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (timeLeft === 0) {
      toast.error("OTP has expired. Please request a new one.");
      return;
    }

    const result = otpVerifySchema.safeParse({ email, otp });
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      const formatted = result.error.format();
      if (formatted.email?._errors[0]) fieldErrors.email = formatted.email._errors[0];
      if (formatted.otp?._errors[0]) fieldErrors.otp = formatted.otp._errors[0];

      setErrors(fieldErrors);
      toast.error(fieldErrors.otp || fieldErrors.email || "Invalid OTP");
      return;
    }

    setLoading(true);

    await authClient.signIn.emailOtp(
      { email, otp },
      {
        onSuccess: () => {
          setLoading(false);
          toast.success("Successfully logged in!");
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setLoading(false);
          toast.error(ctx.error.message || "Invalid OTP code.");
        },
      }
    );
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-2xl shadow-purple-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30">
            <LogIn size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sign in to continue with <span className="font-semibold text-purple-600">TravelX</span>
          </p>
        </div>

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80"
        >
          <GoogleIcon /> Continue with Google
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs uppercase text-slate-400 font-medium">Or Sign in with OTP</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Email OTP Login Form */}
        <form onSubmit={!otpSent ? handleSendOtp : handleOtpLogin} className="space-y-4" noValidate>
          {/* Email Field */}
          {!otpSent && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 dark:text-slate-400">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-3.5 text-purple-500" />
                <input
                  type="email"
                  disabled={otpSent}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full rounded-xl border ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-purple-500 dark:border-slate-800 dark:focus:border-purple-400"
                  } bg-purple-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:bg-white dark:bg-slate-900 dark:text-white disabled:opacity-60`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">{errors.email}</p>
              )}
            </div>
          )}

          {/* OTP Input Field */}
          {otpSent && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Enter OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="text-xs font-medium text-purple-600 hover:underline dark:text-purple-400"
                >
                  Change Email
                </button>
              </div>
              <div className="relative flex items-center">
                <KeyRound size={18} className="absolute left-3.5 text-purple-500" />
                <input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
                  }}
                  className={`w-full rounded-xl border ${
                    errors.otp
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-purple-500 dark:border-slate-800 dark:focus:border-purple-400"
                  } bg-purple-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:bg-white dark:bg-slate-900 dark:text-white`}
                />
              </div>

              {/* Timer & Resend Option */}
              <div className="mt-2.5 flex items-center justify-between text-xs">
                {timeLeft > 0 ? (
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Clock size={14} className="text-purple-500" />
                    <span>
                      OTP expires in{" "}
                      <strong className="text-purple-600 dark:text-purple-400">
                        {formatTime(timeLeft)}
                      </strong>
                    </span>
                  </div>
                ) : (
                  <p className="text-red-500 font-medium">OTP has expired</p>
                )}

                <button
                  type="button"
                  disabled={timeLeft > 0 || loading}
                  onClick={() => handleSendOtp()}
                  className="flex items-center gap-1 text-purple-600 hover:underline font-semibold disabled:opacity-50 disabled:no-underline dark:text-purple-400"
                >
                  <RefreshCw size={12} /> Resend OTP
                </button>
              </div>

              {errors.otp && (
                <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">{errors.otp}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (otpSent && timeLeft === 0)}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? "Processing..." : otpSent ? "Verify & Login" : "Send OTP"} <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-purple-600 hover:underline dark:text-purple-400">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}