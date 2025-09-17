import QualityCheckDetail from "../../../components/qc/QualityCheckDetail";

export default function QualityCheckDetailPage() {
  return <QualityCheckDetail />;
}

export async function generateMetadata({
  params,
}: {
  params: { qcId: string };
}) {
  return {
    title: `Quality Check #${params.qcId} - Autobia`,
    description: `Quality check details for QC #${params.qcId}`,
  };
}
