import { headers } from "next/headers";
import {
  fetchGlobalCorsOrigins,
  listExternalApiTokens,
} from "@/actions/admin/api-tokens";
import { ApiDocsPanel } from "@/components/admin/api-docs-panel";
import { ApiGatewayConsole } from "@/components/admin/api-gateway-console";
import { ApiTokenManager } from "@/components/admin/api-token-manager";
import { PageHeader } from "@/components/ui/page-header";
import {
  Tabs,
  TabsContent,
  ScrollableTabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { labels } from "@/lib/labels";

export default async function AdminApiTokensPage() {
  const [tokens, corsOrigins] = await Promise.all([
    listExternalApiTokens(),
    fetchGlobalCorsOrigins(),
  ]);

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:5174";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${protocol}://${host}`;

  return (
    <>
      <PageHeader
        title={labels.admin.apiTokensTitle}
        description={labels.admin.apiTokensDescription}
      />

      <Tabs defaultValue="tokens" className="mt-6">
        <ScrollableTabsList className="w-full justify-start">
          <TabsTrigger value="tokens" className="min-h-11 px-4">
            {labels.admin.apiTokensTabTokens}
          </TabsTrigger>
          <TabsTrigger value="console" className="min-h-11 px-4">
            {labels.admin.apiTokensTabConsole}
          </TabsTrigger>
          <TabsTrigger value="docs" className="min-h-11 px-4">
            {labels.admin.apiTokensTabDocs}
          </TabsTrigger>
        </ScrollableTabsList>

        <TabsContent value="tokens" className="mt-4 sm:mt-6">
          <ApiTokenManager tokens={tokens} corsOrigins={corsOrigins} />
        </TabsContent>

        <TabsContent value="console" className="mt-4 sm:mt-6">
          <ApiGatewayConsole />
        </TabsContent>

        <TabsContent value="docs" className="mt-4 sm:mt-6">
          <ApiDocsPanel baseUrl={baseUrl} />
        </TabsContent>
      </Tabs>
    </>
  );
}
