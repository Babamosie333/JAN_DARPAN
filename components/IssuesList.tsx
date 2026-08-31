"use client";

import { useState } from "react";
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

export default function IssuesList({ initialIssues }: { initialIssues: Issue[] }) {
  const { user, isSignedIn } = useUser();
  const [issues, setIssues] = useState(initialIssues);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red bg-red-tint border border-red/20 rounded-sm px-3 py-2">
          {error}
        </div>
      )}
      {issues.map((issue) => {
        const alreadyConfirmed = user ? issue.confirmedBy?.includes(user.id) : false;
        return (
          <div
            key={issue._id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-bg-raised border border-line rounded-md p-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              {issue.photo && (
                <img
                  src={issue.photo}
                  alt={issue.title}
                  className="w-14 h-14 rounded-sm object-cover flex-shrink-0 border border-line"
                />
              )}
              <div className="min-w-0">
                <div className="font-medium truncate">{issue.title}</div>
                <div className="text-xs text-ink-faint truncate">
                  {issue.location} · {issue.areaId} · {issue.severity}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-pill ${STATUS_STYLES[issue.status]}`}
              >
                {issue.status}
              </span>
              <span className="text-xs text-ink-faint">{issue.confirms} confirms</span>
              {isSignedIn ? (
                <button
                  onClick={() => confirm(issue._id)}
                  disabled={busyId === issue._id || alreadyConfirmed}
                  className="text-xs font-semibold text-green-ink border border-green/30 rounded-pill px-3 py-1 hover:bg-green-tint disabled:opacity-40"
                >
                  {alreadyConfirmed ? "Confirmed" : "Confirm"}
                </button>
              ) : (
                <Link href="/sign-in" className="text-xs text-blue hover:underline">
                  Sign in to confirm
                </Link>
              )}
            </div>
          </div>
        );
      })}
      {issues.length === 0 && <p className="text-ink-faint text-sm">No issues reported yet.</p>}
    </div>
  );
}
