"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/areas", label: "Explore Areas" },
  { href: "/issues", label: "Issues" },
  { href: "/impact", label: "Impact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-bg-raised/90 backdrop-blur border-b border-line">
      <div className="max-w-[1180px] mx-auto px-4 md:px-6 flex items-center justify-between h-[68px]">
        <Link href="/" className="flex items-center gap-2 min-w-0" onClick={() => setMenuOpen(false)}>
          <Image
            src="/logo.png"
            alt="Jan Darpan logo"
            width={38}
            height={38}
            className="rounded-full flex-shrink-0"
            priority
          />
          <span className="flex flex-col leading-none min-w-0">
            <span className="font-display font-extrabold truncate">JAN DARPAN</span>
            <small className="text-[10px] font-normal text-ink-faint tracking-wide hidden sm:block">
              Your Voice. Our Responsibility. Better India.
            </small>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? "text-green-ink"
                  : "text-ink-soft hover:text-ink transition-colors"
              }
            >
              {item.label}
            </Link>
          ))}
          {role === "admin" && (
            <Link
              href="/admin"
              className="text-saffron-ink bg-saffron-tint px-3 py-1.5 rounded-pill text-xs font-semibold uppercase tracking-wide"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <SignedOut>
            <Link
              href="/sign-in"
              className="hidden sm:inline text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Log in
            </Link>
            <Link
              href="/report"
              className="bg-saffron text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-pill hover:opacity-90 transition whitespace-nowrap"
            >
              Report Issue
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/report"
              className="bg-saffron text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-pill hover:opacity-90 transition whitespace-nowrap"
            >
              Report Issue
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 -mr-2 text-ink-soft"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-line bg-bg-raised px-4 py-3 flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`py-2 text-sm font-medium ${
                pathname === item.href ? "text-green-ink" : "text-ink-soft"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-sm font-semibold text-saffron-ink"
            >
              Admin
            </Link>
          )}
          <SignedOut>
            <Link
              href="/sign-in"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-sm font-semibold text-ink-soft"
            >
              Log in
            </Link>
          </SignedOut>
        </nav>
      )}
    </header>
  );
}
