import { listAssistantKnowledgeEntriesPaginated } from "@/actions/admin/assistant-knowledge";
import { AssistantKnowledgeManager } from "@/components/admin/assistant-knowledge-manager";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default async function AdminAssistantKnowledgePage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const search = searchParams.q?.trim();

  const result = await listAssistantKnowledgeEntriesPaginated({
    page,
    search,
  });

  return (
    <>
      <PageHeader
        title={labels.admin.assistantKnowledgeTitle}
        description={labels.admin.assistantKnowledgeDescription}
      />
      <div className="mt-6">
        <AssistantKnowledgeManager
          entries={result.items}
          pagination={{
            page: result.page,
            totalPages: result.totalPages,
            total: result.total,
            pageSize: result.pageSize,
            search,
          }}
        />
      </div>
    </>
  );
}
