import { SaleCampaignEditor } from "../_components/sale-campaign-editor";

export default async function SaleCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SaleCampaignEditor campaignId={Number(id)} />;
}
