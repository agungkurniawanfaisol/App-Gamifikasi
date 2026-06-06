import Link from "next/link";
import { QuestionFormat, QuestionSkill } from "@prisma/client";
import {
  groupEditPath,
  newMaterialPath,
  newQuestionFormatPath,
  newQuestionFormPath,
  newQuestionPath,
  newQuestionSkillPath,
} from "@/lib/content-routes";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";
import { BookOpen, Headphones, HelpCircle, Mic, Pencil } from "lucide-react";

export function TypePicker({
  levelId,
  groupId,
}: {
  levelId: number;
  groupId: number;
}) {
  const listPath = groupEditPath(levelId, groupId);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">{labels.admin.pickType}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href={newMaterialPath(levelId, groupId)}
          className="rounded-lg border border-border bg-card p-6 text-left shadow-sm transition-colors hover:border-primary"
        >
          <BookOpen className="mb-3 size-8 text-primary" />
          <p className="font-semibold">{labels.admin.typeMaterial}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {labels.admin.typeMaterialDesc}
          </p>
        </Link>
        <Link
          href={newQuestionPath(levelId, groupId)}
          className="rounded-lg border border-border bg-card p-6 text-left shadow-sm transition-colors hover:border-primary"
        >
          <HelpCircle className="mb-3 size-8 text-primary" />
          <p className="font-semibold">{labels.admin.typeQuestion}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {labels.admin.typeQuestionDesc}
          </p>
        </Link>
      </div>
      <Button variant="outline" asChild>
        <Link href={listPath}>{labels.common.cancel}</Link>
      </Button>
    </div>
  );
}

export function SkillPicker({
  levelId,
  groupId,
}: {
  levelId: number;
  groupId: number;
}) {
  const skills = [
    { skill: QuestionSkill.SPEAKING, label: labels.admin.skillSpeaking, icon: Mic },
    { skill: QuestionSkill.READING, label: labels.admin.skillReading, icon: BookOpen },
    { skill: QuestionSkill.WRITING, label: labels.admin.skillWriting, icon: Pencil },
    { skill: QuestionSkill.LISTENING, label: labels.admin.skillListening, icon: Headphones },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">{labels.admin.pickSkill}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map(({ skill, label, icon: Icon }) => (
          <Link
            key={skill}
            href={newQuestionFormatPath(levelId, groupId, skill)}
            className="surface-card-hoverable flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-colors hover:border-primary"
          >
            <Icon className="size-8 text-primary" />
            <span className="font-semibold">{label}</span>
          </Link>
        ))}
      </div>
      <Button variant="ghost" asChild>
        <Link href={groupEditPath(levelId, groupId) + "/items/new"}>
          {labels.common.back}
        </Link>
      </Button>
    </div>
  );
}

export function FormatPicker({
  levelId,
  groupId,
  skill,
}: {
  levelId: number;
  groupId: number;
  skill: QuestionSkill;
}) {
  const formats =
    skill === QuestionSkill.SPEAKING
      ? [
          { format: QuestionFormat.SPEECH_RECOGNITION, label: labels.admin.formatSpeech },
          { format: QuestionFormat.ESSAY, label: labels.admin.formatEssay },
          { format: QuestionFormat.MULTIPLE_CHOICE, label: labels.admin.formatMcq },
          { format: QuestionFormat.YES_NO, label: labels.admin.formatYesNo },
        ]
      : skill === QuestionSkill.WRITING
        ? [
            { format: QuestionFormat.ESSAY, label: labels.admin.formatEssay },
            { format: QuestionFormat.MULTIPLE_CHOICE, label: labels.admin.formatMcq },
            { format: QuestionFormat.YES_NO, label: labels.admin.formatYesNo },
          ]
        : [
            { format: QuestionFormat.MULTIPLE_CHOICE, label: labels.admin.formatMcq },
            { format: QuestionFormat.YES_NO, label: labels.admin.formatYesNo },
            { format: QuestionFormat.ESSAY, label: labels.admin.formatEssay },
          ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">{labels.admin.pickFormat}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {formats.map(({ format, label }) => (
          <Link
            key={format}
            href={newQuestionFormPath(levelId, groupId, skill, format)}
            className="surface-card-hoverable flex min-h-20 items-center justify-center rounded-xl border border-border bg-card px-4 py-5 text-center font-semibold shadow-sm transition-colors hover:border-primary"
          >
            {label}
          </Link>
        ))}
      </div>
      <Button variant="ghost" asChild>
        <Link href={newQuestionSkillPath(levelId, groupId)}>
          {labels.common.back}
        </Link>
      </Button>
    </div>
  );
}
