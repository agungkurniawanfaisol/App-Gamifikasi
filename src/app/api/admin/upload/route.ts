import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import {
  parsePositiveInt,
  saveValidatedUpload,
  validateGroupAccess,
  validateUploadFile,
} from "@/lib/upload-security";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const groupId = parsePositiveInt(formData.get("groupId"));
  const levelId = parsePositiveInt(formData.get("levelId"));

  if (!(file instanceof File) || !groupId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const hasAccess = await validateGroupAccess(groupId, levelId ?? undefined);
  if (!hasAccess) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  try {
    let validated;
    try {
      validated = await validateUploadFile(file, "image");
    } catch {
      validated = await validateUploadFile(file, "audio");
    }

    const saved = await saveValidatedUpload(validated, groupId);
    return NextResponse.json({ url: saved.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
