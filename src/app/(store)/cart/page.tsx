import { getCurrentUser } from "@/lib/auth";
import { CartView } from "./CartView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Сагс — makeupgirls" };

export default async function CartPage() {
  const user = await getCurrentUser();
  return (
    <CartView
      user={user ? { name: user.name } : null}
      addresses={user?.addresses ?? []}
    />
  );
}
