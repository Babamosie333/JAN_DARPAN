import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Issue, { STATUS_VALUES } from "@/models/Issue";
import Area from "@/models/Area";

function requireAdmin() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
  return role === "admin";
}

// PATCH /api/issues/:id — admin only. Updates status (reported/in-progress/resolved/rejected).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { status, resolutionNote } = body;

  if (status && !STATUS_VALUES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectDB();
  const issue = await Issue.findById(params.id);
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  const wasUnresolved = issue.status !== "resolved";

  if (status) issue.status = status;
  if (resolutionNote !== undefined) issue.resolutionNote = resolutionNote;
  if (status === "resolved") issue.resolvedAt = new Date();

  await issue.save();

  // Keep the parent area's counters honest when an issue newly resolves.
  if (status === "resolved" && wasUnresolved) {
    await Area.findOneAndUpdate(
      { id: issue.areaId },
      { $inc: { activeIssues: -1, resolvedThisMonth: 1 } }
    );
  }

  return NextResponse.json({ issue });
}

// DELETE /api/issues/:id — admin only.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const issue = await Issue.findByIdAndDelete(params.id);
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  if (issue.status !== "resolved") {
    await Area.findOneAndUpdate({ id: issue.areaId }, { $inc: { activeIssues: -1 } });
  }

  return NextResponse.json({ success: true });
}
