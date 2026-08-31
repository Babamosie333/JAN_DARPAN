import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";

// POST /api/upload — requires sign-in. Body: { image: "data:image/...;base64,..." }
// Returns { url } — a real Cloudinary-hosted URL, replacing the old base64-in-Mongo stub.
export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to upload a photo." }, { status: 401 });
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: "Cloudinary is not configured on the server (missing env vars)." },
      { status: 500 }
    );
  }

  const { image } = await req.json();
  if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
    return NextResponse.json({ error: "A valid base64 image data URL is required." }, { status: 400 });
  }

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: "jandarpan/issues",
      resource_type: "image",
      // Keep uploads reasonably sized — no need for full-resolution phone photos.
      transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto" }],
    });
    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
