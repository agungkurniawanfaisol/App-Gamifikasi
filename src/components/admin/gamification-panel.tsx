"use client";

import { useTransition } from "react";
import { ChallengeRecurrence } from "@prisma/client";
import { Save, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import type { getGamificationOverview } from "@/actions/admin/gamification";
import {
  createAchievementDefinition,
  createChallengeTemplate,
  deleteAchievementDefinition,
  deleteCertificateTemplate,
  deleteChallengeTemplate,
  resetPointValues,
  savePointValues,
  toggleAchievementActive,
  toggleCertificateActive,
  toggleChallengeActive,
  updateChallengeReward,
} from "@/actions/admin/gamification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ScrollableTabsList,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { labels } from "@/lib/labels";

type GamificationData = Awaited<ReturnType<typeof getGamificationOverview>>;

export function GamificationPanel({ data }: { data: GamificationData }) {
  const [pending, startTransition] = useTransition();

  function handleDeleteChallenge(id: number) {
    if (!window.confirm(labels.admin.gamificationDeleteChallengeConfirm)) return;
    startTransition(async () => {
      const result = await deleteChallengeTemplate(id);
      if (!result.ok) toast.error(labels.admin.gamificationDeleteFailed);
    });
  }

  function handleDeleteAchievement(id: number) {
    if (!window.confirm(labels.admin.gamificationDeleteAchievementConfirm)) return;
    startTransition(async () => {
      const result = await deleteAchievementDefinition(id);
      if (!result.ok) toast.error(labels.admin.gamificationDeleteFailed);
    });
  }

  function handleDeleteCertificate(id: number) {
    if (!window.confirm(labels.admin.gamificationDeleteCertificateConfirm)) return;
    startTransition(async () => {
      const result = await deleteCertificateTemplate(id);
      if (!result.ok) toast.error(labels.admin.gamificationDeleteFailed);
    });
  }

  function handleResetPoints() {
    if (!window.confirm(labels.admin.gamificationResetPointsConfirm)) return;
    startTransition(async () => {
      const result = await resetPointValues();
      if (!result.ok) toast.error(labels.admin.gamificationDeleteFailed);
    });
  }

  return (
    <Tabs defaultValue="challenges" className="space-y-4">
      <ScrollableTabsList>
        <TabsList>
          <TabsTrigger value="challenges">
            {labels.admin.gamificationTabChallenges}
          </TabsTrigger>
          <TabsTrigger value="achievements">
            {labels.admin.gamificationTabAchievements}
          </TabsTrigger>
          <TabsTrigger value="certificates">
            {labels.admin.gamificationTabCertificates}
          </TabsTrigger>
          <TabsTrigger value="points">
            {labels.admin.gamificationTabPoints}
          </TabsTrigger>
        </TabsList>
      </ScrollableTabsList>

      <TabsContent value="challenges" className="space-y-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base">
              {labels.admin.gamificationCreateChallenge}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <form
              action={createChallengeTemplate}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="challenge-title">{labels.common.title}</Label>
                <Input id="challenge-title" name="title" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="challenge-slug">Slug</Label>
                <Input id="challenge-slug" name="slug" required />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="challenge-description">
                  {labels.common.content}
                </Label>
                <Textarea id="challenge-description" name="description" rows={2} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="challenge-recurrence">Recurrence</Label>
                <select
                  id="challenge-recurrence"
                  name="recurrence"
                  className="native-select"
                  defaultValue={ChallengeRecurrence.DAILY}
                >
                  <option value={ChallengeRecurrence.DAILY}>Daily</option>
                  <option value={ChallengeRecurrence.WEEKLY}>Weekly</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="challenge-reward">
                  {labels.admin.gamificationPointReward}
                </Label>
                <Input
                  id="challenge-reward"
                  name="pointReward"
                  type="number"
                  min={0}
                  defaultValue={20}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={pending} className="min-h-11">
                  {labels.admin.gamificationCreateChallenge}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <ul className="divide-y divide-border rounded-lg border border-border">
          {data.challenges.map((challenge) => (
            <li
              key={challenge.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{challenge.title}</p>
                <p className="text-sm text-muted-foreground">
                  {challenge.description}
                </p>
                <Badge
                  variant={challenge.isActive ? "default" : "outline"}
                  className="mt-2"
                >
                  {challenge.isActive
                    ? labels.admin.gamificationActive
                    : labels.admin.gamificationInactive}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  type="number"
                  min={0}
                  defaultValue={challenge.pointReward}
                  className="w-full sm:w-24"
                  onBlur={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!Number.isNaN(value)) {
                      startTransition(() =>
                        updateChallengeReward(challenge.id, value)
                      );
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => toggleChallengeActive(challenge.id))
                  }
                >
                  {challenge.isActive
                    ? labels.admin.unpublish
                    : labels.admin.publish}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="min-h-11"
                  disabled={pending}
                  onClick={() => handleDeleteChallenge(challenge.id)}
                >
                  <Trash2 className="size-4" />
                  {labels.admin.gamificationDelete}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="achievements" className="space-y-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base">
              {labels.admin.gamificationCreateAchievement}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <form
              action={createAchievementDefinition}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="achievement-title">{labels.common.title}</Label>
                <Input id="achievement-title" name="title" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="achievement-slug">Slug</Label>
                <Input id="achievement-slug" name="slug" required />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="achievement-description">
                  {labels.common.content}
                </Label>
                <Textarea
                  id="achievement-description"
                  name="description"
                  rows={2}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="groups-completed">Groups completed</Label>
                <Input
                  id="groups-completed"
                  name="groupsCompleted"
                  type="number"
                  min={1}
                  defaultValue={1}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bonus-points">
                  {labels.admin.gamificationPointReward}
                </Label>
                <Input
                  id="bonus-points"
                  name="bonusPoints"
                  type="number"
                  min={0}
                  defaultValue={15}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={pending} className="min-h-11">
                  {labels.admin.gamificationCreateAchievement}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <ul className="divide-y divide-border rounded-lg border border-border">
          {data.achievements.map((achievement) => (
            <li
              key={achievement.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium">
                  <Trophy className="size-4 text-amber-500" />
                  {achievement.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                <Badge
                  variant={achievement.isActive ? "default" : "outline"}
                  className="mt-2"
                >
                  {achievement.isActive
                    ? labels.admin.gamificationActive
                    : labels.admin.gamificationInactive}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => toggleAchievementActive(achievement.id))
                  }
                >
                  {achievement.isActive
                    ? labels.admin.unpublish
                    : labels.admin.publish}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={pending}
                  onClick={() => handleDeleteAchievement(achievement.id)}
                >
                  <Trash2 className="size-4" />
                  {labels.admin.gamificationDelete}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="certificates" className="space-y-4">
        <ul className="divide-y divide-border rounded-lg border border-border">
          {data.certificates.map((certificate) => (
            <li
              key={certificate.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{certificate.title}</p>
                <p className="text-sm text-muted-foreground">
                  {certificate.subtitle}
                  {certificate.level
                    ? ` · ${certificate.level.name}`
                    : ""}
                </p>
                <Badge
                  variant={certificate.isActive ? "default" : "outline"}
                  className="mt-2"
                >
                  {certificate.isActive
                    ? labels.admin.gamificationActive
                    : labels.admin.gamificationInactive}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => toggleCertificateActive(certificate.id))
                  }
                >
                  {certificate.isActive
                    ? labels.admin.unpublish
                    : labels.admin.publish}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={pending}
                  onClick={() => handleDeleteCertificate(certificate.id)}
                >
                  <Trash2 className="size-4" />
                  {labels.admin.gamificationDelete}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="points">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base">
              {labels.admin.gamificationTabPoints}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <form
              key={JSON.stringify(data.pointValues)}
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                startTransition(async () => {
                  await savePointValues({
                    materialComplete: parseInt(
                      String(form.get("materialComplete") ?? "0"),
                      10
                    ),
                    correctAnswer: parseInt(
                      String(form.get("correctAnswer") ?? "0"),
                      10
                    ),
                    onTimeBonus: parseInt(
                      String(form.get("onTimeBonus") ?? "0"),
                      10
                    ),
                    discussionMilestone: parseInt(
                      String(form.get("discussionMilestone") ?? "0"),
                      10
                    ),
                    groupComplete: parseInt(
                      String(form.get("groupComplete") ?? "0"),
                      10
                    ),
                  });
                });
              }}
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="materialComplete">
                  {labels.points.materialComplete(0)}
                </Label>
                <Input
                  id="materialComplete"
                  name="materialComplete"
                  type="number"
                  min={0}
                  defaultValue={data.pointValues.materialComplete}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="correctAnswer">
                  {labels.points.correctAnswer(0)}
                </Label>
                <Input
                  id="correctAnswer"
                  name="correctAnswer"
                  type="number"
                  min={0}
                  defaultValue={data.pointValues.correctAnswer}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="onTimeBonus">
                  {labels.points.onTimeBonus(0)}
                </Label>
                <Input
                  id="onTimeBonus"
                  name="onTimeBonus"
                  type="number"
                  min={0}
                  defaultValue={data.pointValues.onTimeBonus}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="discussionMilestone">
                  {labels.points.discussion(0)}
                </Label>
                <Input
                  id="discussionMilestone"
                  name="discussionMilestone"
                  type="number"
                  min={0}
                  defaultValue={data.pointValues.discussionMilestone}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="groupComplete">
                  {labels.points.groupComplete(0)}
                </Label>
                <Input
                  id="groupComplete"
                  name="groupComplete"
                  type="number"
                  min={0}
                  defaultValue={data.pointValues.groupComplete}
                />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={pending}
                  onClick={handleResetPoints}
                >
                  {labels.admin.gamificationResetPoints}
                </Button>
                <Button type="submit" disabled={pending} className="min-h-11 w-full sm:w-auto">
                  <Save className="size-4" />
                  {labels.admin.gamificationSavePoints}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
