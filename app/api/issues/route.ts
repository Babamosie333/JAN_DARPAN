import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Issue, { CATEGORY_KEYS, SEVERITY_LEVELS, AFFECTED_SCOPES } from "@/models/Issue";
import Area from "@/models/Area";
import CitizenProfile from "@/models/CitizenProfile";

// Mirrors the scoring logic from the original report.html computePriority()
function computePriority(severity: string, affected: string, people: number, category: string) {
  const sevScore = { Low: 20, Moderate: 45, High: 70, Critical: 90 }[severity] ?? 0;
  const affScore =
    { Me: 5, "My Street": 15, "My Neighbourhood": 25, "Large Public Area": 35 }[affected] ?? 0;
  const peopleBonus = people ? Math.min(15, Math.round(people / 20)) : 0;
  const catBonus = ["roads", "traffic", "water"].includes(category) ? 5 : 0;
  return Math.min(100, sevScore + affScore + peopleBonus + catBonus);
}

// GET /api/issues?areaId=&category=&status= — public, used by issues.html equivalent
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter: Record<string, string> = {};
  const areaId = searchParams.get("areaId");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  if (areaId) filter.areaId = areaId;
  if (category) filter.category = category;
  if (status) filter.status = status;

  const issues = await Issue.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ issues });
}

// POST /api/issues — requires sign-in. This is the real replacement for the
// old localStorage addReport() in app.js.
export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to report an issue." }, { status: 401 });
  }

  const body = await req.json();
  const { category, areaId, location, coords, description, photo, severity, affected, peopleAffected } =
    body;

  if (!CATEGORY_KEYS.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!areaId) {
    return NextResponse.json({ error: "areaId is required" }, { status: 400 });
  }
  if (!SEVERITY_LEVELS.includes(severity) || !AFFECTED_SCOPES.includes(affected)) {
    return NextResponse.json({ error: "Invalid severity or affected scope" }, { status: 400 });
  }

  await connectDB();

  const area = await Area.findOne({ id: areaId });
  if (!area) {
    return NextResponse.json({ error: "Area not found" }, { status: 404 });
  }

  const priority = computePriority(severity, affected, Number(peopleAffected) || 0, category);

  const categoryLabels: Record<string, string> = {
    roads: "Roads",
    cleanliness: "Cleanliness",
    lighting: "Street Lighting",
    water: "Water",
    greenery: "Greenery",
    traffic: "Traffic",
    accessibility: "Accessibility",
    services: "Public Services",
  };

  const issue = await Issue.create({
    title: `${categoryLabels[category]} Issue`,
    category,
    areaId,
    location: location || "Reported location",
    coords: Array.isArray(coords) && coords.length === 2 ? coords : undefined,
    description: description || "",
    photo: photo || null, // base64 data URL for now — see TODO in models/Issue.ts
    severity,
    affected,
    peopleAffected: Number(peopleAffected) || 0,
    priority,
    reportedBy: userId,
  });

  // Keep the area's activeIssues counter in sync, same as the old addReport() did.
  area.activeIssues += 1;
  await area.save();

  // Update (or create) this citizen's gamification profile.
  const profile = await CitizenProfile.findOneAndUpdate(
    { clerkId: userId },
    { $inc: { points: 15, reportedCount: 1 } },
    { upsert: true, new: true }
  );
  if (profile.azadiScore < 75) {
    profile.azadiScore = Math.min(75, profile.azadiScore + 1);
    await profile.save();
  }

  return NextResponse.json({ issue }, { status: 201 });
}
