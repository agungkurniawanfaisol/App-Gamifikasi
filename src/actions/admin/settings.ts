"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  getGlobalCorsOrigins,
  setGlobalCorsOrigins,
} from "@/lib/external-api-cors";

export type SettingsOverview = {
  corsOrigins: string[];
  ollamaModel: string;
  ollamaBaseUrl: string;
  authUrl: string;
};

export async function getSettingsOverview(): Promise<SettingsOverview> {
  await requireAdmin();
  const corsOrigins = await getGlobalCorsOrigins();
  return {
    corsOrigins,
    ollamaModel: process.env.OLLAMA_MODEL ?? "qwen2.5:3b",
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://ollama:11434",
    authUrl:
      process.env.AUTH_URL ??
      process.env.NEXTAUTH_URL ??
      "http://localhost:3000",
  };
}

export async function saveSettingsCorsAction(
  formData: FormData
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const raw = formData.get("origins")?.toString() ?? "";
  const origins = raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  await setGlobalCorsOrigins(origins);
  revalidatePath("/admin/settings");
  revalidatePath("/admin/api-tokens");
  return { ok: true };
}
