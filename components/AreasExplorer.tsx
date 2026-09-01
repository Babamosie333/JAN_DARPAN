"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CivicMap from "@/components/CivicMap";

type Area = {
  id: string;
  name: string;
  city: string;
  score: number;
  delta: number;
  categories: Record<string, number>;
  activeIssues: number;
  resolvedThisMonth: number;
};

const FILTERS: [string, string][] = [
  ["overall", "Overall"],
  ["roads", "Roads"],
  ["cleanliness", "Cleanliness"],
  ["water", "Water"],
  ["greenery", "Greenery"],
  ["lighting", "Lighting"],
  ["traffic", "Traffic"],
];

function healthLabel(score: number) {
  if (score >= 75) return { text: "Healthy", cls: "bg-green-tint text-green-ink" };
  if (score >= 55) return { text: "Needs Attention", cls: "bg-orange-tint text-saffron-ink" };
  return { text: "Critical", cls: "bg-red-tint text-red" };
}

export default function AreasExplorer({ areas }: { areas: Area[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("overall");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return areas.filter((a) => a.name.toLowerCase().includes(q));
  }, [areas, query]);

  const sorted = useMemo(() => {
    const val = (a: Area) => (filter === "overall" ? a.score : a.categories[filter]);
    return [...filtered].sort((a, b) => val(b) - val(a));
  }, [filtered, filter]);

  return (
    <div>
      <div className="bg-bg-raised border border-line rounded-md p-4 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search locality…"
          className="w-full border border-line rounded-pill px-4 py-2.5 text-sm mb-3 bg-bg"
        />
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-pill border ${
                filter === key
                  ? "bg-ink text-white border-ink"
                  : "border-line text-ink-soft hover:border-ink-faint"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <CivicMap areas={filtered} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((area) => {
          const health = healthLabel(area.score);
          const displayVal = filter === "overall" ? area.score : area.categories[filter];
          return (
            <Link
              key={area.id}
              href={`/areas/${area.id}`}
              className="block bg-bg-raised border border-line rounded-md p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-lg">{area.name}</h3>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-pill ${health.cls}`}>
                  {health.text}
                </span>
              </div>
              <div className="text-xs text-ink-faint mb-3">{area.city}</div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-mono font-bold text-3xl">{displayVal}</span>
                <span className="text-ink-faint text-sm">/100</span>
                <span className="text-green-ink text-xs font-semibold ml-auto">
                  {area.delta >= 0 ? "+" : ""}
                  {area.delta} this month
                </span>
              </div>
              <div className="flex justify-between text-sm text-ink-soft border-t border-line-soft pt-3">
                <span>{area.activeIssues} active issues</span>
                <span>{area.resolvedThisMonth} resolved</span>
              </div>
            </Link>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-ink-faint text-sm col-span-full text-center py-10">
            No localities match &quot;{query}&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
