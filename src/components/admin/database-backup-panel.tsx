"use client";

import { useRef, useState, useTransition } from "react";
import { AlertTriangle, Database, Download, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { labels } from "@/lib/labels";

function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/filename="([^"]+)"/);
  return match?.[1] ?? null;
}

export function DatabaseBackupPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [backupPending, startBackup] = useTransition();
  const [importPending, startImport] = useTransition();

  function handleBackup() {
    setBackupError(null);
    startBackup(async () => {
      try {
        const response = await fetch("/api/admin/database/backup");
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? labels.admin.databaseBackupError);
        }

        const blob = await response.blob();
        const filename =
          filenameFromDisposition(response.headers.get("Content-Disposition")) ??
          "gamifikasi-backup.sql";
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        setBackupError(
          error instanceof Error
            ? error.message
            : labels.admin.databaseBackupError
        );
      }
    });
  }

  function handleImport() {
    setImportError(null);
    setImportSuccess(false);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setImportError(labels.admin.databaseImportFileRequired);
      return;
    }

    if (!confirmed) {
      setImportError(labels.admin.databaseImportConfirmRequired);
      return;
    }

    startImport(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("confirm", "true");

        const response = await fetch("/api/admin/database/import", {
          method: "POST",
          body: formData,
        });

        const body = (await response.json().catch(() => null)) as {
          error?: string;
          ok?: boolean;
        } | null;

        if (!response.ok) {
          throw new Error(body?.error ?? labels.admin.databaseImportError);
        }

        setImportSuccess(true);
        setConfirmed(false);
        if (fileRef.current) {
          fileRef.current.value = "";
        }
      } catch (error) {
        setImportError(
          error instanceof Error
            ? error.message
            : labels.admin.databaseImportError
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertTitle>{labels.admin.databaseImportWarningTitle}</AlertTitle>
        <AlertDescription>
          {labels.admin.databaseImportWarning}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="size-5 text-primary" />
              {labels.admin.databaseBackupTitle}
            </CardTitle>
            <CardDescription>
              {labels.admin.databaseBackupDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <Button
              type="button"
              className="min-h-11 w-full sm:w-auto"
              disabled={backupPending}
              onClick={handleBackup}
            >
              <Download className="size-4" />
              {backupPending
                ? labels.admin.databaseBackupRunning
                : labels.admin.databaseDownloadBackup}
            </Button>
            {backupError && (
              <p className="text-sm text-destructive" role="alert">
                {backupError}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="size-5 text-primary" />
              {labels.admin.databaseImportTitle}
            </CardTitle>
            <CardDescription>
              {labels.admin.databaseImportDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="flex flex-col gap-2">
              <Label htmlFor="database-import-file">
                {labels.admin.databaseImportFile}
              </Label>
              <Input
                id="database-import-file"
                ref={fileRef}
                type="file"
                accept=".sql,application/sql,text/sql"
                className="min-h-11"
                disabled={importPending}
              />
            </div>

            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-1 size-4 shrink-0"
                disabled={importPending}
              />
              <span className="text-sm text-muted-foreground">
                {labels.admin.databaseImportConfirmLabel}
              </span>
            </label>

            <Button
              type="button"
              variant="destructive"
              className="min-h-11 w-full sm:w-auto"
              disabled={importPending}
              onClick={handleImport}
            >
              <Database className="size-4" />
              {importPending
                ? labels.admin.databaseImportRunning
                : labels.admin.databaseImportSubmit}
            </Button>

            {importSuccess && (
              <p className="text-sm text-primary" role="status">
                {labels.admin.databaseImportSuccess}
              </p>
            )}
            {importError && (
              <p className="text-sm text-destructive" role="alert">
                {importError}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
