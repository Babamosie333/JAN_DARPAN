import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Area from "@/models/Area";

// GET /api/areas — public, used by areas.html/area.html equivalents
export async function GET() {
  await connectDB();
  const areas = await Area.find({}).sort({ score: -1 }).lean();
  return NextResponse.json({ areas });
}

// PATCH /api/areas — admin only, edit an area's scores/alerts/improvements
export async function PATCH(req: NextRequest) {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: "Area id is required" }, { status: 400 });
  }

  await connectDB();
  const updated = await Area.findOneAndUpdate({ id }, updates, { new: true }).lean();
  if (!updated) {
    return NextResponse.json({ error: "Area not found" }, { status: 404 });
  }
  return NextResponse.json({ area: updated });
}
