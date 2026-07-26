import { getSerials, getPlans } from "./actions";
import { SerialsClient } from "./_components/serials-client";

export default async function SerialsPage() {
  const [serials, plans] = await Promise.all([getSerials(), getPlans()]);

  return <SerialsClient serials={serials} plans={plans} />;
}
