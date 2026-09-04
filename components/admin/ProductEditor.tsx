"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  XIcon,
  TrashIcon,
  ArrowUpIcon,
  UploadSimpleIcon,
  PlusIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { expo } from "@/lib/motion";
import type { Product } from "@/lib/types";

type Status = { kind: "ok" | "error"; message: string } | null;

/**
 * Edits the three fields the brief asks for: photos, description and
 * application. The parent mounts this under a key of the product slug, so
 * switching products remounts the form with fresh values instead of syncing
 * them back through an effect.
 * Everything else stays owned by the excel import, so a
 * re-import never silently overwrites a human decision, and "restaurar"
 * drops the override and brings the excel value back.
 */
export function ProductEditor({
  product,
  isOverridden,
  closeHref,
}: {
  product: Product;
  isOverridden: boolean;
  closeHref: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product.name);
  const [application, setApplication] = useState(product.application);
  const [images, setImages] = useState<string[]>(product.images);
  const [newUrl, setNewUrl] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  const close = () => router.push(closeHref, { scroll: false });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeHref]);

  const save = async () => {
    setBusy(true);
    setStatus(null);

    const res = await fetch("/api/admin/product/" + product.slug, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, application, images }),
    }).catch(() => null);

    const data = await res?.json().catch(() => null);

    if (!res?.ok) {
      setStatus({ kind: "error", message: data?.error ?? "No se pudo guardar" });
      setBusy(false);
      return;
    }

    setStatus({ kind: "ok", message: "Cambios guardados y publicados" });
    setBusy(false);
    router.refresh();
  };

  const restore = async () => {
    setBusy(true);
    await fetch("/api/admin/product/" + product.slug, { method: "DELETE" });
    setBusy(false);
    setStatus({ kind: "ok", message: "Se restauraron los valores del excel" });
    router.refresh();
  };

  const upload = async (file: File) => {
    setBusy(true);
    setStatus(null);

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body }).catch(() => null);
    const data = await res?.json().catch(() => null);

    if (!res?.ok || !data?.url) {
      setStatus({ kind: "error", message: data?.error ?? "No se pudo subir la imagen" });
      setBusy(false);
      return;
    }

    setImages((prev) => [...prev, data.url as string]);
    setStatus({ kind: "ok", message: "Imagen subida. Guarda para publicarla." });
    setBusy(false);
  };

  const addUrl = () => {
    const url = newUrl.trim();
    if (!url) return;
    if (!url.startsWith("http") && !url.startsWith("/")) {
      setStatus({ kind: "error", message: "La URL tiene que empezar con http o con /" });
      return;
    }
    setImages((prev) => [...prev, url]);
    setNewUrl("");
    setStatus(null);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        className="fixed inset-0 z-[var(--z-modal)] bg-ink/50 backdrop-blur-[2px]"
      />

      <motion.aside
        key="sheet"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={expo(0.45)}
        role="dialog"
        aria-label={"Editar " + product.code}
        className="thin-scroll fixed right-0 top-0 z-[var(--z-modal)] flex h-[100dvh] w-[min(560px,100vw)] flex-col overflow-y-auto bg-paper"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-paper px-5 py-4">
          <div className="min-w-0">
            <p className="code-type text-[13px] font-bold text-red">{product.code}</p>
            <h2 className="mt-0.5 truncate text-[15px] font-bold uppercase tracking-tight">
              {product.name}
            </h2>
            <p className="mt-0.5 truncate text-[11.5px] text-ink-mute">
              {product.family}
              {product.subfamily ? " / " + product.subfamily : ""}
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Cerrar editor"
            className="grid h-9 w-9 shrink-0 place-items-center text-ink-mute transition-colors hover:text-ink"
          >
            <XIcon size={19} weight="bold" />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-7 px-5 py-6">
          <Field label="Descripción" hint="Es el titulo que ve el cliente en el catálogo.">
            <textarea
              value={name}
              onChange={(e) => setName(e.target.value)}
              rows={2}
              maxLength={160}
              className="w-full resize-y border border-line-strong bg-paper px-3 py-2.5 text-[13.5px] uppercase text-ink focus:border-red focus:outline-none"
            />
            <p className="mt-1 text-right text-[11px] text-ink-mute">{name.length} / 160</p>
          </Field>

          <Field
            label="Aplicación"
            hint="Modelos y series donde monta la pieza. Por ejemplo FH12 / FM9."
          >
            <textarea
              value={application}
              onChange={(e) => setApplication(e.target.value)}
              rows={2}
              maxLength={240}
              className="w-full resize-y border border-line-strong bg-paper px-3 py-2.5 text-[13.5px] text-ink focus:border-red focus:outline-none"
            />
            <p className="mt-1 text-right text-[11px] text-ink-mute">
              {application.length} / 240
            </p>
          </Field>

          <Field
            label="Fotografías"
            hint="La primera es la que sale en el catálogo. Se puede subir un archivo o pegar una URL."
          >
            {images.length === 0 ? (
              <p className="border border-dashed border-line-strong px-4 py-6 text-center text-[12.5px] text-ink-mute">
                Este repuesto no tiene fotografía.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {images.map((src, i) => (
                  <li
                    key={src + i}
                    className="flex items-center gap-3 border border-line px-3 py-2.5"
                  >
                    <span className="photo-plate h-14 w-14 shrink-0 border border-line">
                      <Image
                        src={src}
                        alt=""
                        width={56}
                        height={56}
                        className="h-full w-full object-contain p-1"
                        unoptimized={src.startsWith("/uploads/")}
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      {i === 0 && (
                        <span className="mb-1 inline-block bg-ink px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-paper">
                          Principal
                        </span>
                      )}
                      <p className="code-type truncate text-[11px] text-ink-mute">{src}</p>
                    </div>

                    <button
                      onClick={() => move(i, i - 1)}
                      disabled={i === 0}
                      aria-label="Subir en el orden"
                      className="grid h-8 w-8 shrink-0 place-items-center text-ink-mute transition-colors hover:text-ink disabled:opacity-25"
                    >
                      <ArrowUpIcon size={15} weight="bold" />
                    </button>
                    <button
                      onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                      aria-label="Quitar imagen"
                      className="grid h-8 w-8 shrink-0 place-items-center text-ink-mute transition-colors hover:text-red"
                    >
                      <TrashIcon size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(f);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="inline-flex items-center justify-center gap-1.5 border border-ink px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.07em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
              >
                <UploadSimpleIcon size={14} weight="bold" />
                Subir archivo
              </button>

              <div className="flex flex-1 items-center gap-2 border border-line-strong px-3">
                <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addUrl();
                    }
                  }}
                  placeholder="Pegar URL de imagen"
                  aria-label="URL de imagen"
                  className="h-10 w-full bg-transparent text-[12.5px] focus:outline-none"
                />
                <button
                  onClick={addUrl}
                  aria-label="Agregar URL"
                  className="grid h-8 w-8 shrink-0 place-items-center text-ink-mute hover:text-ink"
                >
                  <PlusIcon size={15} weight="bold" />
                </button>
              </div>
            </div>
          </Field>
        </div>

        <footer className="sticky bottom-0 border-t border-line bg-paper px-5 py-4">
          <AnimatePresence>
            {status && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                role="status"
                className={
                  "mb-3 flex items-center gap-2 px-3 py-2.5 text-[12.5px] font-semibold " +
                  (status.kind === "ok"
                    ? "bg-surface text-ink"
                    : "border border-red bg-red-wash text-red-deep")
                }
              >
                {status.kind === "ok" ? (
                  <CheckCircleIcon size={15} weight="fill" className="text-red" />
                ) : (
                  <WarningCircleIcon size={15} weight="fill" />
                )}
                {status.message}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={save}
              disabled={busy}
              className="flex-1 bg-red px-5 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.09em] text-white transition-colors hover:bg-red-deep disabled:bg-line-strong"
            >
              {busy ? "Guardando" : "Guardar y publicar"}
            </button>

            {isOverridden && (
              <button
                onClick={restore}
                disabled={busy}
                className="inline-flex items-center gap-1.5 border border-line-strong px-4 py-3.5 text-[12px] font-bold uppercase tracking-[0.07em] text-ink-mute transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
              >
                <ArrowCounterClockwiseIcon size={14} weight="bold" />
                Restaurar
              </button>
            )}
          </div>
        </footer>
      </motion.aside>
    </AnimatePresence>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="label text-ink">{label}</p>
        <p className="mt-1 text-[11.5px] leading-snug text-ink-mute">{hint}</p>
      </div>
      {children}
    </div>
  );
}
