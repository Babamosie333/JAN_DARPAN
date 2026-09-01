"use client";

import { useRef, useState } from "react";
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
const CATEGORY_LABELS: Record<string, string> = {
  roads: "Roads",
  cleanliness: "Cleanliness",
  lighting: "Street Lighting",
  water: "Water",
  greenery: "Greenery",
  traffic: "Traffic",
  accessibility: "Accessibility",
  services: "Public Services",
};
const SEVERITIES = ["Low", "Moderate", "High", "Critical"];
const AFFECTED = ["Me", "My Street", "My Neighbourhood", "Large Public Area"];
const STEPS = ["Issue", "Evidence", "Location", "Details", "Review"];

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);

  const [category, setCategory] = useState("");
  const [areaId, setAreaId] = useState(defaultAreaId || areas[0]?.id || "");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [affected, setAffected] = useState("");
  const [people, setPeople] = useState("");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const priority =
    severity && affected ? computePriority(severity, affected, Number(people) || 0, category) : 0;

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
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function canProceed() {
    if (step === 0) return !!category;
    if (step === 2) return !!areaId;
    if (step === 3) return !!severity && !!affected;
    return true;
  }

  function next() {
    setError(null);
    if (!canProceed()) {
      setError("Please complete this step before continuing.");
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit() {
    if (!category || !areaId || !severity || !affected) {
      setError("Please go back and complete all required fields.");
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
      setTimeout(() => router.push("/issues"), 1400);
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
          <div className="bg-green-tint text-green-ink rounded-md p-6 text-center">
            <div className="text-2xl mb-2">✓</div>
            <p className="font-semibold">Report submitted</p>
            <p className="text-sm mt-1">Priority score: {priority}/100 — redirecting to Issues…</p>
          </div>
        ) : (
          <div>
            {/* Step progress */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      i < step
                        ? "bg-green text-white"
                        : i === step
                        ? "bg-ink text-white"
                        : "bg-line-soft text-ink-faint"
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      i === step ? "text-ink" : "text-ink-faint"
                    }`}
                  >
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <div className="w-4 h-px bg-line" />}
                </div>
              ))}
            </div>

            {error && (
              <div className="text-sm text-red bg-red-tint border border-red/20 rounded-sm px-3 py-2 mb-5">
                {error}
              </div>
            )}

            {/* Step 0: Issue */}
            {step === 0 && (
              <div>
                <h2 className="font-bold mb-4">What&apos;s the issue?</h2>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`text-sm rounded-sm border px-3 py-2.5 text-left ${
                        category === c
                          ? "border-green bg-green-tint text-green-ink"
                          : "border-line hover:border-ink-faint"
                      }`}
                    >
                      {CATEGORY_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Evidence */}
            {step === 1 && (
              <div>
                <h2 className="font-bold mb-4">Show us the problem</h2>
                <div className="bg-bg-raised border border-dashed border-line rounded-md p-6 text-center">
                  <div className="flex justify-center gap-3 mb-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-ink text-white text-sm font-semibold px-5 py-2.5 rounded-pill"
                    >
                      Take a Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-line text-sm font-semibold px-5 py-2.5 rounded-pill"
                    >
                      Upload Photo
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhoto}
                    className="hidden"
                  />
                  <p className="text-xs text-ink-faint">
                    A photo helps verifiers confirm the issue faster — but it&apos;s optional.
                  </p>

                  {uploadingPhoto && <p className="text-xs text-ink-faint mt-3">Uploading photo…</p>}
                  {photoError && <p className="text-xs text-red mt-3">{photoError}</p>}
                  {photoPreview && !uploadingPhoto && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={photoPreview}
                        alt="Selected issue photo preview"
                        className="max-h-48 rounded-sm border border-line"
                      />
                    </div>
                  )}
                  {photoUrl && <p className="text-xs text-green-ink mt-2">Uploaded ✓</p>}
                </div>
                <button
                  type="button"
                  onClick={next}
                  className="text-sm font-semibold text-ink-soft mt-4 underline"
                >
                  Skip — continue without a photo
                </button>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-bold mb-1">Where is this happening?</h2>
                <div>
                  <label className="block text-sm font-semibold mb-2">Area</label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    className="w-full border border-line rounded-sm px-3 py-2.5 text-sm bg-bg-raised"
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
                    className="w-full border border-line rounded-sm px-3 py-2.5 text-sm bg-bg-raised"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-bold mb-1">Tell us more</h2>
                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-line rounded-sm px-3 py-2.5 text-sm bg-bg-raised resize-y"
                  />
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
                  <label className="block text-sm font-semibold mb-2">Who&apos;s affected</label>
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
                  <label className="block text-sm font-semibold mb-2">
                    People affected (approx.)
                  </label>
                  <input
                    type="number"
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full border border-line rounded-sm px-3 py-2.5 text-sm bg-bg-raised"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="font-bold mb-1">Review your report</h2>
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Issue photo"
                    className="w-full max-h-56 object-cover rounded-sm border border-line"
                  />
                )}
                <div className="bg-bg-raised border border-line rounded-md divide-y divide-line-soft text-sm">
                  <ReviewRow label="Category" value={CATEGORY_LABELS[category] || "—"} />
                  <ReviewRow
                    label="Area"
                    value={areas.find((a) => a.id === areaId)?.name || "—"}
                  />
                  <ReviewRow label="Landmark" value={landmark || "—"} />
                  <ReviewRow label="Severity" value={severity || "—"} />
                  <ReviewRow label="Affected" value={affected || "—"} />
                  <ReviewRow label="People affected" value={people || "0"} />
                </div>
                <div className="flex items-center justify-between bg-line-soft rounded-sm px-4 py-3">
                  <span className="text-sm text-ink-soft">Estimated Priority</span>
                  <span className="font-mono font-bold">{priority}/100</span>
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="bg-line-soft text-ink px-5 py-2.5 rounded-pill font-semibold text-sm disabled:opacity-40"
              >
                Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="bg-ink text-white px-6 py-2.5 rounded-pill font-semibold text-sm"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-saffron text-white px-6 py-2.5 rounded-pill font-semibold text-sm disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit Report"}
                </button>
              )}
            </div>
          </div>
        )}
      </SignedIn>
    </>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-4 py-2.5">
      <span className="text-ink-faint">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
