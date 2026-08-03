import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/account/AuthForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Нэвтрэх — makeupgirls" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/account");
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
