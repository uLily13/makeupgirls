import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

export function Footer({
  content,
}: {
  content: Record<string, string>;
}) {
  const c = (k: string, fallback = "") => content[k] ?? fallback;

  return (
    <footer className="mt-24 border-t border-line bg-blush/40">
      <div className="wrap py-16 lg:py-20">
        {/* Newsletter */}
        <div className="mb-14 flex flex-col items-center gap-5 rounded-3xl bg-foreground px-6 py-12 text-center text-white">
          <span className="text-xs uppercase tracking-[0.25em] text-white/60">
            {c("news.eyebrow")}
          </span>
          <h3 className="font-display text-2xl md:text-3xl">{c("news.title")}</h3>
          <NewsletterForm
            placeholder={c("news.placeholder")}
            cta={c("news.cta")}
          />
        </div>

        {/* Columns */}
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-1">
            <Link href="/" className="font-display text-2xl">
              makeup<span className="text-rose">girls</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {c("footer.about")}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
              Тусламж
            </h4>
            <ul className="space-y-2.5 text-sm text-foreground/80">
              <li>Хүргэлт ба төлбөр</li>
              <li>Буцаалт, солилцоо</li>
              <li>Түгээмэл асуулт</li>
              <li>
                <Link href="/contact" className="hover:text-rose">
                  Санал хүсэлт / Холбоо барих
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
              Холбоо барих
            </h4>
            <ul className="space-y-2.5 text-sm text-foreground/80">
              <li>{c("footer.address")}</li>
              <li>{c("footer.phone")}</li>
              <li>{c("footer.email")}</li>
              <li className="flex gap-3 pt-2">
                {c("social.instagram") && <Social href={c("social.instagram")}>Instagram</Social>}
                {c("social.facebook") && <Social href={c("social.facebook")}>Facebook</Social>}
                {c("social.tiktok") && <Social href={c("social.tiktok")}>TikTok</Social>}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted md:flex-row">
          <span>© {new Date().getFullYear()} makeupgirls. Бүх эрх хуулиар хамгаалагдсан.</span>
          <div className="flex gap-5">
            <span>Нууцлалын бодлого</span>
            <span>Үйлчилгээний нөхцөл</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Social({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground/70 hover:text-rose"
    >
      {children}
    </a>
  );
}
