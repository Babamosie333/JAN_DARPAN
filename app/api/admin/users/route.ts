import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import CitizenProfile from "@/models/CitizenProfile";

function requireAdmin() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
  return role === "admin";
}

// GET /api/admin/users — list all Clerk users merged with their civic profile
export async function GET() {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: clerkUsers } = await clerkClient.users.getUserList({ limit: 200 });
  await connectDB();
  const profiles = (await CitizenProfile.find({}).lean()) as any[];
  const profileMap = new Map(profiles.map((p) => [p.clerkId, p]));

  const users = clerkUsers.map((u) => ({
    id: u.id,
    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.username || "Unnamed",
    email: u.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: u.imageUrl,
    role: (u.publicMetadata as { role?: string })?.role ?? "citizen",
    profile: profileMap.get(u.id) ?? null,
  }));

  return NextResponse.json({ users });
}

// PATCH /api/admin/users — { userId, role: "admin" | "citizen" }
export async function PATCH(req: NextRequest) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, role } = await req.json();
  if (!userId || !["admin", "citizen"].includes(role)) {
    return NextResponse.json({ error: "userId and a valid role are required" }, { status: 400 });
  }

  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });

  return NextResponse.json({ success: true });
}