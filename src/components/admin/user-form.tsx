"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { Gender, Role } from "@prisma/client";
import { Save, UserCircle, X } from "lucide-react";
import {
  createUser,
  updateUser,
  type UserDetail,
  type UserFormInput,
} from "@/actions/admin/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { labels } from "@/lib/labels";

function formatDateInput(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      {required && (
        <span className="ms-1 text-destructive" aria-hidden="true">
          *
        </span>
      )}
    </Label>
  );
}

export function UserForm({ user }: { user?: UserDetail }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = !!user;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const genderRaw = String(form.get("gender") ?? "");
    const payload: UserFormInput = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      dateOfBirth: String(form.get("dateOfBirth") ?? ""),
      gender:
        genderRaw === Gender.MALE || genderRaw === Gender.FEMALE
          ? genderRaw
          : "",
      institution: String(form.get("institution") ?? ""),
      studentId: String(form.get("studentId") ?? ""),
      role: String(form.get("role") ?? Role.STUDENT) as Role,
      isActive: form.get("isActive") === "on",
      password: String(form.get("password") ?? ""),
    };

    startTransition(async () => {
      try {
        if (isEdit && user) {
          await updateUser(user.id, payload);
        } else {
          await createUser(payload);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save user.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="surface-elevated overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserCircle className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold">{labels.admin.accountSection}</h3>
            <p className="text-xs text-muted-foreground">
              {labels.auth.email} &amp; {labels.auth.password}
            </p>
          </div>
        </div>
        <p className="border-b border-border px-5 pb-3 text-xs text-muted-foreground">
          {labels.admin.requiredFieldHint}
        </p>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <FieldLabel htmlFor="email" required>
              {labels.auth.email}
            </FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={user?.email ?? ""}
              placeholder={labels.auth.emailPlaceholder}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <FieldLabel htmlFor="password" required={!isEdit}>
              {isEdit ? labels.admin.passwordOptional : labels.admin.password}
            </FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              required={!isEdit}
              minLength={isEdit ? undefined : 6}
              placeholder={labels.admin.passwordPlaceholder}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="role" required>
              {labels.admin.userRole}
            </FieldLabel>
            <select
              id="role"
              name="role"
              className="native-select"
              defaultValue={user?.role ?? Role.STUDENT}
            >
              <option value={Role.STUDENT}>{labels.admin.filterStudents}</option>
              <option value={Role.ADMIN}>{labels.admin.filterAdmins}</option>
            </select>
          </div>
          <div className="flex items-end gap-2 pb-1">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              defaultChecked={user?.isActive ?? true}
              className="size-4 rounded border-border"
            />
            <Label htmlFor="isActive" className="cursor-pointer font-normal">
              {labels.admin.userActive}
            </Label>
          </div>
        </div>
      </div>

      <div className="surface-elevated overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold">{labels.admin.profileSection}</h3>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <FieldLabel htmlFor="name" required>
              {labels.admin.fullName}
            </FieldLabel>
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              defaultValue={user?.name ?? ""}
              placeholder={labels.admin.fullNamePlaceholder}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="phone">{labels.admin.phone}</FieldLabel>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={user?.phone ?? ""}
              placeholder={labels.admin.phonePlaceholder}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="dateOfBirth">{labels.admin.dateOfBirth}</FieldLabel>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={formatDateInput(user?.dateOfBirth ?? null)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="gender">{labels.admin.gender}</FieldLabel>
            <select
              id="gender"
              name="gender"
              className="native-select"
              defaultValue={user?.gender ?? ""}
            >
              <option value="">{labels.admin.genderUnset}</option>
              <option value={Gender.MALE}>{labels.admin.genderMale}</option>
              <option value={Gender.FEMALE}>{labels.admin.genderFemale}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="studentId">{labels.admin.studentId}</FieldLabel>
            <Input
              id="studentId"
              name="studentId"
              defaultValue={user?.studentId ?? ""}
              placeholder={labels.admin.studentIdPlaceholder}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <FieldLabel htmlFor="institution">{labels.admin.institution}</FieldLabel>
            <Input
              id="institution"
              name="institution"
              defaultValue={user?.institution ?? ""}
              placeholder={labels.admin.institutionPlaceholder}
            />
          </div>
          {isEdit && user && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>{labels.admin.points}</Label>
              <Input value={user.points} disabled readOnly />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={pending} className="gap-2">
          <Save className="size-4" />
          {labels.common.save}
        </Button>
        <Button type="button" variant="outline" asChild className="gap-2">
          <Link href="/admin/users">
            <X className="size-4" />
            {labels.common.cancel}
          </Link>
        </Button>
      </div>
    </form>
  );
}
