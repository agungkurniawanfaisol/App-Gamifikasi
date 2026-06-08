"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, Eye, Key, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  createExternalApiToken,
  deleteExternalApiToken,
  revealExternalApiTokenSecret,
  rotateExternalApiToken,
  saveGlobalCorsOriginsAction,
  toggleExternalApiToken,
  type ExternalApiTokenListItem,
} from "@/actions/admin/api-tokens";
import { ALL_API_SCOPES } from "@/lib/external-api-token";
import { labels } from "@/lib/labels";
import { FormattedDateTime } from "@/components/ui/formatted-date-time";
import { storeConsoleToken } from "@/components/admin/api-gateway-console";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ApiTokenManager({
  tokens: initialTokens,
  corsOrigins: initialCors,
}: {
  tokens: ExternalApiTokenListItem[];
  corsOrigins: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [secretDialog, setSecretDialog] = useState<{
    title: string;
    hint: string;
    plaintext: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([...ALL_API_SCOPES]);
  const [corsOrigins, setCorsOrigins] = useState(initialCors.join(", "));

  function toggleScope(scope: string) {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  function handleCreate(formData: FormData) {
    setError(null);
    selectedScopes.forEach((s) => formData.append("scopes", s));
    startTransition(async () => {
      const result = await createExternalApiToken(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCreateOpen(false);
      setSecretDialog({
        title: labels.admin.apiTokensCreatedTitle,
        hint: labels.admin.apiTokensCreatedHint,
        plaintext: result.plaintext,
      });
      router.refresh();
    });
  }

  function handleRotate(id: number) {
    startTransition(async () => {
      const result = await rotateExternalApiToken(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSecretDialog({
        title: labels.admin.apiTokensRotatedTitle,
        hint: labels.admin.apiTokensRotatedHint,
        plaintext: result.plaintext,
      });
      router.refresh();
    });
  }

  function saveCors() {
    const fd = new FormData();
    fd.set("origins", corsOrigins);
    startTransition(async () => {
      await saveGlobalCorsOriginsAction(fd);
      router.refresh();
    });
  }

  function handleReveal(token: ExternalApiTokenListItem) {
    setError(null);
    if (!token.hasStoredSecret) {
      setError(labels.admin.apiTokensRevealUnavailable);
      return;
    }
    startTransition(async () => {
      const result = await revealExternalApiTokenSecret(token.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSecretDialog({
        title: labels.admin.apiTokensRevealedTitle,
        hint: labels.admin.apiTokensRevealedHint,
        plaintext: result.plaintext,
      });
    });
  }

  async function copySecret(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        {labels.admin.apiTokensSecurityWarning}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            {labels.admin.apiTokensDescription}
          </p>
          <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
            <Link href="/admin/api-tokens/audit">{labels.admin.apiTokensAllActivity}</Link>
          </Button>
        </div>
        <Button
          type="button"
          className="min-h-11 w-full sm:w-auto"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-2 size-4" />
          {labels.admin.apiTokensCreate}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {initialTokens.length === 0 ? (
        <EmptyState
          icon={Key}
          title={labels.admin.apiTokensEmpty}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {initialTokens.map((token) => (
            <li
              key={token.id}
              className="rounded-lg border p-4 sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{token.name}</span>
                    {!token.isActive && (
                      <Badge variant="outline">{labels.admin.userInactive}</Badge>
                    )}
                    <Badge variant="secondary" className="font-normal">
                      {labels.admin.apiTokensUsageToday(token.dailyUsed, token.dailyQuota)}
                    </Badge>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {labels.admin.apiTokensPrefix}: {token.tokenPrefix}…
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {token.scopes.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {labels.admin.apiTokensLastUsed}:{" "}
                    {token.lastUsedAt ? (
                      <FormattedDateTime value={token.lastUsedAt} />
                    ) : (
                      labels.admin.apiTokensNever
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                    disabled={pending}
                    onClick={() => handleReveal(token)}
                  >
                    <Eye className="mr-1 size-3" />
                    {labels.admin.apiTokensShowToken}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                  >
                    <Link href={`/admin/api-tokens/${token.id}/audit`}>
                      {labels.admin.apiTokensAudit}
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                    disabled={pending}
                    onClick={() => handleRotate(token.id)}
                  >
                    <RefreshCw className="mr-1 size-3" />
                    {labels.admin.apiTokensRotate}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await toggleExternalApiToken(token.id, !token.isActive);
                        router.refresh();
                      })
                    }
                  >
                    {token.isActive
                      ? labels.admin.apiTokensRevoke
                      : labels.admin.apiTokensActivate}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-11 text-destructive"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await deleteExternalApiToken(token.id);
                        router.refresh();
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="space-y-3 rounded-lg border p-4 sm:p-6">
        <h3 className="text-sm font-semibold">{labels.admin.apiTokensCorsTitle}</h3>
        <p className="text-sm text-muted-foreground">
          {labels.admin.apiTokensCorsHint}
        </p>
        <Textarea
          value={corsOrigins}
          onChange={(e) => setCorsOrigins(e.target.value)}
          placeholder={labels.admin.apiTokensAllowedOriginsPlaceholder}
          rows={3}
        />
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full sm:w-auto"
          disabled={pending}
          onClick={saveCors}
        >
          {labels.admin.apiTokensCorsSave}
        </Button>
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="flex max-h-[92dvh] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
          <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
            <DialogTitle>{labels.admin.apiTokensCreate}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate(new FormData(e.currentTarget));
            }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="token-name">{labels.admin.apiTokensName}</Label>
                <Input
                  id="token-name"
                  name="name"
                  required
                  placeholder={labels.admin.apiTokensNamePlaceholder}
                  className="min-h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>{labels.admin.apiTokensScopes}</Label>
                <div className="flex flex-col gap-2">
                  {ALL_API_SCOPES.map((scope) => (
                    <label key={scope} className="flex min-h-11 items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope)}
                        onChange={() => toggleScope(scope)}
                        className="size-4"
                      />
                      <span className="text-sm capitalize">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="token-origins">{labels.admin.apiTokensAllowedOrigins}</Label>
                <Input
                  id="token-origins"
                  name="allowedOrigins"
                  placeholder={labels.admin.apiTokensAllowedOriginsPlaceholder}
                  className="min-h-11"
                />
                <p className="text-xs text-muted-foreground">
                  {labels.admin.apiTokensAllowedOriginsHint}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="token-expiry">{labels.admin.apiTokensExpiry}</Label>
                <Input
                  id="token-expiry"
                  name="expiresAt"
                  type="datetime-local"
                  className="min-h-11"
                />
                <p className="text-xs text-muted-foreground">{labels.admin.apiTokensExpiryHint}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="token-daily-quota">{labels.admin.apiTokensDailyQuota}</Label>
                <Input
                  id="token-daily-quota"
                  name="dailyQuota"
                  type="number"
                  min={1}
                  placeholder={labels.admin.apiTokensDailyQuotaPlaceholder}
                  className="min-h-11"
                />
                <p className="text-xs text-muted-foreground">
                  {labels.admin.apiTokensDailyQuotaHint}
                </p>
              </div>
            </div>
            <DialogFooter className="shrink-0 flex-col-reverse gap-2 border-t bg-background px-4 py-4 sm:flex-row sm:px-6">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full sm:w-auto"
                onClick={() => setCreateOpen(false)}
              >
                {labels.common.cancel}
              </Button>
              <Button
                type="submit"
                disabled={pending || selectedScopes.length === 0}
                className="min-h-11 w-full sm:w-auto"
              >
                {labels.admin.apiTokensCreate}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!secretDialog} onOpenChange={() => setSecretDialog(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl sm:w-full">
          <DialogHeader>
            <DialogTitle>{secretDialog?.title}</DialogTitle>
            <DialogDescription>{secretDialog?.hint}</DialogDescription>
          </DialogHeader>
          <pre className="overflow-x-auto rounded-lg border bg-muted p-3 font-mono text-xs break-all">
            {secretDialog?.plaintext}
          </pre>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={() => secretDialog && copySecret(secretDialog.plaintext)}
            >
              <Copy className="mr-2 size-4" />
              {copied ? labels.admin.apiTokensCopied : labels.admin.apiTokensCopy}
            </Button>
            <Button
              type="button"
              className="min-h-11 w-full sm:w-auto"
              onClick={() => {
                if (secretDialog) {
                  storeConsoleToken(secretDialog.plaintext);
                }
                setSecretDialog(null);
              }}
            >
              {labels.admin.apiTokensUseInConsole}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
