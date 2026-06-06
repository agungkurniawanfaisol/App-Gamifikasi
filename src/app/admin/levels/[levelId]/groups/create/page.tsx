import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createGroup } from "@/actions/admin/groups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { labels } from "@/lib/labels";

export default async function CreateGroupPage({
  params,
}: {
  params: { levelId: string };
}) {
  const levelId = parseInt(params.levelId, 10);
  const level = await prisma.level.findUnique({ where: { id: levelId } });
  if (!level) notFound();

  const maxOrder = await prisma.learningGroup.aggregate({
    where: { levelId },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>{labels.admin.addNewGroup}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createGroup.bind(null, levelId)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">{labels.admin.groupTitle}</Label>
              <Input
                id="title"
                name="title"
                placeholder={labels.admin.groupTitlePlaceholder}
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {labels.admin.autoOrder(nextOrder)}
            </p>
            <div className="flex gap-2">
              <Button type="submit">{labels.common.save}</Button>
              <Button variant="outline" asChild>
                <Link href={`/admin/levels/${levelId}/groups`}>
                  {labels.common.cancel}
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
