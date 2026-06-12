export type AttachmentPreviewKind =
  | "pdf"
  | "pptx"
  | "image"
  | "download";

export function getAttachmentPreviewKind(mimeType: string): AttachmentPreviewKind {
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mimeType === "application/vnd.ms-powerpoint"
  ) {
    return "pptx";
  }
  if (mimeType.startsWith("image/")) return "image";
  return "download";
}

export function canInlinePreview(mimeType: string): boolean {
  const kind = getAttachmentPreviewKind(mimeType);
  return kind === "pdf" || kind === "pptx" || kind === "image";
}
