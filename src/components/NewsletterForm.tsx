"use client";

import { useState, useTransition } from "react";
import { subscribe } from "@/app/(store)/actions";

// Footer newsletter signup — posts the email to the server and stores it.
export function NewsletterForm({
  placeholder,
  cta,
}: {
  placeholder: string;
  cta: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await subscribe(email);
      if (res.ok) {
        setDone(true);
        setEmail("");
      } else {
        setError(res.error ?? "Алдаа гарлаа.");
      }
    });
  };

  if (done) {
    return (
      <p className="mt-2 rounded-full bg-white/15 px-6 py-3 text-sm text-white ring-1 ring-white/20">
        ✦ Баярлалаа! Та амжилттай бүртгүүллээ.
      </p>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={submit}
        className="mt-2 flex w-full items-center gap-2 rounded-full bg-white/10 p-1.5 ring-1 ring-white/20"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-foreground transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {pending ? "…" : cta}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-white/80">{error}</p>}
    </div>
  );
}
