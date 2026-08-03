"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

export type MenuCategory = {
  slug: string;
  name: string;
  tagline: string;
  subs: { slug: string; name: string; count: number }[];
};

export function Header({
  menu,
  announcements,
  user,
  favCount,
}: {
  menu: MenuCategory[];
  announcements: string[];
  user: { name: string } | null;
  favCount: number;
}) {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggle = (slug: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  const closeMenu = () => setMenuOpen(false);
  const navCats = menu.slice(0, 5);

  return (
    <>
      {/* Announcement marquee */}
      <div className="glass-dark overflow-hidden">
        <div className="flex w-max animate-marquee whitespace-nowrap py-2 text-[11px] uppercase tracking-[0.2em] text-white/90">
          {Array.from({ length: 2 }).map((_, r) => (
            <div key={r} className="flex">
              {announcements.map((t, i) => (
                <span key={`${r}-${i}`} className="mx-8 flex items-center gap-8">
                  {t}
                  <span className="text-rose">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Full-width coral nav bar */}
      <div className="sticky top-0 z-40">
        <header
          className={`flex w-full items-center justify-between bg-rose px-5 py-3.5 text-foreground transition-shadow duration-500 lg:px-8 ${
            scrolled ? "shadow-[0_16px_40px_-16px_rgba(125,74,92,0.55)]" : ""
          }`}
        >
          {/* Left nav (desktop) with hover dropdowns */}
          <nav className="hidden flex-1 items-center gap-6 text-sm lg:flex">
            {navCats.map((c) => (
              <div key={c.slug} className="group relative">
                <Link
                  href={`/shop?cat=${c.slug}`}
                  className="link-underline flex items-center gap-1 py-1 font-medium"
                >
                  {c.name}
                  <Chevron className="h-3 w-3 text-foreground/60 transition-transform duration-300 group-hover:rotate-180" />
                </Link>
                {c.subs.length > 0 && (
                  <div className="invisible absolute left-0 top-full z-50 w-60 translate-y-1 pt-3 opacity-0 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="rounded-2xl border border-line bg-surface/98 p-2 shadow-[0_24px_50px_-16px_rgba(125,74,92,0.4)] backdrop-blur-xl">
                      {c.subs.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/shop?cat=${c.slug}&sub=${s.slug}`}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-[13px] text-foreground/80 transition-colors hover:bg-white/50 hover:text-rose-deep"
                        >
                          {s.name}
                          {s.count > 0 && (
                            <span className="text-[11px] text-muted">
                              {s.count}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden"
            aria-label="Цэс"
          >
            <MenuIcon />
          </button>

          <Link
            href="/"
            className="font-display text-2xl tracking-tight lg:text-[26px]"
          >
            makeup<span className="text-rose-deep">girls</span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-3">
            <Link
              href="/shop"
              className="hidden text-sm font-medium hover:text-rose-deep lg:block"
            >
              Дэлгүүр
            </Link>
            <button aria-label="Хайх" className="hover:text-rose-deep">
              <SearchIcon />
            </button>
            <Link
              href={user ? "/account/favorites" : "/login"}
              aria-label="Хадгалсан"
              className="relative hidden h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/50 sm:grid"
            >
              <HeartIcon />
              {favCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose-deep px-1 text-[10px] font-semibold text-white shadow">
                  {favCount}
                </span>
              )}
            </Link>
            <Link
              href={user ? "/account" : "/login"}
              aria-label={user ? "Миний бүртгэл" : "Нэвтрэх"}
              title={user ? user.name : "Нэвтрэх"}
              className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/50"
            >
              <UserIcon />
              {user && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
              )}
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label="Сагс"
              className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/50"
            >
              <BagIcon />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose-deep px-1 text-[10px] font-semibold text-white shadow">
                  {count}
                </span>
              )}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile drawer with accordion */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          onClick={closeMenu}
          className={`absolute inset-0 bg-plum/20 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          style={{
            transform: open ? "translateX(0)" : "translateX(calc(-100% - 20px))",
          }}
          className="absolute left-3 top-3 h-[calc(100%-1.5rem)] w-[84%] max-w-sm transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        >
          <div className="glass flex h-full w-full flex-col rounded-3xl">
            <div className="flex items-center justify-between px-6 py-5">
              <span className="font-display text-xl">
                makeup<span className="text-rose-deep">girls</span>
              </span>
              <button onClick={closeMenu} aria-label="Хаах">
                <CloseIcon />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 pb-6">
              {menu.map((c) => {
                const isOpen = expanded.has(c.slug);
                return (
                  <div key={c.slug} className="border-b border-white/40">
                    <button
                      onClick={() => toggle(c.slug)}
                      className="flex w-full items-center justify-between py-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-[17px] font-medium">{c.name}</span>
                      <span className="glass grid h-9 w-9 place-items-center rounded-xl">
                        <Chevron
                          className={`h-4 w-4 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isOpen
                          ? "grid-rows-[1fr] pb-3 opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        {c.subs.map((s) => (
                          <Link
                            key={s.slug}
                            href={`/shop?cat=${c.slug}&sub=${s.slug}`}
                            onClick={closeMenu}
                            className="flex items-center gap-2 py-2.5 pl-3 text-[15px] text-foreground/60 transition-colors hover:text-rose-deep"
                          >
                            {s.name}
                            {s.count > 0 && (
                              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-rose/15 px-1 text-[10px] text-rose-deep">
                                {s.count}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              <Link
                href="/shop"
                onClick={closeMenu}
                className="mt-5 flex items-center justify-center rounded-full bg-foreground py-3.5 text-sm font-medium text-white"
              >
                Бүх бүтээгдэхүүн үзэх
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0112 5a4.5 4.5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 8h12l-1 12H7L6 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
