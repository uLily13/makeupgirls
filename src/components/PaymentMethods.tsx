"use client";

import { PAYMENT_METHODS, paymentLabel, type PaymentMethodId } from "@/lib/products";

// Brand-neutral glyphs + accent colours for each payment method. Real gateway
// logos/integration will replace these later.
const ICONS: Record<PaymentMethodId, { accent: string; icon: React.ReactNode }> = {
  qpay: {
    accent: "#1a73e8",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M14 14h3v3M21 14v7h-7v-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  khan: {
    accent: "#0a7d3f",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M4 10l8-5 8 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 10v7M10 10v7M14 10v7M18 10v7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4 20h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  golomt: {
    accent: "#c0392b",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M4 10l8-5 8 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 10v7M10 10v7M14 10v7M18 10v7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4 20h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  card: {
    accent: "#7d4a5c",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.7" />
        <path d="M6 15h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  cash: {
    accent: "#2e7d32",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
        <path d="M6 9v6M18 9v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
};

/** Selectable grid of payment methods. */
export function PaymentSelector({
  value,
  onChange,
}: {
  value: PaymentMethodId | null;
  onChange: (id: PaymentMethodId) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {PAYMENT_METHODS.map((m) => {
        const active = value === m.id;
        const { accent, icon } = ICONS[m.id];
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all ${
              active
                ? "border-rose bg-rose/10 ring-2 ring-rose/40"
                : "border-line bg-white/60 hover:border-rose/60"
            }`}
          >
            <span style={{ color: accent }}>{icon}</span>
            <span className="text-center text-[11px] font-medium leading-tight">
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Small inline chip showing a chosen payment method (admin / account). */
export function PaymentTag({ id }: { id?: string }) {
  if (!id || !(id in ICONS)) {
    return <span className="text-muted">{paymentLabel(id)}</span>;
  }
  const { accent, icon } = ICONS[id as PaymentMethodId];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
      <span className="[&>svg]:h-4 [&>svg]:w-4" style={{ color: accent }}>
        {icon}
      </span>
      {paymentLabel(id)}
    </span>
  );
}
