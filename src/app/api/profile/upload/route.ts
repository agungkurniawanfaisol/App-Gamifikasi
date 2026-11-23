import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth-helpers";
import { validateUploadFile } from "@/lib/upload-security";

const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: number;
  try {
    userId = getUserId(session);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let validated;
  try {
    validated = await validateUploadFile(file, "image");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unsupported file type";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (validated.buffer.length > MAX_PROFILE_IMAGE_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const safeName = `avatar-${Date.now()}${validated.extension}`;
  const dir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "profiles",
    String(userId)
  );
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), validated.buffer);

  const url = `/uploads/profiles/${userId}/${safeName}`;

  await prisma.user.update({
    where: { id: userId },
    data: { profileImageUrl: url },
  });

  return NextResponse.json({ url });
}
