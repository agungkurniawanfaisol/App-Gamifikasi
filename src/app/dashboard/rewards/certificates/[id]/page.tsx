import { redirect } from "next/navigation";

export default function LegacyCertificateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/dashboard/certificates/${params.id}`);
}
