import AtiqCRMApp from "@/components/AtiqCRMApp";
import { getInitialData } from "@/actions/crm";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getInitialData();
  return <AtiqCRMApp initialData={data} />;
}
