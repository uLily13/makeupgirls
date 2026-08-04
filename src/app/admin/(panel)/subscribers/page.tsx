import { getStore } from "@/lib/db";
import { SubscribersManager } from "./SubscribersManager";

export const dynamic = "force-dynamic";

export default async function AdminSubscribers() {
  const store = await getStore();
  const subscribers = (store.subscribers ?? [])
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <SubscribersManager subscribers={subscribers} />;
}
