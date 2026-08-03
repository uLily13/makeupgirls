import { getCustomerUser } from "@/lib/auth";
import { AddressManager } from "./AddressManager";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = (await getCustomerUser())!;
  return <AddressManager addresses={user.addresses} />;
}
