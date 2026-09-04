"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { Logo } from "@/components/brand/Logo";
import { expo } from "@/lib/motion";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
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
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <div className="relative hidden flex-col items-start justify-between bg-ink p-12 text-paper lg:flex">
        <Logo className="h-7 w-auto" />
        <div>
          <h1 className="max-w-[14ch] text-[46px] font-extrabold uppercase leading-[0.95] tracking-tight">
            Panel de <span className="text-red">catálogo</span>
          </h1>
          <p className="mt-5 max-w-[42ch] text-[14px] leading-relaxed text-white/55">
            Edita fotos y descripciones de los repuestos, revisa que buscan los
            clientes y que se está cotizando.
          </p>
        </div>
        <p className="text-[11.5px] text-white/35">
          Propuesta de e-commerce para DFG Truck Parts.
        </p>
      </div>

      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={expo(0.6)}
          className="w-full max-w-[380px]"
        >
          <Link href="/" className="mb-10 inline-block text-ink lg:hidden">
            <Logo className="h-6 w-auto" />
          </Link>

          <h2 className="text-[28px] font-bold uppercase leading-none tracking-tight">
            Ingresar
          </h2>
          <p className="mt-2 text-[13px] text-ink-mute">
            Acceso al panel administrativo del catálogo.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="user" className="label text-ink-soft">
                Usuario
              </label>
              <input
                id="user"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoComplete="username"
                required
                className="h-12 border border-line-strong bg-paper px-3.5 text-[14px] text-ink focus:border-red focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="pass" className="label text-ink-soft">
                Contraseña
              </label>
              <input
                id="pass"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="current-password"
                required
                className="h-12 border border-line-strong bg-paper px-3.5 text-[14px] text-ink focus:border-red focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mt-4 flex items-start gap-2 border border-red bg-red-wash px-3 py-2.5 text-[12.5px] font-medium text-red-deep"
            >
              <WarningCircleIcon size={16} weight="fill" className="mt-px shrink-0" />
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full bg-red px-6 py-4 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-deep disabled:bg-line-strong"
          >
            {busy ? "Verificando" : "Entrar"}
          </button>

          <p className="mt-6 border-t border-line pt-5 text-[12px] leading-relaxed text-ink-mute">
            Demo: usuario <span className="code-type font-semibold text-ink">admin</span>,
            contraseña <span className="code-type font-semibold text-ink">admin</span>.
            Se cambian con las variables DFG_ADMIN_USER y DFG_ADMIN_PASS.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
