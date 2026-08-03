"use client";

import { useRef, useState } from "react";

async function upload(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Upload failed");
  return json.url as string;
}

/** Multiple-image uploader — real file upload, shows thumbnails. */
export function ImageUploader({
  values,
  onChange,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await upload(f));
      onChange([...values, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map((url, i) => (
          <div
            key={i}
            className="relative h-20 w-20 overflow-hidden rounded-xl border border-line"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-xs text-white"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="grid h-20 w-20 place-items-center rounded-xl border border-dashed border-line text-2xl text-muted hover:border-rose hover:text-rose-deep disabled:opacity-50"
        >
          {busy ? "…" : "+"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/** Single-image uploader — for a colour swatch photo. */
export function SingleImageUploader({
  value,
  onChange,
  size = "sm",
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  size?: "sm" | "lg";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const dim = size === "lg" ? "h-28 w-28" : "h-9 w-9";

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await upload(file));
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      {value ? (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`group relative ${dim} shrink-0 overflow-hidden rounded-xl border border-line`}
          title="Зураг устгах"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          {size === "lg" && (
            <span className="absolute inset-0 grid place-items-center bg-black/0 text-xs font-medium text-transparent transition-all group-hover:bg-black/50 group-hover:text-white">
              Устгах
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`grid ${dim} shrink-0 place-items-center rounded-xl border border-dashed border-line text-muted hover:border-rose disabled:opacity-50`}
          title="Зураг оруулах"
        >
          {busy ? "…" : size === "lg" ? "＋ Зураг" : "📷"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </>
  );
}
