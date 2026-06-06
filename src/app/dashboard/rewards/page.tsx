import Link from "next/link";
import { getRewardsOverview } from "@/actions/student/rewards";
import { AchievementCollection } from "@/components/student/rewards/achievement-collection";
import { CertificateCard } from "@/components/student/rewards/certificate-card";
import { UnlocksPanel } from "@/components/student/rewards/unlocks-panel";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, ScrollableTabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { labels } from "@/lib/labels";
import { Award, Gift, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function RewardsPage() {
  const { achievements, certificates, unlocks } = await getRewardsOverview();

  return (
    <div className="animate-slide-up space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <Gift className="size-7 text-primary" />
            {labels.rewards.pageTitle}
          </span>
        }
        description={labels.rewards.pageSubtitle}
      />

      <Tabs defaultValue="achievements" className="space-y-6">
        <ScrollableTabsList>
          <TabsTrigger value="achievements">{labels.rewards.tabAchievements}</TabsTrigger>
          <TabsTrigger value="certificates">{labels.rewards.tabCertificates}</TabsTrigger>
          <TabsTrigger value="unlocks">{labels.rewards.tabUnlocks}</TabsTrigger>
        </ScrollableTabsList>

        <TabsContent value="achievements">
          <AchievementCollection achievements={achievements} />
        </TabsContent>

        <TabsContent value="certificates">
          {certificates.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {certificates.map((certificate) => (
                <CertificateCard key={certificate.id} certificate={certificate} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title={labels.rewards.noCertificates}
              description={labels.rewards.noCertificatesHint}
            />
          )}
        </TabsContent>

        <TabsContent value="unlocks">
          <UnlocksPanel unlocks={unlocks} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-start">
        <Button asChild variant="outline">
          <Link href="/dashboard">{labels.common.back}</Link>
        </Button>
      </div>
    </div>
  );
}
