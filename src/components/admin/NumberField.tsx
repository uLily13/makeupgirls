"use client";

// A clean integer input for prices / quantities. Shows an empty field (with a
// placeholder) instead of a stuck leading "0", strips non-digits, and never
// leaves a leading zero. Uses text + inputMode="numeric" to avoid the native
// number-spinner quirks (and mouse-wheel changing the value).
export function NumberField({
  value,
  onChange,
  className = "",
  placeholder = "0",
  min,
  max,
}: {
  value: number | null | undefined;
  onChange: (n: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  const display =
    value === 0 || value == null || Number.isNaN(value) ? "" : String(value);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      placeholder={placeholder}
      onChange={(e) => {
        const digits = e.target.value.replace(/[^\d]/g, "");
        let n = digits === "" ? 0 : Number(digits);
        if (max != null && n > max) n = max;
        onChange(n);
      }}
      onBlur={() => {
        if (min != null && (value ?? 0) < min) onChange(min);
      }}
      className={className}
    />
  );
}
