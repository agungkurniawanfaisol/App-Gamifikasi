"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Database, KeyRound, Trophy } from "lucide-react";
import type { SettingsOverview } from "@/actions/admin/settings";
import { saveSettingsCorsAction } from "@/actions/admin/settings";
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
import { Textarea } from "@/components/ui/textarea";
import { labels } from "@/lib/labels";

export function SettingsPanel({ data }: { data: SettingsOverview }) {
  const [pending, startTransition] = useTransition();

  function handleCorsSubmit(formData: FormData) {
    startTransition(async () => {
      await saveSettingsCorsAction(formData);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base">{labels.admin.settingsCorsTitle}</CardTitle>
          <CardDescription>{labels.admin.settingsCorsDescription}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <form action={handleCorsSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="settings-cors-origins">
                {labels.admin.apiTokensCorsHint}
              </Label>
              <Textarea
                id="settings-cors-origins"
                name="origins"
                rows={3}
                defaultValue={data.corsOrigins.join(", ")}
                placeholder={labels.admin.apiTokensAllowedOriginsPlaceholder}
              />
            </div>
            <Button type="submit" disabled={pending} className="min-h-11 w-full sm:w-auto">
              {labels.admin.settingsCorsSave}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base">{labels.admin.settingsPlatformTitle}</CardTitle>
          <CardDescription>{labels.admin.settingsPlatformDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {labels.admin.settingsOllamaModel}
              </dt>
              <dd>
                <Input readOnly value={data.ollamaModel} className="bg-muted/50" />
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {labels.admin.settingsOllamaBaseUrl}
              </dt>
              <dd>
                <Input readOnly value={data.ollamaBaseUrl} className="bg-muted/50" />
              </dd>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {labels.admin.settingsAuthUrl}
              </dt>
              <dd>
                <Input readOnly value={data.authUrl} className="bg-muted/50" />
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
              <Link href="/admin/api-tokens">
                <KeyRound className="size-4" />
                {labels.admin.settingsManageApiTokens}
              </Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
              <Link href="/admin/gamification">
                <Trophy className="size-4" />
                {labels.admin.settingsManageGamification}
              </Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
              <Link href="/admin/database">
                <Database className="size-4" />
                {labels.admin.settingsManageDatabase}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
