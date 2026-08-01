import { getStore } from "@/lib/db";
import { FeedbackManager } from "./FeedbackManager";

export const dynamic = "force-dynamic";

export default async function AdminFeedback() {
  const store = await getStore();
  const feedback = store.feedback
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <FeedbackManager feedback={feedback} />;
}
