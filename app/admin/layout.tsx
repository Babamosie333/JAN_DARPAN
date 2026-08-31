import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/issues", label: "Issues" },
  { href: "/admin/areas", label: "Areas" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
      <aside>
        <div className="mb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-saffron-ink bg-saffron-tint px-3 py-1.5 rounded-pill">
            Admin
          </span>
        </div>
        <nav className="flex md:flex-col gap-1 flex-wrap">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-sm text-sm font-medium text-ink-soft hover:bg-line-soft hover:text-ink transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
