"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  User,
  ChevronDown,
  MapPin,
  LogOut,
  Settings,
  Heart,
  UserPlus,
  LogIn,
  KeyRound,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  // =========================================================
  // STATES
  // =========================================================
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);

  // =========================================================
  // BETTER AUTH SESSION
  // =========================================================
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isLoggedIn = !!user;

  // =========================================================
  // REFS
  // =========================================================
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // =========================================================
  // NAVIGATION ITEMS
  // =========================================================
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Destinations", href: "/destinations" },
    { name: "Packages", href: "/packages" },
    { name: "About", href: "/about" },
  ];

  // =========================================================
  // DARK MODE TOGGLE
  // =========================================================
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // =========================================================
  // CLOSE PROFILE DROPDOWN ON OUTSIDE CLICK
  // =========================================================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================================================
  // SEARCH AUTO FOCUS
  // =========================================================
  useEffect(() => {
    if (!searchOpen) return;
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 200);

    return () => clearTimeout(timer);
  }, [searchOpen]);

  // =========================================================
  // HELPER FUNCTIONS
  // =========================================================
  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileAccountOpen(false);
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setProfileOpen(false);
          setMobileAccountOpen(false);
          setMobileOpen(false);
        },
      },
    });
  };

  const toggleDarkMode = () => setDark((prev) => !prev);
  const toggleSearch = () => setSearchOpen((prev) => !prev);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <nav className="mx-auto max-w-7xl rounded-2xl border border-slate-200/70 bg-white/80 shadow-xl shadow-purple-900/5 backdrop-blur-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/85">
        {/* =====================================================
            MAIN NAVBAR (DESKTOP & MOBILE HEADER)
        ===================================================== */}
        <div className="flex h-[70px] items-center justify-between px-4 sm:px-6">
          {/* LOGO */}
          <Link href="/" onClick={closeMobileMenu} className="group flex cursor-pointer items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-600 shadow-lg shadow-purple-500/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-105">
              <MapPin size={20} className="pointer-events-none text-white" />
            </div>
            <div className="leading-none">
              <span className="block text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Travel
                <span className="bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                  X
                </span>
              </span>
              <span className="hidden text-[9px] font-medium tracking-[0.25em] text-slate-400 sm:block">
                EXPLORE MORE
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-purple-50 hover:text-purple-600 dark:text-slate-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-2 md:flex">
            {/* SEARCH */}
            <div
              className={`flex items-center overflow-hidden rounded-xl border bg-purple-50/80 transition-all duration-300 dark:bg-slate-900/80 ${
                searchOpen ? "w-64 border-purple-200 dark:border-purple-500/30" : "w-10 border-transparent"
              }`}
            >
              <button
                type="button"
                onClick={toggleSearch}
                className="flex h-10 min-w-10 cursor-pointer items-center justify-center text-purple-600 transition-all duration-200 hover:text-purple-700 dark:text-purple-400"
                aria-label={searchOpen ? "Close search" : "Open search"}
              >
                {searchOpen ? (
                  <X size={18} className="pointer-events-none transition-transform duration-300 hover:rotate-90" />
                ) : (
                  <Search size={18} className="pointer-events-none" />
                )}
              </button>

              {searchOpen && (
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search destinations..."
                  className="w-full cursor-text bg-transparent pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />
              )}
            </div>

            {/* DARK MODE TOGGLE */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-purple-50 text-purple-600 transition-all duration-300 hover:bg-purple-100 dark:bg-slate-900 dark:text-yellow-400 dark:hover:bg-slate-800"
              aria-label="Toggle dark mode"
            >
              <span className={`pointer-events-none absolute transition-all duration-300 ${dark ? "rotate-0 scale-100" : "rotate-90 scale-0"}`}>
                <Sun size={18} />
              </span>
              <span className={`pointer-events-none absolute transition-all duration-300 ${dark ? "rotate-90 scale-0" : "rotate-0 scale-100"}`}>
                <Moon size={18} />
              </span>
            </button>

            {/* ACCOUNT DROPDOWN */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 p-1.5 pr-3 text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-purple-500/40"
              >
                {isLoggedIn ? (
                  user.image ? (
                    <Image src={user.image} alt={user.name || "User Avatar"} width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-xs font-bold uppercase">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                  )
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                    <User size={15} className="pointer-events-none" />
                  </div>
                )}

                <span className="hidden text-sm font-semibold xl:block">
                  {isLoggedIn ? user.name || "Profile" : "Account"}
                </span>

                <ChevronDown size={15} className={`pointer-events-none transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* DROPDOWN MENU */}
              {profileOpen && (
                <div className="absolute right-0 top-14 z-[100] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-purple-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
                  {isLoggedIn ? (
                    <>
                      <div className="mb-2 rounded-xl bg-gradient-to-r from-purple-50 to-fuchsia-50 p-3 dark:from-purple-500/10 dark:to-fuchsia-500/10">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <Image src={user.image} alt={user.name || "Profile"} width={40} height={40} className="h-10 w-10 shrink-0 rounded-full border border-purple-200 object-cover dark:border-purple-800" />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 font-bold text-white">
                              {user.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name || "Traveler"}</p>
                            <p className="truncate text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:text-slate-300 dark:hover:bg-purple-500/10">
                        <User size={17} /> My Profile
                      </Link>
                      <Link href="/favorites" onClick={() => setProfileOpen(false)} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:text-slate-300 dark:hover:bg-purple-500/10">
                        <Heart size={17} /> Favorites
                      </Link>
                      <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:text-slate-300 dark:hover:bg-purple-500/10">
                        <Settings size={17} /> Settings
                      </Link>
                      <Link href="/reset-password" onClick={() => setProfileOpen(false)} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:text-slate-300 dark:hover:bg-purple-500/10">
                        <KeyRound size={17} /> Reset Password
                      </Link>
                      <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />
                      <button type="button" onClick={handleLogout} className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
                        <LogOut size={17} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setProfileOpen(false)} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 transition-all hover:bg-purple-50 hover:text-purple-600 dark:text-slate-200 dark:hover:bg-purple-500/10">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                          <LogIn size={17} />
                        </div>
                        <div>
                          <p className="font-semibold">Login</p>
                          <p className="text-xs text-slate-400">Sign in to your account</p>
                        </div>
                      </Link>

                      <Link href="/signup" onClick={() => setProfileOpen(false)} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 transition-all hover:bg-purple-50 hover:text-purple-600 dark:text-slate-200 dark:hover:bg-purple-500/10">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white">
                          <UserPlus size={17} />
                        </div>
                        <div>
                          <p className="font-semibold">Sign Up</p>
                          <p className="text-xs text-slate-400">Create a new account</p>
                        </div>
                      </Link>

                      <Link href="/reset-password" onClick={() => setProfileOpen(false)} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 transition-all hover:bg-purple-50 hover:text-purple-600 dark:text-slate-200 dark:hover:bg-purple-500/10">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                          <KeyRound size={17} />
                        </div>
                        <div>
                          <p className="font-semibold">Reset Password</p>
                          <p className="text-xs text-slate-400">Forgot your password?</p>
                        </div>
                      </Link>

                      <div className="mt-2 rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-900">
                        <p className="text-xs text-slate-400">Join Travel<span className="text-purple-500">X</span> and explore more ✈️</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MOBILE ACTIONS TOGGLE */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-purple-50 text-purple-600 transition-all duration-300 hover:bg-purple-100 dark:bg-slate-900 dark:text-yellow-400 dark:hover:bg-slate-800"
              aria-label="Toggle dark mode"
            >
              <span className={`pointer-events-none absolute transition-all duration-300 ${dark ? "rotate-0 scale-100" : "rotate-90 scale-0"}`}>
                <Sun size={18} />
              </span>
              <span className={`pointer-events-none absolute transition-all duration-300 ${dark ? "rotate-90 scale-0" : "rotate-0 scale-100"}`}>
                <Moon size={18} />
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-all hover:bg-purple-100 dark:bg-slate-900 dark:text-purple-400"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={21} className="pointer-events-none" /> : <Menu size={21} className="pointer-events-none" />}
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU DRAWER
        ===================================================== */}
        <div className={`overflow-hidden transition-all duration-300 md:hidden ${mobileOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="border-t border-purple-100/70 px-4 pb-5 pt-4 dark:border-slate-800">
            {/* MOBILE SEARCH */}
            <div className="mb-4 flex items-center overflow-hidden rounded-xl border border-purple-100 bg-purple-50/70 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                <Search size={18} className="pointer-events-none text-purple-500" />
              </div>
              <input
                type="text"
                placeholder="Search destinations..."
                className="h-11 w-full bg-transparent pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </div>

            {/* MOBILE NAV LINKS */}
            <div className="mb-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-purple-50 hover:text-purple-600 dark:text-slate-200 dark:hover:bg-purple-500/10"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* MOBILE USER SECTION */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-xl bg-purple-50 p-3 dark:bg-purple-500/10">
                    {user.image ? (
                      <Image src={user.image} alt={user.name || "User Avatar"} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-sm font-bold text-white">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name || "Traveler"}</p>
                      <p className="truncate text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>

                  <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-purple-50 dark:text-slate-300 dark:hover:bg-slate-900">
                    <User size={17} /> Profile
                  </Link>
                  <Link href="/favorites" onClick={closeMobileMenu} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-purple-50 dark:text-slate-300 dark:hover:bg-slate-900">
                    <Heart size={17} /> Favorites
                  </Link>
                  <Link href="/settings" onClick={closeMobileMenu} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-purple-50 dark:text-slate-300 dark:hover:bg-slate-900">
                    <Settings size={17} /> Settings
                  </Link>
                  <Link href="/reset-password" onClick={closeMobileMenu} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-purple-50 dark:text-slate-300 dark:hover:bg-slate-900">
                    <KeyRound size={17} /> Reset Password
                  </Link>
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                    <LogOut size={17} /> Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" onClick={closeMobileMenu} className="flex items-center justify-center gap-2 rounded-xl bg-purple-50 py-3 text-sm font-semibold text-purple-600 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400">
                      <LogIn size={16} /> Login
                    </Link>
                    <Link href="/signup" onClick={closeMobileMenu} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20">
                      <UserPlus size={16} /> Sign Up
                    </Link>
                  </div>
                  <Link href="/reset-password" onClick={closeMobileMenu} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    <KeyRound size={16} /> Reset Password
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}