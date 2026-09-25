"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { Logo } from "@/components/brand/Logo";
import { expo } from "@/lib/motion";

/**
 * The login screen. Full-bleed on the same brand video the storefront hero
 * uses, with the wordmark anchored top-left the way it sits in the header
 * everywhere else on the site, and the form itself a dark frosted panel
 * centered over the footage rather than boxed into a split layout.
 */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user, pass }),
    }).catch(() => null);

    if (!res || !res.ok) {
      const data = await res?.json().catch(() => null);
      setError(data?.error ?? "No se pudo conectar con el servidor");
      setBusy(false);
      return;
    }

    router.replace(next && next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  };

  return (
    <div className="relative isolate min-h-[100dvh] overflow-hidden bg-ink">
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="h-full w-full scale-105 object-cover opacity-70"
        >
          <source
            src="https://dfgtruckparts.com/wp-content/uploads/2022/09/DFG-final-260822.mp4"
            type="video/mp4"
          />
        </video>
        {/* Flat wash, not the hero's bottom-weighted gradient: this card can
            sit anywhere on the frame, so contrast has to hold everywhere. */}
        <div className="absolute inset-0 bg-ink/60" />
      </div>

      <Link
        href="/"
        aria-label="DFG Truck Parts, inicio"
        className="absolute left-6 top-6 z-10 text-paper drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-opacity hover:opacity-70 md:left-10 md:top-8"
      >
        <Logo className="h-6 w-auto md:h-7" />
      </Link>

      <div className="flex min-h-[100dvh] items-center justify-center px-6 py-24">
        <motion.form
          onSubmit={submit}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={expo(0.6)}
          className="glass-panel w-full max-w-[380px] p-8"
        >
          <h1 className="text-[26px] font-bold uppercase leading-none tracking-tight text-paper">
            Ingresar
          </h1>
          <p className="mt-2 text-[13px] text-white/65">
            Acceso al panel administrativo del catálogo.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="user" className="label text-white/70">
                Usuario
              </label>
              <input
                id="user"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoComplete="username"
                required
                className="h-12 border border-white/25 bg-white/10 px-3.5 text-[14px] text-paper placeholder:text-white/40 backdrop-blur-sm transition-colors focus:border-red focus:bg-white/15 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="pass" className="label text-white/70">
                Contraseña
              </label>
              <input
                id="pass"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="current-password"
                required
                className="h-12 border border-white/25 bg-white/10 px-3.5 text-[14px] text-paper placeholder:text-white/40 backdrop-blur-sm transition-colors focus:border-red focus:bg-white/15 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mt-4 flex items-start gap-2 border border-red bg-red/20 px-3 py-2.5 text-[12.5px] font-medium text-paper"
            >
              <WarningCircleIcon size={16} weight="fill" className="mt-px shrink-0 text-red" />
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full bg-red px-6 py-4 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-deep disabled:bg-white/20 disabled:text-white/50"
          >
            {busy ? "Verificando" : "Entrar"}
          </button>

          <p className="mt-6 border-t border-white/15 pt-5 text-[12px] leading-relaxed text-white/55">
            Demo: usuario <span className="code-type font-semibold text-paper">admin</span>,
            contraseña <span className="code-type font-semibold text-paper">admin</span>.
            Se cambian con las variables DFG_ADMIN_USER y DFG_ADMIN_PASS.
          </p>
        </motion.form>
      </div>

      <p className="absolute bottom-6 left-6 z-10 hidden text-[11.5px] text-white/40 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] sm:block md:left-10 md:bottom-8">
        Propuesta de e-commerce para DFG Truck Parts.
      </p>
    </div>
  );
}
