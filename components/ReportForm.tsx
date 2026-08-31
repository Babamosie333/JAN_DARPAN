"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";

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
const SEVERITIES = ["Low", "Moderate", "High", "Critical"];
const AFFECTED = ["Me", "My Street", "My Neighbourhood", "Large Public Area"];

function computePriority(severity: string, affected: string, people: number, category: string) {
  const sevScore = { Low: 20, Moderate: 45, High: 70, Critical: 90 }[severity] ?? 0;
  const affScore =
    { Me: 5, "My Street": 15, "My Neighbourhood": 25, "Large Public Area": 35 }[affected] ?? 0;
  const peopleBonus = people ? Math.min(15, Math.round(people / 20)) : 0;
  const catBonus = ["roads", "traffic", "water"].includes(category) ? 5 : 0;
  return Math.min(100, sevScore + affScore + peopleBonus + catBonus);
}

export default function ReportForm({
  areas,
  defaultAreaId,
}: {
  areas: { id: string; name: string }[];
  defaultAreaId?: string;
}) {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const [category, setCategory] = useState("");
  const [areaId, setAreaId] = useState(defaultAreaId || areas[0]?.id || "");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [severity, setSeverity] = useState("");
  const [affected, setAffected] = useState("");
  const [people, setPeople] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const priority = severity && affected ? computePriority(severity, affected, Number(people) || 0, category) : 0;

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      setPhotoUrl(null);
      setPhotoError(null);
      setUploadingPhoto(true);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Photo upload failed");
        setPhotoUrl(data.url);
      } catch (err) {
        setPhotoError(err instanceof Error ? err.message : "Photo upload failed");
        setPhotoPreview(null);
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !areaId || !severity || !affected) {
      setError("Please fill in category, area, severity, and affected scope.");
      return;
    }
    if (uploadingPhoto) {
      setError("Please wait for the photo to finish uploading.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          areaId,
          location: landmark,
          description,
          photo: photoUrl,
          severity,
          affected,
          peopleAffected: Number(people) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSuccess(true);
      setTimeout(() => router.push("/issues"), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SignedOut>
        <div className="bg-blue-tint text-blue text-sm rounded-md p-4">
          You need to{" "}
          <Link href="/sign-in" className="underline font-semibold">
            sign in
          </Link>{" "}
          to submit a report.
        </div>
      </SignedOut>

      <SignedIn>
        {success ? (
          <div className="bg-green-tint text-green-ink rounded-md p-4">
            Report submitted — redirecting to Issues…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-sm text-red bg-red-tint border border-red/20 rounded-sm px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`capitalize text-sm rounded-sm border px-3 py-2 text-left ${
                      category === c
                        ? "border-green bg-green-tint text-green-ink"
                        : "border-line hover:border-ink-faint"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Area</label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-bg-raised"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}, Kanpur
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near the school gate"
                className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-bg-raised"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-bg-raised resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Photo (optional)</label>
              <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm" />
              {uploadingPhoto && <p className="text-xs text-ink-faint mt-2">Uploading photo…</p>}
              {photoError && <p className="text-xs text-red mt-2">{photoError}</p>}
              {photoPreview && !uploadingPhoto && (
                <div className="mt-3">
                  <img
                    src={photoPreview}
                    alt="Selected issue photo preview"
                    className="w-full max-w-xs rounded-sm border border-line"
                  />
                  {photoUrl && (
                    <p className="text-xs text-green-ink mt-1">Uploaded ✓</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Severity</label>
              <div className="flex gap-2 flex-wrap">
                {SEVERITIES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`text-sm rounded-pill border px-3 py-1.5 ${
                      severity === s
                        ? "border-saffron bg-saffron-tint text-saffron-ink"
                        : "border-line hover:border-ink-faint"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Who's affected</label>
              <div className="flex gap-2 flex-wrap">
                {AFFECTED.map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setAffected(a)}
                    className={`text-sm rounded-pill border px-3 py-1.5 ${
                      affected === a
                        ? "border-blue bg-blue-tint text-blue"
                        : "border-line hover:border-ink-faint"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">People affected (approx.)</label>
              <input
                type="number"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                placeholder="e.g. 50"
                className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-bg-raised"
              />
            </div>

            {(severity || affected) && (
              <div className="flex items-center justify-between bg-line-soft rounded-sm px-4 py-3">
                <span className="text-sm text-ink-soft">Estimated Priority</span>
                <span className="font-mono font-bold">{priority}/100</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-saffron text-white font-semibold py-3 rounded-pill hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </form>
        )}
      </SignedIn>
    </>
  );
}
