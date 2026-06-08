"use client";

import { useFormState } from "react-dom";
import { Gender } from "@prisma/client";
import { UserCircle } from "lucide-react";
import { registerAction } from "@/actions/register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { labels } from "@/lib/labels";

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
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

export function RegisterForm() {
  const [error, formAction, pending] = useFormState(registerAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserCircle className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{labels.register.accountSection}</h3>
            <p className="text-xs text-muted-foreground">
              {labels.register.requiredHint}
            </p>
          </div>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <FieldLabel htmlFor="email" required>
              {labels.auth.email}
            </FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={labels.auth.emailPlaceholder}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="password" required>
              {labels.auth.password}
            </FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              autoComplete="new-password"
              placeholder={labels.admin.passwordPlaceholder}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="confirmPassword" required>
              {labels.auth.confirmPassword}
            </FieldLabel>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <h3 className="text-sm font-semibold">{labels.register.profileSection}</h3>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <FieldLabel htmlFor="name" required>
              {labels.admin.fullName}
            </FieldLabel>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              minLength={2}
              placeholder={labels.admin.fullNamePlaceholder}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="phone">{labels.admin.phone}</FieldLabel>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={labels.admin.phonePlaceholder}
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="dateOfBirth">{labels.admin.dateOfBirth}</FieldLabel>
            <Input id="dateOfBirth" name="dateOfBirth" type="date" />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="gender">{labels.admin.gender}</FieldLabel>
            <select id="gender" name="gender" className="native-select" defaultValue="">
              <option value="">{labels.admin.genderUnset}</option>
              <option value={Gender.MALE}>{labels.admin.genderMale}</option>
              <option value={Gender.FEMALE}>{labels.admin.genderFemale}</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="studentId">{labels.admin.studentId}</FieldLabel>
            <Input
              id="studentId"
              name="studentId"
              placeholder={labels.admin.studentIdPlaceholder}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <FieldLabel htmlFor="institution">{labels.admin.institution}</FieldLabel>
            <Input
              id="institution"
              name="institution"
              placeholder={labels.admin.institutionPlaceholder}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full rounded-xl" size="lg" disabled={pending}>
        {pending ? labels.auth.signingUp : labels.register.submit}
      </Button>
    </form>
  );
}
