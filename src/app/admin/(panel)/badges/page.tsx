import { getStore } from "@/lib/db";
import { defaultBadgeSettings } from "@/lib/products";
import { BadgeManager } from "./BadgeManager";

export const dynamic = "force-dynamic";

export default async function AdminBadges() {
  const store = await getStore();
  return <BadgeManager settings={store.badgeSettings ?? defaultBadgeSettings} />;
}
