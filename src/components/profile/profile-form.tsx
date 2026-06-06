"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Save } from "lucide-react";
import { Gender } from "@prisma/client";
import { updateMyProfile } from "@/actions/profile";
import { UserAvatar } from "@/components/layout/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { labels } from "@/lib/labels";
import type { ProfileSummary } from "@/lib/user-profile";

function formatDateInput(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function ProfileForm({ profile }: { profile: ProfileSummary }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(profile.profileImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

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
      setSuccess(true);
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
    setSuccess(false);

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
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : labels.profile.saveFailed);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="surface-elevated overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">{labels.profile.photoSection}</h2>
          <p className="text-xs text-muted-foreground">{labels.profile.photoHint}</p>
        </div>
        <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          <UserAvatar name={profile.name} imageUrl={imageUrl} size="lg" />
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-4" />
              {uploading ? labels.profile.uploading : labels.profile.changePhoto}
            </Button>
          </div>
        </div>
      </div>

      <div className="surface-elevated overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">{labels.admin.profileSection}</h2>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="email">{labels.auth.email}</Label>
            <Input id="email" value={profile.email} disabled readOnly />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="name">{labels.admin.fullName}</Label>
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              defaultValue={profile.name}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">{labels.admin.phone}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dateOfBirth">{labels.admin.dateOfBirth}</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={formatDateInput(profile.dateOfBirth)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gender">{labels.admin.gender}</Label>
            <select
              id="gender"
              name="gender"
              className="native-select"
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
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="institution">{labels.admin.institution}</Label>
            <Input
              id="institution"
              name="institution"
              defaultValue={profile.institution ?? ""}
            />
          </div>
          {profile.role === "STUDENT" && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>{labels.admin.points}</Label>
              <Input value={profile.points} disabled readOnly />
            </div>
          )}
        </div>
      </div>

      <div className="surface-elevated overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">{labels.profile.passwordSection}</h2>
          <p className="text-xs text-muted-foreground">{labels.profile.passwordHint}</p>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{labels.admin.passwordOptional}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300" role="status">
          {labels.profile.saveSuccess}
        </p>
      )}

      <div className="flex justify-stretch sm:justify-end">
        <Button type="submit" disabled={pending || uploading} className="w-full gap-2 sm:w-auto">
          <Save className="size-4" />
          {labels.common.save}
        </Button>
      </div>
    </form>
  );
}
