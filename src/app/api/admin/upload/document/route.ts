import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import {
  parsePositiveInt,
  saveValidatedUpload,
  validateGroupAccess,
  validateUploadFile,
} from "@/lib/upload-security";
import { labels } from "@/lib/labels";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const groupId = parsePositiveInt(formData.get("groupId"));
  const levelId = parsePositiveInt(formData.get("levelId"));

  if (!(file instanceof File) || !groupId || !levelId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const hasAccess = await validateGroupAccess(groupId, levelId);
  if (!hasAccess) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  try {
    const validated = await validateUploadFile(file, "document");
    const saved = await saveValidatedUpload(validated, groupId, "documents");

    return NextResponse.json({
      attachment: {
        id: randomUUID(),
        url: saved.url,
        mimeType: validated.mimeType,
        fileName: validated.displayName,
        sizeBytes: validated.buffer.length,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : labels.admin.attachmentUploadError;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
