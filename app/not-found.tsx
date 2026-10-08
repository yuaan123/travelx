"use client";

import Link from "next/link";
import { MapPinOff, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[85vh] w-full items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-lg text-center">
        {/* BACKGROUND DECORATIVE BLUR GRADIENT */}
        <div className="absolute -top-10 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-tr from-purple-500/20 to-fuchsia-500/20 blur-3xl dark:from-purple-600/30 dark:to-fuchsia-600/30" />

        {/* MAIN CONTAINER */}
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-2xl shadow-purple-900/10 backdrop-blur-xl sm:p-12 dark:border-slate-800 dark:bg-slate-950/85">
          
          {/* ICON & 404 BADGE */}
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-600 text-white shadow-xl shadow-purple-500/30">
            <MapPinOff size={40} className="animate-pulse" />
            <span className="absolute -bottom-2 -right-2 rounded-lg bg-slate-900 px-2 py-0.5 text-[11px] font-black tracking-widest text-white shadow-md dark:bg-white dark:text-slate-900">
              404
            </span>
          </div>

          {/* HEADING & TEXT */}
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Page Not Found
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
            Oops! The destination you are looking for seems to have vanished off the map or doesn't exist anymore.
          </p>

          {/* ACTION BUTTONS */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:shadow-purple-500/40"
            >
              <Home size={16} />
              Back to Home
            </Link>
          </div>

          {/* SUBTEXT */}
          <p className="mt-8 text-xs text-slate-400 dark:text-slate-500">
            Lost in Travel<span className="text-purple-500 font-bold">X</span>? Let's get you back on track ✈️
          </p>
        </div>
      </div>
    </div>
  );
}