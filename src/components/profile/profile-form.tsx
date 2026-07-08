"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Lock, Save, User } from "lucide-react";
import { Gender } from "@prisma/client";
import { updateMyProfile } from "@/actions/profile";
import { UserAvatar } from "@/components/layout/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { labels } from "@/lib/labels";
import type { ProfileSummary } from "@/lib/user-profile";
import { cn } from "@/lib/utils";

function formatDateInput(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

type ProfileFormProps = {
  profile: ProfileSummary;
  variant?: "default" | "student";
  imageUrl?: string | null;
  onImageUrlChange?: (url: string) => void;
  hidePhotoSection?: boolean;
};

export function ProfileForm({
  profile,
  variant = "default",
  imageUrl: controlledImageUrl,
  onImageUrlChange,
  hidePhotoSection = false,
}: ProfileFormProps) {
  const isStudentLayout = variant === "student";
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [internalImageUrl, setInternalImageUrl] = useState(profile.profileImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = controlledImageUrl ?? internalImageUrl;
  const setImageUrl = onImageUrlChange ?? setInternalImageUrl;
  const showPhotoSection = !hidePhotoSection;

  const personalSectionTitle = isStudentLayout
    ? labels.profile.personalDataSection
    : labels.admin.profileSection;

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setPhotoSuccess(false);
    setSaveSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? labels.profile.uploadFailed);
      }

      setImageUrl(data.url);
      if (showPhotoSection) {
        setPhotoSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.profile.uploadFailed);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);
    setPhotoSuccess(false);

    const form = new FormData(e.currentTarget);
    const genderRaw = String(form.get("gender") ?? "");
    const gender =
      genderRaw === Gender.MALE || genderRaw === Gender.FEMALE
        ? genderRaw
        : undefined;

    startTransition(async () => {
      try {
        await updateMyProfile({
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          dateOfBirth: String(form.get("dateOfBirth") ?? ""),
          gender,
          institution: String(form.get("institution") ?? ""),
          studentId: String(form.get("studentId") ?? ""),
          profileImageUrl: imageUrl ?? "",
          password: String(form.get("password") ?? ""),
        });
        setSaveSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : labels.profile.saveFailed);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-5",
        !isStudentLayout && "mx-auto max-w-2xl gap-6"
      )}
    >
      {showPhotoSection ? (
      <div className="surface-elevated overflow-hidden">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Camera className="size-4 text-primary" />
            {labels.profile.photoSection}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {labels.profile.photoHint}
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          <UserAvatar name={profile.name} imageUrl={imageUrl} size="lg" />
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handlePhotoChange}
              aria-label={labels.profile.changePhoto}
            />
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full gap-2 sm:w-auto"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-4" />
              {uploading ? labels.profile.uploading : labels.profile.changePhoto}
            </Button>
            {photoSuccess && !pending ? (
              <p
                className="text-xs text-emerald-700 dark:text-emerald-300"
                role="status"
                aria-live="polite"
              >
                {labels.profile.photoUploadSuccess}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      ) : null}

      <div className="surface-elevated overflow-hidden">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <User className="size-4 text-primary" />
            {personalSectionTitle}
          </h2>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="email">{labels.auth.email}</Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              readOnly
              className="min-h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="name">{labels.admin.fullName}</Label>
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              defaultValue={profile.name}
              className="min-h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">{labels.admin.phone}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ""}
              className="min-h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dateOfBirth">{labels.admin.dateOfBirth}</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={formatDateInput(profile.dateOfBirth)}
              className="min-h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gender">{labels.admin.gender}</Label>
            <select
              id="gender"
              name="gender"
              className="native-select min-h-11"
              defaultValue={profile.gender ?? ""}
            >
              <option value="">{labels.admin.genderUnset}</option>
              <option value={Gender.MALE}>{labels.admin.genderMale}</option>
              <option value={Gender.FEMALE}>{labels.admin.genderFemale}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="studentId">{labels.admin.studentId}</Label>
            <Input
              id="studentId"
              name="studentId"
              defaultValue={profile.studentId ?? ""}
              className="min-h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="institution">{labels.admin.institution}</Label>
            <Input
              id="institution"
              name="institution"
              defaultValue={profile.institution ?? ""}
              className="min-h-11"
            />
          </div>
          {profile.role === "STUDENT" && !isStudentLayout && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>{labels.admin.points}</Label>
              <Input
                value={profile.points}
                disabled
                readOnly
                className="min-h-11"
              />
            </div>
          )}
        </div>
      </div>

      <div className="surface-elevated overflow-hidden">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Lock className="size-4 text-primary" />
            {labels.profile.passwordSection}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {labels.profile.passwordHint}
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{labels.admin.passwordOptional}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              autoComplete="new-password"
              className="min-h-11"
            />
          </div>
        </div>
      </div>

      {(error || saveSuccess) && (
        <div className="space-y-2" aria-live="polite">
          {error && (
            <p
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
          {saveSuccess && (
            <p
              className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
              role="status"
            >
              {labels.profile.saveSuccess}
            </p>
          )}
        </div>
      )}

      <div
        className={cn(
          "sticky bottom-4 z-10 rounded-xl border border-border bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80",
          isStudentLayout ? "sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none" : ""
        )}
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            disabled={pending || uploading}
            className="min-h-11 w-full gap-2 sm:w-auto"
          >
            <Save className="size-4" />
            {pending ? labels.admin.saving : labels.common.save}
          </Button>
        </div>
      </div>
    </form>
  );
}
