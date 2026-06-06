import { Suspense } from "react";
import {
  getGroupTestimonials,
  getTestimonialGroupOptions,
} from "@/lib/testimonial-queries";
import { TestimonialList } from "@/components/admin/testimonial-list";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: { groupId?: string; q?: string };
}) {
  const groupIdParam = searchParams.groupId;
  const groupId =
    groupIdParam && /^\d+$/.test(groupIdParam)
      ? parseInt(groupIdParam, 10)
      : undefined;

  const [testimonials, groupOptions] = await Promise.all([
    getGroupTestimonials({ groupId, search: searchParams.q }),
    getTestimonialGroupOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={labels.admin.testimonialsTitle}
        description={labels.admin.testimonialsDescription}
      />

      <Suspense fallback={<div className="h-24 animate-pulse rounded-xl bg-muted" />}>
        <TestimonialList
          testimonials={testimonials}
          groupOptions={groupOptions}
        />
      </Suspense>
    </div>
  );
}
