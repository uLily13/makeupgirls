import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { NumberInputGuard } from "@/components/NumberInputGuard";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/admin/login");

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row">
      <NumberInputGuard />
      {/* Sidebar */}
      <aside className="shrink-0 border-b border-line px-4 py-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:px-5 md:py-7">
        <Link href="/admin" className="mb-6 hidden items-baseline gap-2 md:flex">
          <span className="font-display text-xl">
            makeup<span className="text-rose">girls</span>
          </span>
          <span className="rounded-md bg-blush px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-deep">
            Admin
          </span>
        </Link>
        <AdminNav />
        <div className="mt-6 hidden md:block">
          <div className="mb-2 px-4 text-xs text-muted">{user.email}</div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm text-muted hover:border-rose hover:text-rose-deep"
          >
            ← Дэлгүүр рүү
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 px-5 py-6 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
