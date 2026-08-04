"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { adminLogout } from "@/app/admin/login/actions";

const links = [
  { href: "/admin", label: "Хяналт", icon: "◵", exact: true },
  { href: "/admin/hero", label: "Hero баннер", icon: "▦" },
  { href: "/admin/trending", label: "Trending / Reels", icon: "▶" },
  { href: "/admin/orders", label: "Захиалга", icon: "🛍" },
  { href: "/admin/products", label: "Бүтээгдэхүүн", icon: "▤" },
  { href: "/admin/promotions", label: "Хямдрал / Урамшуулал", icon: "％" },
  { href: "/admin/menu", label: "Цэс / Ангилал", icon: "☰" },
  { href: "/admin/content", label: "Текст контент", icon: "✎" },
  { href: "/admin/feedback", label: "Санал хүсэлт", icon: "✉" },
  { href: "/admin/subscribers", label: "Имэйл бүртгэл", icon: "@" },
  { href: "/admin/reports", label: "Тайлан", icon: "◷" },
];

export function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isActive = (href: string, exact?: boolean) =>
    exact ? path === href : path === href || path.startsWith(href + "/");

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:gap-1.5">
      {links.map((l) => {
        const active = isActive(l.href, l.exact);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-foreground text-white"
                : "text-foreground/70 hover:bg-blush"
            }`}
          >
            <span className="text-base opacity-80">{l.icon}</span>
            <span className="whitespace-nowrap">{l.label}</span>
          </Link>
        );
      })}
      <button
        onClick={() =>
          startTransition(async () => {
            await adminLogout();
            router.push("/admin/login");
            router.refresh();
          })
        }
        disabled={pending}
        className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-muted transition-colors hover:bg-blush disabled:opacity-50"
      >
        <span className="text-base opacity-80">⎋</span>
        <span className="whitespace-nowrap">{pending ? "…" : "Гарах"}</span>
      </button>
    </nav>
  );
}
