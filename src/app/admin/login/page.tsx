import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminLoginForm } from "./AdminLoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Админ нэвтрэх — makeupgirls" };

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <AdminLoginForm />
    </div>
  );
}
