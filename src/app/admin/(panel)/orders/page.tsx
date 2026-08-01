import { getStore } from "@/lib/db";
import { OrderManager } from "./OrderManager";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const store = await getStore();
  const orders = store.orders
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((o) => {
      const u = store.users.find((x) => x.id === o.userId);
      return { ...o, customer: u?.name ?? "—", customerPhone: u?.phone ?? "" };
    });
  return <OrderManager orders={orders} />;
}
