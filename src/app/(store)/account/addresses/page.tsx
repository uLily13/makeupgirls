import { getCurrentUser } from "@/lib/auth";
import { AddressManager } from "./AddressManager";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = (await getCurrentUser())!;
  return <AddressManager addresses={user.addresses} />;
}
