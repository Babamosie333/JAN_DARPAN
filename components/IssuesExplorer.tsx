"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

type Issue = {
  _id: string;
  title: string;
  category: string;
  areaId: string;
  location: string;
  severity: string;
  priority: number;
  status: string;
  confirms: number;
  confirmedBy: string[];
  photo?: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  reported: "bg-blue-tint text-blue",
  "in-progress": "bg-orange-tint text-saffron-ink",
  resolved: "bg-green-tint text-green-ink",
  rejected: "bg-red-tint text-red",
};

const TABS: [string, (i: Issue) => boolean][] = [
  ["All", () => true],
  ["Critical", (i) => i.severity === "Critical"],
  ["High Priority", (i) => i.priority >= 70],
  ["Active", (i) => i.status !== "resolved"],
  ["Resolved", (i) => i.status === "resolved"],
];

export default function IssuesExplorer({ initialIssues }: { initialIssues: Issue[] }) {
  const { user, isSignedIn } = useUser();
  const [issues, setIssues] = useState(initialIssues);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const tabFn = TABS.find(([label]) => label === tab)?.[1] ?? (() => true);
    const q = query.trim().toLowerCase();
    return issues.filter(
      (i) => tabFn(i) && (i.title.toLowerCase().includes(q) || i.location.toLowerCase().includes(q))
    );
  }, [issues, query, tab]);

  async function confirm(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/issues/${id}/confirm`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not confirm");
      setIssues((prev) => prev.map((i) => (i._id === id ? data.issue : i)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="bg-bg-raised border border-line rounded-md p-4 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search issue…"
          className="w-full border border-line rounded-pill px-4 py-2.5 text-sm mb-3 bg-bg"
        />
        <div className="flex gap-2 flex-wrap">
          {TABS.map(([label]) => (
            <button
              key={label}
              onClick={() => setTab(label)}
              className={`text-xs font-medium px-3 py-1.5 rounded-pill border ${
                tab === label
                  ? "bg-ink text-white border-ink"
                  : "border-line text-ink-soft hover:border-ink-faint"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red bg-red-tint border border-red/20 rounded-sm px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((issue) => {
          const alreadyConfirmed = user ? issue.confirmedBy?.includes(user.id) : false;
          return (
            <div key={issue._id} className="bg-bg-raised border border-line rounded-md overflow-hidden">
              {issue.photo && (
                <img src={issue.photo} alt={issue.title} className="w-full h-36 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] bg-line-soft text-ink-soft px-2 py-0.5 rounded-pill capitalize">
                    {issue.category}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-pill capitalize ${STATUS_STYLES[issue.status]}`}
                  >
                    {issue.status}
                  </span>
                </div>
                <h4 className="font-semibold text-sm">{issue.title}</h4>
                <p className="text-xs text-ink-faint mt-0.5">{issue.location}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-mono text-sm font-bold">{issue.priority}/100</span>
                  <span className="text-xs text-ink-faint">{issue.confirms} confirmations</span>
                </div>
                <div className="mt-3">
                  {isSignedIn ? (
                    <button
                      onClick={() => confirm(issue._id)}
                      disabled={busyId === issue._id || alreadyConfirmed}
                      className="w-full text-xs font-semibold text-green-ink border border-green/30 rounded-pill px-3 py-1.5 hover:bg-green-tint disabled:opacity-40"
                    >
                      {alreadyConfirmed ? "Confirmed" : "Confirm"}
                    </button>
                  ) : (
                    <Link
                      href="/sign-in"
                      className="block text-center text-xs text-blue hover:underline"
                    >
                      Sign in to confirm
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-ink-faint text-sm col-span-full text-center py-10">
            No issues match this search/filter.
          </p>
        )}
      </div>
    </div>
  );
}
