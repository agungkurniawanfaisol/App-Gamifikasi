import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { importDatabaseDump } from "@/lib/database-backup";
import { labels } from "@/lib/labels";

const MAX_IMPORT_BYTES = 100 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const confirmed = formData.get("confirm") === "true";

  if (!confirmed) {
    return NextResponse.json(
      { error: labels.admin.databaseImportConfirmRequired },
      { status: 400 }
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: labels.admin.databaseImportFileRequired },
      { status: 400 }
    );
  }

  if (!file.name.toLowerCase().endsWith(".sql")) {
    return NextResponse.json(
      { error: labels.admin.databaseImportInvalidType },
      { status: 400 }
    );
  }

  if (file.size === 0 || file.size > MAX_IMPORT_BYTES) {
    return NextResponse.json(
      { error: labels.admin.databaseImportFileTooLarge },
      { status: 400 }
    );
  }

  try {
    const sql = Buffer.from(await file.arrayBuffer());
    await importDatabaseDump(sql);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : labels.admin.databaseImportError;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
