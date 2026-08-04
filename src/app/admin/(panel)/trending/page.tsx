import { getStore } from "@/lib/db";
import { TrendingManager } from "./TrendingManager";

export const dynamic = "force-dynamic";

export default async function AdminTrending() {
  const store = await getStore();
  return <TrendingManager posts={store.trendingPosts ?? []} />;
}
