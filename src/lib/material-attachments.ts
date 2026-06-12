import { z } from "zod";

export const MAX_MATERIAL_ATTACHMENTS = 10;

export const materialAttachmentSchema = z.object({
  id: z.string().uuid(),
  url: z
    .string()
    .min(1)
    .refine(
      (url) => url.startsWith("/uploads/") && !url.includes(".."),
      "Invalid attachment URL"
    ),
  mimeType: z.string().min(1).max(127),
  fileName: z.string().min(1).max(200),
  sizeBytes: z.number().int().positive(),
});

export type MaterialAttachment = z.infer<typeof materialAttachmentSchema>;

export const materialAttachmentsSchema = z
  .array(materialAttachmentSchema)
  .max(MAX_MATERIAL_ATTACHMENTS);

export function parseMaterialAttachments(value: unknown): MaterialAttachment[] {
  if (value == null) return [];
  const parsed = materialAttachmentsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function serializeMaterialAttachmentsForDb(
  attachments: MaterialAttachment[]
): MaterialAttachment[] {
  const parsed = materialAttachmentsSchema.parse(attachments);
  return parsed;
}
