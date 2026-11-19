import AtiqCRMApp from "@/components/AtiqCRMApp";
import { getInitialData } from "@/lib/crmService";

export default function Page() {
  const data = getInitialData();
  return <AtiqCRMApp initialData={data} />;
}
