"use client";

import { useState } from "react";

type Area = {
  id: string;
  name: string;
  score: number;
  categories: Record<string, number>;
  activeIssues: number;
  resolvedThisMonth: number;
};

const CATEGORIES = [
  "roads",
  "cleanliness",
  "lighting",
  "water",
  "greenery",
  "traffic",
  "accessibility",
  "services",
];

export default function AdminAreasEditor({ initialAreas }: { initialAreas: Area[] }) {
  const [areas, setAreas] = useState(initialAreas);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  function updateCategory(areaId: string, cat: string, value: number) {
    setAreas((prev) =>
      prev.map((a) =>
        a.id === areaId ? { ...a, categories: { ...a.categories, [cat]: value } } : a
      )
    );
  }

  async function saveArea(area: Area) {
    setSaving(area.id);
    setSavedMsg(null);
    // Overall score recomputed as the average of category scores, matching the original design intent.
    const avg = Math.round(
      CATEGORIES.reduce((sum, c) => sum + area.categories[c], 0) / CATEGORIES.length
    );
    try {
      const res = await fetch("/api/areas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: area.id, categories: area.categories, score: avg }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      setAreas((prev) => prev.map((a) => (a.id === area.id ? { ...a, score: avg } : a)));
      setSavedMsg(`${area.name} saved.`);
    } catch (e) {
      setSavedMsg(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-3">
      {savedMsg && (
        <div className="text-sm text-green-ink bg-green-tint border border-green/20 rounded-sm px-3 py-2">
          {savedMsg}
        </div>
      )}

      {areas.map((area) => (
        <div key={area.id} className="border border-line rounded-md bg-bg-raised overflow-hidden">
          <button
            onClick={() => setExpandedId(expandedId === area.id ? null : area.id)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div>
              <div className="font-semibold">{area.name}</div>
              <div className="text-xs text-ink-faint">
                Score {area.score} · {area.activeIssues} active · {area.resolvedThisMonth} resolved this
                month
              </div>
            </div>
            <span className="text-ink-faint text-sm">{expandedId === area.id ? "▲" : "▼"}</span>
          </button>

          {expandedId === area.id && (
            <div className="p-4 border-t border-line-soft grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-3 text-sm">
                  <span className="w-28 capitalize text-ink-soft">{cat}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={area.categories[cat]}
                    onChange={(e) => updateCategory(area.id, cat, Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-8 font-mono text-right">{area.categories[cat]}</span>
                </label>
              ))}
              <div className="md:col-span-2">
                <button
                  onClick={() => saveArea(area)}
                  disabled={saving === area.id}
                  className="bg-green text-white text-sm font-semibold px-4 py-2 rounded-pill hover:opacity-90 disabled:opacity-50"
                >
                  {saving === area.id ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
