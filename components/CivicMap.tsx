"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { WARD_COORDS, KANPUR_CENTER } from "@/lib/wardCoords";

// Leaflet touches `window`, so the map must be client-only and loaded dynamically.
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((m) => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

type Area = {
  id: string;
  name: string;
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
  ["accessibility", "Accessibility"],
];

function scoreTone(score: number) {
  if (score >= 75) return "#138A4B";
  if (score >= 55) return "#E89A3C";
  return "#D94A4A";
}

function valueForFilter(area: Area, filter: string) {
  return filter === "overall" ? area.score : area.categories[filter];
}

export default function CivicMap({ areas }: { areas: Area[] }) {
  const [filter, setFilter] = useState("overall");

  return (
    <div className="bg-bg-raised border border-line rounded-md p-5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <span className="text-sm font-semibold">View by</span>
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

      <div className="h-[440px] rounded-sm overflow-hidden">
        <MapContainer
          center={KANPUR_CENTER}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {areas.map((area) => {
            const coords = WARD_COORDS[area.id];
            if (!coords) return null;
            const val = valueForFilter(area, filter);
            const tone = scoreTone(val);
            return (
              <CircleMarker
                key={area.id}
                center={coords}
                radius={20}
                pathOptions={{ color: tone, fillColor: tone, fillOpacity: 0.35, weight: 2 }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-bold mb-1">{area.name}</div>
                    <div className="font-mono mb-1">
                      {val}
                      {filter === "overall" ? "/100" : ""}
                    </div>
                    <div className="text-xs text-ink-faint mb-2">
                      {area.activeIssues} active · {area.resolvedThisMonth} resolved this month
                    </div>
                    <Link href={`/areas/${area.id}`} className="text-blue text-xs font-semibold">
                      Explore area →
                    </Link>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="flex gap-4 flex-wrap mt-4 text-xs text-ink-soft">
        <Legend color="#138A4B" label="Healthy" />
        <Legend color="#E89A3C" label="Needs Attention" />
        <Legend color="#D94A4A" label="Critical" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
      {label}
    </span>
  );
}
