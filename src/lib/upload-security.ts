import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { prisma } from "@/lib/prisma";

export type UploadCategory = "image" | "audio" | "document";

export type ValidatedUpload = {
  category: UploadCategory;
  mimeType: string;
  extension: string;
  buffer: Buffer;
  displayName: string;
  maxBytes: number;
};

const BLOCKED_MIMES = new Set([
  "text/html",
  "image/svg+xml",
  "application/javascript",
  "text/javascript",
  "application/x-php",
  "application/x-httpd-php",
  "application/x-sh",
  "application/x-msdownload",
  "application/vnd.microsoft.portable-executable",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/gzip",
  "application/x-7z-compressed",
]);

const IMAGE_MIMES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const AUDIO_MIMES: Record<string, string> = {
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/webm": ".webm",
};

const DOCUMENT_MIMES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "text/plain": ".txt",
  "video/mp4": ".mp4",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;
const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MAX_PPTX_BYTES = 50 * 1024 * 1024;
const MAX_DOCX_BYTES = 25 * 1024 * 1024;
const MAX_TXT_BYTES = 2 * 1024 * 1024;
const MAX_MP4_BYTES = 50 * 1024 * 1024;

function sanitizeDisplayName(name: string): string {
  const base = path.basename(name).replace(/\0/g, "").trim();
  const cleaned = base.replace(/[^\w.\-() ]+/g, "_").slice(0, 200);
  return cleaned || "file";
}

function isPdf(buffer: Buffer): boolean {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString("utf8") === "%PDF-";
}

function isPlainText(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, Math.min(buffer.length, 512));
  for (const byte of sample) {
    if (byte === 0) return false;
    if (byte < 9 || (byte > 13 && byte < 32 && byte !== 27)) return false;
  }
  return true;
}

function zipEntryName(buffer: Buffer, entry: string): boolean {
  const needle = Buffer.from(entry, "utf8");
  return buffer.includes(needle);
}

function detectOfficeZipKind(
  buffer: Buffer
): "pptx" | "docx" | "xlsx" | null {
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) return null;
  if (zipEntryName(buffer, "ppt/")) return "pptx";
  if (zipEntryName(buffer, "word/")) return "docx";
  if (zipEntryName(buffer, "xl/")) return "xlsx";
  return null;
}

function detectMime(buffer: Buffer): string | null {
  if (isPdf(buffer)) return "application/pdf";
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 6 &&
    (buffer.subarray(0, 6).toString("ascii") === "GIF87a" ||
      buffer.subarray(0, 6).toString("ascii") === "GIF89a")
  ) {
    return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(4, 8).toString("ascii") === "ftyp"
  ) {
    const brand = buffer.subarray(8, 12).toString("ascii");
    if (brand.startsWith("mp4") || brand.startsWith("isom")) {
      return "video/mp4";
    }
  }
  if (buffer.length >= 3 && buffer.subarray(0, 3).toString("ascii") === "ID3") {
    return "audio/mpeg";
  }
  if (
    buffer.length >= 2 &&
    buffer[0] === 0xff &&
    (buffer[1] & 0xe0) === 0xe0
  ) {
    return "audio/mpeg";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WAVE"
  ) {
    return "audio/wav";
  }
  if (buffer.length >= 4 && buffer.subarray(0, 4).toString("ascii") === "OggS") {
    return "audio/ogg";
  }
  const office = detectOfficeZipKind(buffer);
  if (office === "pptx") {
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }
  if (office === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (office === "xlsx") {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))
  ) {
    return "application/vnd.ms-powerpoint";
  }
  if (isPlainText(buffer)) return "text/plain";
  return null;
}

function maxBytesForMime(mimeType: string, category: UploadCategory): number {
  if (category === "image") return MAX_IMAGE_BYTES;
  if (category === "audio") return MAX_AUDIO_BYTES;
  if (mimeType === "application/pdf") return MAX_PDF_BYTES;
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mimeType === "application/vnd.ms-powerpoint"
  ) {
    return MAX_PPTX_BYTES;
  }
  if (mimeType === "video/mp4") return MAX_MP4_BYTES;
  if (mimeType === "text/plain") return MAX_TXT_BYTES;
  return MAX_DOCX_BYTES;
}

function classifyMime(
  mimeType: string,
  allowed: UploadCategory
): { category: UploadCategory; extension: string } | null {
  if (BLOCKED_MIMES.has(mimeType)) return null;

  if (allowed === "image" || allowed === "document") {
    const ext = IMAGE_MIMES[mimeType];
    if (ext) return { category: "image", extension: ext };
  }

  if (allowed === "audio") {
    const ext = AUDIO_MIMES[mimeType];
    if (ext) return { category: "audio", extension: ext };
  }

  if (allowed === "document") {
    const ext = DOCUMENT_MIMES[mimeType];
    if (ext) return { category: "document", extension: ext };
  }

  return null;
}

export async function validateGroupAccess(
  groupId: number,
  levelId?: number
): Promise<boolean> {
  if (!Number.isInteger(groupId) || groupId <= 0) return false;
  if (levelId != null && (!Number.isInteger(levelId) || levelId <= 0)) {
    return false;
  }

  const group = await prisma.learningGroup.findFirst({
    where: levelId != null ? { id: groupId, levelId } : { id: groupId },
    select: { id: true },
  });
  return Boolean(group);
}

export function parsePositiveInt(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function validateUploadFile(
  file: File,
  allowed: UploadCategory
): Promise<ValidatedUpload> {
  if (!(file instanceof File)) {
    throw new Error("Invalid file");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    throw new Error("File is empty");
  }

  const mimeType = detectMime(buffer);
  if (!mimeType) {
    throw new Error("Unsupported or unrecognized file type");
  }

  const classified = classifyMime(mimeType, allowed);
  if (!classified) {
    throw new Error("Unsupported file type");
  }

  const maxBytes = maxBytesForMime(mimeType, classified.category);
  if (buffer.length > maxBytes) {
    throw new Error("File too large");
  }

  return {
    category: classified.category,
    mimeType,
    extension: classified.extension,
    buffer,
    displayName: sanitizeDisplayName(file.name),
    maxBytes,
  };
}

export async function saveValidatedUpload(
  validated: ValidatedUpload,
  groupId: number,
  subfolder?: "documents"
): Promise<{ url: string; safeName: string }> {
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${validated.extension}`;
  const dirParts = ["public", "uploads", String(groupId)];
  if (subfolder === "documents") {
    dirParts.push("documents");
  }
  const dir = path.join(process.cwd(), ...dirParts);
  await mkdir(dir, { recursive: true });

  const filePath = path.join(dir, safeName);
  await writeFile(filePath, validated.buffer);

  const urlParts = ["/uploads", String(groupId)];
  if (subfolder === "documents") {
    urlParts.push("documents");
  }
  urlParts.push(safeName);

  return { url: urlParts.join("/"), safeName };
}
