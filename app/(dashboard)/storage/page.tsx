import { getStorageOverview, getStorageOptions } from "./actions";
import StorageDashboardClient from "./_components/storage-dashboard-client";

export default async function StoragePage() {
  const [overview, storageOptions] = await Promise.all([
    getStorageOverview(),
    getStorageOptions(),
  ]);

  return <StorageDashboardClient overview={overview} storageOptions={storageOptions} />;
}
