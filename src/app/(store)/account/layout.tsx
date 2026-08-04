import { redirect } from "next/navigation";
import { getCustomerUser } from "@/lib/auth";
import { AccountNav } from "@/components/account/AccountNav";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCustomerUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">
          Миний бүртгэл
        </p>
        <h1 className="mt-1 font-display text-3xl">Сайн байна уу, {user.name} 👋</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="card h-fit rounded-2xl p-3 md:sticky md:top-24">
          <AccountNav />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
