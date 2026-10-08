"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, UserPlus, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { checkUserExists } from "./action/user";

// Google SVG Icon
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

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // ১. Google Login Handler
  const handleGoogleSignUp = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign up with Google.");
    }
  };

  // ২. Email / Password Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Zod Validation
    const result = signUpSchema.safeParse({ name, email, password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      toast.error(fieldErrors.name?.[0] || fieldErrors.email?.[0] || fieldErrors.password?.[0] || "Validation failed");
      return;
    }

    setLoading(true);

    try {
      // Server Action দিয়ে ডাটাবেজ চেক
      const userExists = await checkUserExists(email);

      if (userExists) {
        setLoading(false);
        setErrors((prev) => ({
          ...prev,
          email: "User already exists with this email",
        }));
        toast.error("User already exists with this email!");
        return;
      }

      // Better Auth-এ ইউজার সাইনআপ
      await authClient.signUp.email(
        {
          email,
          password,
          name,
          callbackURL: "/dashboard",
        },
        {
          onSuccess: () => {
            setLoading(false);
            setSuccess(true);
            toast.success("Account created successfully! Please verify your email.");
          },
          onError: (ctx) => {
            setLoading(false);
            toast.error(ctx.error.message || "Failed to sign up.");
          },
        }
      );
    } catch (err: any) {
      setLoading(false);
      toast.error(err?.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-2xl shadow-purple-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30">
            <UserPlus size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Create an Account
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Join <span className="font-semibold text-purple-600">TravelX</span> and start your journey ✈️
          </p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Verification Email Sent!
            </h3>
            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
              We sent a link to{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {email}
              </span>
              . Please check your inbox to verify your account.
            </p>
          </div>
        ) : (
          <>
            {/* Google Sign-up Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80"
            >
              <GoogleIcon /> Continue with Google
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs uppercase text-slate-400 font-medium">Or</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <form onSubmit={handleSignUp} className="space-y-4" noValidate>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 dark:text-slate-400">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User size={18} className="absolute left-3.5 text-purple-500" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full rounded-xl border ${
                      errors.name
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-200 focus:border-purple-500 dark:border-slate-800 dark:focus:border-purple-400"
                    } bg-purple-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:bg-white dark:bg-slate-900 dark:text-white`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">{errors.name}</p>
                )}
              </div>

              {/* Email Address */}
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

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 dark:text-slate-400">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-purple-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`w-full rounded-xl border ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-200 focus:border-purple-500 dark:border-slate-800 dark:focus:border-purple-400"
                    } bg-purple-50/50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition-all focus:bg-white dark:bg-slate-900 dark:text-white`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Sign Up"} <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-purple-600 hover:underline dark:text-purple-400">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}