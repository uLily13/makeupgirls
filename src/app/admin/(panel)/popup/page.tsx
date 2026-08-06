import { getStore } from "@/lib/db";
import { PopupManager } from "./PopupManager";

export const dynamic = "force-dynamic";

export default async function AdminPopup() {
  const store = await getStore();
  return <PopupManager slides={store.popupSlides ?? []} />;
}
