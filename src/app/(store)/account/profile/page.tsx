import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;
  return <ProfileForm name={user.name} phone={user.phone ?? ""} />;
}
