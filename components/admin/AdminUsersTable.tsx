"use client";

import { useState } from "react";

type UserRow = { id: string; name: string; email: string; role: string; points: number };

export default function AdminUsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleRole(user: UserRow) {
    const newRole = user.role === "admin" ? "citizen" : "admin";
    setBusyId(user.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Update failed");
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 text-sm text-red bg-red-tint border border-red/20 rounded-sm px-3 py-2">
          {error}
        </div>
      )}
      <div className="overflow-x-auto border border-line rounded-md bg-bg-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-faint uppercase text-xs tracking-wide border-b border-line">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Civic points</th>
              <th className="p-3">Role</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line-soft last:border-0">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-ink-soft">{u.email}</td>
                <td className="p-3 font-mono">{u.points}</td>
                <td className="p-3">
                  <span
                    className={`rounded-pill px-2 py-1 text-xs font-semibold ${
                      u.role === "admin" ? "bg-saffron-tint text-saffron-ink" : "bg-line-soft text-ink-soft"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleRole(u)}
                    disabled={busyId === u.id}
                    className="text-blue text-xs font-semibold hover:underline disabled:opacity-40"
                  >
                    {u.role === "admin" ? "Demote to citizen" : "Promote to admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
