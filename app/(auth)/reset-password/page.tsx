"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, KeyRound, Mail, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

// Step 1 Schema: Email
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

// Step 2 Schema: OTP
const otpSchema = z.object({
  otp: z.string().min(6, { message: "OTP must be at least 6 characters long" }),
});

// Step 3 Schema: Passwords (Old password is not needed for forgot password flow)
const passwordSchema = z.object({
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters long" }),
  confirmPassword: z.string().min(8, { message: "Confirm password must be at least 8 characters long" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form States
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Show/Hide Password States
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // ----------------------------------------------------
  // STEP 1: Email ইনপুট দিয়ে OTP পাঠানো
  // ----------------------------------------------------
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      const msg = result.error.format().email?._errors[0] || "Invalid email";
      setErrors({ email: msg });
      toast.error(msg);
      return;
    }

    setLoading(true);

    await authClient.emailOtp.sendVerificationOtp(
      { email, type: "forget-password" },
      {
        onSuccess: () => {
          setLoading(false);
          setStep(2);
          toast.success("OTP sent to your email!");
        },
        onError: (ctx) => {
          setLoading(false);
          toast.error(ctx.error.message || "Failed to send OTP.");
        },
      }
    );
  };

  // ----------------------------------------------------
  // STEP 2: OTP ভ্যালিডেট করা
  // ----------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // ১. Zod দিয়ে ক্লায়েন্ট-সাইড OTP ফরম্যাট চেক করা
    const result = otpSchema.safeParse({ otp });
    if (!result.success) {
      const msg = result.error.format().otp?._errors[0] || "Invalid OTP";
      setErrors({ otp: msg });
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      // ২. সার্ভারে OTP সঠিক এবং মেয়াদের মধ্যে আছে কিনা ভেরিফাই করা
      const { data, error } = await authClient.emailOtp.checkVerificationOtp({
        email: email,
        type: "forget-password",
        otp: otp,
      });

      if (error) {
        setLoading(false);
        const errorMsg = error.message || "Invalid or expired OTP code";
        setErrors({ otp: errorMsg });
        toast.error(errorMsg);
        return;
      }

      if (data) {
        setLoading(false);
        setStep(3); // OTP ভেরিফাইড হলে স্টেপ ৩-এ (Password Reset) নিয়ে যাবে
        toast.success("OTP verified! Now enter your new password.");
      }
    } catch (err: any) {
      setLoading(false);
      toast.error("Failed to verify OTP. Please try again.");
    }
  };

  // ----------------------------------------------------
  // STEP 3: পাসওয়ার্ড রিসেট সাবমিট করা
  // ----------------------------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      const formatted = result.error.format();
      const fieldErrors: { [key: string]: string } = {};

      if (formatted.newPassword?._errors[0]) fieldErrors.newPassword = formatted.newPassword._errors[0];
      if (formatted.confirmPassword?._errors[0]) fieldErrors.confirmPassword = formatted.confirmPassword._errors[0];

      setErrors(fieldErrors);
      toast.error(fieldErrors.newPassword || fieldErrors.confirmPassword || "Validation failed");
      return;
    }

    setLoading(true);

    await authClient.emailOtp.resetPassword(
      { email, otp, password: newPassword },
      {
        onSuccess: () => {
          setLoading(false);
          setSuccess(true);
          toast.success("Password reset successfully!");
          setTimeout(() => router.push("/login"), 2500);
        },
        onError: (ctx) => {
          setLoading(false);
          toast.error(ctx.error.message || "Failed to reset password.");
        },
      }
    );
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-2xl shadow-purple-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {step === 1 && "Enter your email to receive an OTP code"}
            {step === 2 && "Enter the OTP code sent to your email"}
            {step === 3 && "Set your new account password"}
          </p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Password Changed!</h3>
            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
              Your password has been reset successfully. Redirecting to login page...
            </p>
          </div>
        ) : (
          <>
            {/* ---------------- STEP 1: EMAIL INPUT ---------------- */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 dark:text-slate-400">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail size={18} className="absolute left-3.5 text-purple-500" />
                    <input
                      type="email"
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
                      } bg-purple-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:bg-white dark:bg-slate-900 dark:text-white`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? "Sending OTP..." : "Send OTP"} <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* ---------------- STEP 2: OTP INPUT ---------------- */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
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
                  {errors.otp && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">{errors.otp}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"} <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* ---------------- STEP 3: PASSWORDS SETTING ---------------- */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 dark:text-slate-400">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-3.5 text-purple-500" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
                      }}
                      className={`w-full rounded-xl border ${
                        errors.newPassword
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-200 focus:border-purple-500 dark:border-slate-800 dark:focus:border-purple-400"
                      } bg-purple-50/50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition-all focus:bg-white dark:bg-slate-900 dark:text-white`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 dark:text-slate-400">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-3.5 text-purple-500" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }}
                      className={`w-full rounded-xl border ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-200 focus:border-purple-500 dark:border-slate-800 dark:focus:border-purple-400"
                      } bg-purple-50/50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition-all focus:bg-white dark:bg-slate-900 dark:text-white`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Reset Password"} <ArrowRight size={16} />
                </button>
              </form>
            )}
          </>
        )}

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-purple-600 hover:underline dark:text-purple-400">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}