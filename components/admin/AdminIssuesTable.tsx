"use client";

import { useState } from "react";

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
  createdAt: string;
};

const STATUS_OPTIONS = ["reported", "in-progress", "resolved", "rejected"];

const STATUS_STYLES: Record<string, string> = {
  reported: "bg-blue-tint text-blue",
  "in-progress": "bg-orange-tint text-saffron-ink",
  resolved: "bg-green-tint text-green-ink",
  rejected: "bg-red-tint text-red",
};

export default function AdminIssuesTable({ initialIssues }: { initialIssues: Issue[] }) {
  const [issues, setIssues] = useState(initialIssues);
  const [filterStatus, setFilterStatus] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = filterStatus === "all" ? issues : issues.filter((i) => i.status === filterStatus);

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Update failed");
      setIssues((prev) => prev.map((i) => (i._id === id ? { ...i, status } : i)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteIssue(id: string) {
    if (!confirm("Delete this issue permanently?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/issues/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
      setIssues((prev) => prev.filter((i) => i._id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-ink-soft">Filter:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-line rounded-sm px-2 py-1 text-sm bg-bg-raised"
        >
          <option value="all">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red bg-red-tint border border-red/20 rounded-sm px-3 py-2">
          {error}
        </div>
      )}

      <div className="overflow-x-auto border border-line rounded-md bg-bg-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-faint uppercase text-xs tracking-wide border-b border-line">
              <th className="p-3">Issue</th>
              <th className="p-3">Area</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Confirms</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((issue) => (
              <tr key={issue._id} className="border-b border-line-soft last:border-0">
                <td className="p-3">
                  <div className="font-medium">{issue.title}</div>
                  <div className="text-ink-faint text-xs">{issue.location}</div>
                </td>
                <td className="p-3">{issue.areaId}</td>
                <td className="p-3">{issue.severity}</td>
                <td className="p-3 font-mono">{issue.priority}</td>
                <td className="p-3 font-mono">{issue.confirms}</td>
                <td className="p-3">
                  <select
                    value={issue.status}
                    disabled={busyId === issue._id}
                    onChange={(e) => updateStatus(issue._id, e.target.value)}
                    className={`rounded-pill px-2 py-1 text-xs font-semibold border-0 ${STATUS_STYLES[issue.status]}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => deleteIssue(issue._id)}
                    disabled={busyId === issue._id}
                    className="text-red text-xs font-semibold hover:underline disabled:opacity-40"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-ink-faint">
                  No issues match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
