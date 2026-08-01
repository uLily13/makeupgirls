"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { logout } from "@/app/(store)/account/actions";

const links = [
  { href: "/account", label: "Хяналт", exact: true },
  { href: "/account/orders", label: "Захиалгын түүх" },
  { href: "/account/favorites", label: "Хадгалсан" },
  { href: "/account/addresses", label: "Хүргэлтийн хаяг" },
  { href: "/account/profile", label: "Профайл" },
];

export function AccountNav() {
  const path = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const active = (href: string, exact?: boolean) =>
    exact ? path === href : path.startsWith(href);

  return (
    <nav className="flex gap-1.5 overflow-x-auto md:flex-col">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            active(l.href, l.exact)
              ? "bg-foreground text-white"
              : "text-foreground/70 hover:bg-blush"
          }`}
        >
          {l.label}
        </Link>
      ))}
      <button
        onClick={() =>
          startTransition(async () => {
            await logout();
            router.push("/");
            router.refresh();
          })
        }
        disabled={pending}
        className="shrink-0 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-muted transition-colors hover:bg-blush disabled:opacity-50"
      >
        {pending ? "…" : "Гарах"}
      </button>
    </nav>
  );
}
