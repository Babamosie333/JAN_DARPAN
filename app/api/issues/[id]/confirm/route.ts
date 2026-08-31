import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import CitizenProfile from "@/models/CitizenProfile";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to confirm an issue." }, { status: 401 });
  }

  await connectDB();
  const issue = await Issue.findById(params.id);
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  if (issue.confirmedBy.includes(userId)) {
    return NextResponse.json({ error: "You already confirmed this issue." }, { status: 409 });
  }

  issue.confirmedBy.push(userId);
  issue.confirms += 1;
  await issue.save();

  await CitizenProfile.findOneAndUpdate(
    { clerkId: userId },
    { $inc: { points: 5, confirmedCount: 1 } },
    { upsert: true }
  );

  return NextResponse.json({ issue });
}
