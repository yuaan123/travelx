"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (token) {
      authClient.verifyEmail(
        { query: { token } },
        {
          onSuccess: () => {
            setStatus("success");
            toast.success("Email verified successfully!");
          },
          onError: (ctx) => {
            setStatus("error");
            toast.error(ctx.error.message || "Email verification failed.");
          },
        }
      );
    } else {
      setStatus("error");
    }
  }, [token]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/80 p-8 text-center shadow-2xl shadow-purple-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        {status === "loading" && (
          <div className="py-8">
            <Loader2 className="mx-auto h-12 w-12 text-purple-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifying your email...</h2>
            <p className="text-sm text-slate-500 mt-1">Please wait a moment while we process your request.</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Email Verified!</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6 dark:text-slate-400">
              Your email address has been verified successfully.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
            >
              Continue to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-6">
            <XCircle className="mx-auto h-14 w-14 text-red-500 mb-4" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verification Failed</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6 dark:text-slate-400">
              The verification link might be invalid or expired.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
            >
              Back to Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}