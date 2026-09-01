"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/issues", label: "Issues", icon: "📌" },
  { href: "/admin/areas", label: "Areas", icon: "🗺️" },
  { href: "/admin/users", label: "Users", icon: "👥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-10 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
      <aside>
        <div className="mb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-saffron-ink bg-saffron-tint px-3 py-1.5 rounded-pill">
            Admin Panel
          </span>
        </div>
        <nav className="flex md:flex-col gap-1 flex-wrap bg-bg-raised border border-line rounded-md p-2 md:p-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm font-medium transition ${
                  active
                    ? "bg-ink text-white"
                    : "text-ink-soft hover:bg-line-soft hover:text-ink"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
