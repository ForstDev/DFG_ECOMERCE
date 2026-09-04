"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircleIcon,
  WarningCircleIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import type { Settings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; message: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);

    const data = await res?.json().catch(() => null);

    if (!res?.ok) {
      setStatus({ kind: "error", message: data?.error ?? "No se pudo guardar" });
      setBusy(false);
      return;
    }

    setForm(data.settings as Settings);
    setStatus({ kind: "ok", message: "Ajustes guardados" });
    setBusy(false);
    router.refresh();
  };

  const digits = form.whatsapp.replace(/[^0-9]/g, "");
  const sample =
    form.quoteIntro +
    "\n\n1. 1588043 - CABIN SHOCK ABSORBER (VOLVO) | Cant: 2\n\nTotal: 1 ítem / 2 unidades";

  return (
    <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-6">
        <Group
          title="WhatsApp de cotizaciones"
          hint="El botón Cotizar del carrito abre una conversación con este número."
        >
          <Field
            id="whatsapp"
            label="Número con código de país"
            hint="Solo dígitos. Por ejemplo 51999888777 para Perú."
            value={form.whatsapp}
            onChange={(v) => set("whatsapp", v)}
            mono
            required
          />
          <Field
            id="whatsappLabel"
            label="Nombre que se muestra"
            hint="Aparece en el pie de página junto al enlace."
            value={form.whatsappLabel}
            onChange={(v) => set("whatsappLabel", v)}
          />
        </Group>

        <Group
          title="Mensaje de la cotización"
          hint="Primera línea del mensaje. Debajo se agregan los ítems y las cantidades."
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="quoteIntro" className="label text-ink">
              Encabezado
            </label>
            <textarea
              id="quoteIntro"
              rows={2}
              maxLength={240}
              value={form.quoteIntro}
              onChange={(e) => set("quoteIntro", e.target.value)}
              className="w-full resize-y border border-line-strong bg-paper px-3 py-2.5 text-[13.5px] text-ink focus:border-red focus:outline-none"
            />
          </div>
        </Group>

        <Group title="Contacto" hint="Correo publicado en el pie de página.">
          <Field
            id="contactEmail"
            label="Correo"
            hint="Se muestra como enlace mailto."
            value={form.contactEmail}
            onChange={(v) => set("contactEmail", v)}
          />
        </Group>

        <AnimatePresence>
          {status && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              role="status"
              className={
                "flex items-center gap-2 px-3 py-2.5 text-[12.5px] font-semibold " +
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

        <div>
          <button
            type="submit"
            disabled={busy}
            className="bg-red px-7 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.09em] text-white transition-colors hover:bg-red-deep disabled:bg-line-strong"
          >
            {busy ? "Guardando" : "Guardar ajustes"}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-8 lg:h-fit">
        <div className="border border-line bg-paper">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.09em]">
              Vista previa
            </h2>
            <p className="mt-1 text-[12px] text-ink-mute">
              Así llega el mensaje al vendedor.
            </p>
          </div>
          <pre className="whitespace-pre-wrap px-5 py-4 font-mono text-[11.5px] leading-relaxed text-ink-soft">
            {sample}
          </pre>
          <div className="border-t border-line px-5 py-4">
            <a
              href={"https://wa.me/" + digits}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[12.5px] font-bold text-ink underline underline-offset-4 hover:text-red"
            >
              <WhatsappLogoIcon size={16} weight="fill" />
              Probar wa.me/{digits || "sin número"}
            </a>
          </div>
        </div>
      </aside>
    </form>
  );
}

function Group({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-paper p-5">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.09em]">{title}</h2>
      <p className="mt-1 text-[12px] leading-snug text-ink-mute">{hint}</p>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  mono = false,
  required = false,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="label text-ink">
        {label}
      </label>
      <input
        id={id}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={
          "h-11 w-full border border-line-strong bg-paper px-3 text-[13.5px] text-ink focus:border-red focus:outline-none " +
          (mono ? "code-type" : "")
        }
      />
      <p className="text-[11.5px] text-ink-mute">{hint}</p>
    </div>
  );
}
