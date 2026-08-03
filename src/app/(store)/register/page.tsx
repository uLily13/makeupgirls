import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCustomerUser } from "@/lib/auth";
import { AuthForm } from "@/components/account/AuthForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Бүртгүүлэх — makeupgirls" };

export default async function RegisterPage() {
  if (await getCustomerUser()) redirect("/account");
  return (
    <Suspense>
      <AuthForm mode="register" />
    </Suspense>
  );
}
