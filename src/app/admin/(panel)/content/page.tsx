import { getStore } from "@/lib/db";
import { ContentManager } from "./ContentManager";

export const dynamic = "force-dynamic";

export default async function AdminContent() {
  const store = await getStore();
  return <ContentManager items={store.content} />;
}
