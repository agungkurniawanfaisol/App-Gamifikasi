import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { backupFilename, createDatabaseDump } from "@/lib/database-backup";
import { labels } from "@/lib/labels";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dump = await createDatabaseDump();
    return new NextResponse(new Uint8Array(dump), {
      status: 200,
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="${backupFilename()}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : labels.admin.databaseBackupError;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
