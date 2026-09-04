import Link from "next/link";
import { Logo, Chevron } from "@/components/brand/Logo";
import type { Family, Settings } from "@/lib/types";

/**
 * The footer is the second black block of the page, bookending the hero. It
 * carries real navigation, not decoration: the eight largest families, the
 * contact channels and the way into the admin panel.
 */
export function Footer({
  families,
  settings,
}: {
  families: Family[];
  settings: Settings;
}) {
  const top = families
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Logo className="h-7 w-auto" />
            <p className="mt-5 max-w-[34ch] text-[13.5px] leading-relaxed text-white/60">
              Repuestos alternativos para buses y camiones pesados. Más de diez
              años desarrollando estándares de calidad para el mercado de
              autopartes.
            </p>
            <Link
              href="/catalogo"
              className="group mt-7 inline-flex items-center gap-2 bg-red px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-deep"
            >
              Ver catálogo
              <Chevron className="h-2.5 w-auto transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="md:col-span-4">
            <h2 className="label text-white/40">Familias</h2>
            <ul className="mt-4 grid grid-cols-1 gap-y-2 sm:grid-cols-2">
              {top.map((f) => (
                <li key={f.slug}>
                  <Link
                    href={"/catalogo?familia=" + encodeURIComponent(f.name)}
                    className="text-[13px] text-white/70 transition-colors hover:text-white"
                  >
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="label text-white/40">Contacto</h2>
            <ul className="mt-4 space-y-2 text-[13px] text-white/70">
              <li>
                <a
                  href={"mailto:" + settings.contactEmail}
                  className="transition-colors hover:text-white"
                >
                  {settings.contactEmail}
                </a>
              </li>
              <li>
                <a
                  href={"https://wa.me/" + settings.whatsapp.replace(/[^0-9]/g, "")}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-white"
                >
                  WhatsApp {settings.whatsappLabel}
                </a>
              </li>
              <li>
                <a
                  href="https://dfgtruckparts.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-white"
                >
                  dfgtruckparts.com
                </a>
              </li>
            </ul>

            <h2 className="label mt-8 text-white/40">Gestión</h2>
            <Link
              href="/admin"
              className="mt-4 inline-block border border-white/20 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/80 transition-colors hover:border-white/50 hover:text-white"
            >
              Panel administrativo
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-5 text-[11.5px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>DFG Truck Parts. Todos los derechos reservados.</p>
          <p>
            Propuesta de e-commerce desarrollada por FORST. Demo sin pasarela de
            pagos.
          </p>
        </div>
      </div>
    </footer>
  );
}
