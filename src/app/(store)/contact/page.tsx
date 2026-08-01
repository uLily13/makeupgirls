import { getContentMap } from "@/lib/db";
import { ContactForm } from "./ContactForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Холбоо барих — makeupgirls" };

export default async function ContactPage() {
  const c = await getContentMap();
  const socials = [
    { label: "Facebook", href: c["social.facebook"] },
    { label: "Instagram", href: c["social.instagram"] },
    { label: "TikTok", href: c["social.tiktok"] },
  ].filter((s) => s.href);

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-rose-deep">Холбоо барих</p>
      <h1 className="mt-1 font-display text-4xl">Санал хүсэлт</h1>
      <p className="mt-2 max-w-lg text-muted">
        Асуулт, санал хүсэлт байвал бидэнд бичээрэй. Бид тантай эргэн холбогдоно.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <ContactForm />

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
              Хаяг
            </h3>
            <p className="text-foreground/80">{c["footer.address"]}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
              Утас / И-мэйл
            </h3>
            <p className="text-foreground/80">{c["footer.phone"]}</p>
            <p className="text-foreground/80">{c["footer.email"]}</p>
          </div>
          {socials.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
                Сошиал
              </h3>
              <div className="flex flex-wrap gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-line px-5 py-2.5 text-sm font-medium hover:border-rose hover:text-rose-deep"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
