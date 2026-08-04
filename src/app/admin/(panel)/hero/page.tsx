import { getStore } from "@/lib/db";
import { HeroManager } from "./HeroManager";

export const dynamic = "force-dynamic";

export default async function AdminHero() {
  const store = await getStore();
  return <HeroManager slides={store.heroSlides ?? []} />;
}
