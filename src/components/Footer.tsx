import Link from "next/link";
import { Logo } from "./Logo";

export function Footer({
  content,
}: {
  content: Record<string, string>;
}) {
  const c = (k: string, fallback = "") => content[k] ?? fallback;

  return (
    <footer className="mt-24 border-t border-line bg-blush/40">
      <div className="wrap py-16 lg:py-20">
        {/* Columns */}
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-1">
            <Link href="/" className="font-display text-2xl">
              <Logo
                imgClass="h-11 w-auto"
                fallback={<>makeup<span className="text-rose">girls</span></>}
              />
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
              <li className="flex gap-2.5 pt-2">
                {c("social.instagram") && (
                  <Social href={c("social.instagram")} label="Instagram">
                    <InstagramIcon />
                  </Social>
                )}
                {c("social.facebook") && (
                  <Social href={c("social.facebook")} label="Facebook">
                    <FacebookIcon />
                  </Social>
                )}
                {c("social.tiktok") && (
                  <Social href={c("social.tiktok")} label="TikTok">
                    <TikTokIcon />
                  </Social>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted md:flex-row">
          <span>© {new Date().getFullYear()} makeupgirls. Бүх эрх хуулиар хамгаалагдсан.</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-rose">
              Нууцлалын бодлого
            </Link>
            <Link href="/terms" className="hover:text-rose">
              Үйлчилгээний нөхцөл
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-line text-foreground/70 transition-colors hover:border-rose hover:bg-rose hover:text-white"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.56-1.5H17V3.6c-.29-.04-1.27-.13-2.4-.13-2.38 0-4 1.45-4 4.12v2.3H8v3.1h2.6V21h2.9z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 3c.35 2.02 1.6 3.4 3.4 3.57v2.62c-1.1.02-2.28-.38-3.28-1.06v6.16c0 3.16-2.42 5.21-5.14 5.21-2.72 0-4.98-2.02-4.98-4.79 0-2.86 2.32-4.86 5.05-4.6v2.7c-.32-.1-.66-.16-1-.16-1.2 0-2.2.94-2.2 2.16 0 1.22 1 2.16 2.24 2.16 1.28 0 2.3-1.02 2.3-2.5V3h3.61z" />
    </svg>
  );
}
