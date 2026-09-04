"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import {
  ListIcon,
  XIcon,
  ShoppingCartSimpleIcon,
  MagnifyingGlassIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import { Logo } from "@/components/brand/Logo";
import { SearchBox } from "./SearchBox";
import { useCart } from "@/components/cart/CartProvider";
import { expo, snap } from "@/lib/motion";
import type { Family } from "@/lib/types";

const NAV = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/marca", label: "La marca" },
];

export function Header({ families }: { families: Family[] }) {
  const pathname = usePathname();
  const { units, ready, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [famOpen, setFamOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  // Any navigation closes whatever was open. Adjusting during render rather
  // than in an effect avoids a frame where the drawer is still open on the new
  // page, and avoids the cascading re-render an effect would cause.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setFamOpen(false);
    setMobileSearch(false);
  }

  // The mobile sheet owns the scroll while it is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const topFamilies = families.slice().sort((a, b) => b.count - a.count);

  return (
    <>
      <header
        className={
          "sticky top-0 z-[var(--z-header)] bg-ink text-paper transition-shadow duration-300 " +
          (scrolled ? "shadow-[0_1px_0_0_rgba(255,255,255,0.14)]" : "")
        }
      >
        <div className="shell flex h-[var(--header-h)] items-center gap-4">
          <Link
            href="/"
            aria-label="DFG Truck Parts, inicio"
            className="shrink-0 text-paper transition-opacity hover:opacity-70"
          >
            <Logo className="h-[22px] w-auto" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            <div
              className="relative"
              onMouseEnter={() => setFamOpen(true)}
              onMouseLeave={() => setFamOpen(false)}
            >
              <button
                onClick={() => setFamOpen((v) => !v)}
                aria-expanded={famOpen}
                className="flex h-[var(--header-h)] items-center gap-1.5 px-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/75 transition-colors hover:text-white"
              >
                Familias
                <motion.span animate={{ rotate: famOpen ? 180 : 0 }} transition={snap}>
                  <CaretDownIcon size={11} weight="bold" />
                </motion.span>
              </button>

              <AnimatePresence>
                {famOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={expo(0.3)}
                    className="absolute left-0 top-full w-[560px] border border-line bg-paper p-2 text-ink shadow-[0_30px_70px_-30px_rgba(11,11,12,0.55)]"
                  >
                    <div className="grid grid-cols-2 gap-x-2">
                      {topFamilies.map((f) => (
                        <Link
                          key={f.slug}
                          href={"/catalogo?familia=" + encodeURIComponent(f.name)}
                          className="group flex items-baseline justify-between gap-3 px-3 py-2 transition-colors hover:bg-surface"
                        >
                          <span className="truncate text-[12.5px] font-medium leading-tight">
                            {f.name}
                          </span>
                          <span className="code-type shrink-0 text-[11px] text-ink-mute group-hover:text-red">
                            {f.count}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "relative flex h-[var(--header-h)] items-center px-3 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors " +
                    (active ? "text-white" : "text-white/75 hover:text-white")
                  }
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      transition={snap}
                      className="absolute inset-x-3 bottom-0 h-[2px] bg-red"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden w-full max-w-[420px] md:block">
            <SearchBox />
          </div>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <button
              onClick={() => setMobileSearch(true)}
              aria-label="Buscar"
              className="grid h-10 w-10 place-items-center text-white/80 transition-colors hover:text-white md:hidden"
            >
              <MagnifyingGlassIcon size={20} weight="bold" />
            </button>

            <button
              onClick={open}
              aria-label={
                // Gated on `ready` like the badge: the server has no access to
                // localStorage, so announcing the real count before hydration
                // would make the markup disagree with itself.
                "Carrito de cotización, " + (ready ? units : 0) + " unidades"
              }
              className="relative grid h-10 w-10 place-items-center text-white/80 transition-colors hover:text-white"
            >
              <ShoppingCartSimpleIcon size={20} weight="bold" />
              <AnimatePresence>
                {ready && units > 0 && (
                  <motion.span
                    key={units}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={snap}
                    className="code-type absolute right-1 top-1 grid h-[17px] min-w-[17px] place-items-center bg-red px-1 text-[10px] font-bold leading-none text-white"
                  >
                    {units > 99 ? "99+" : units}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="grid h-10 w-10 place-items-center text-white/80 transition-colors hover:text-white lg:hidden"
            >
              <ListIcon size={22} weight="bold" />
            </button>
          </div>
        </div>

        {/* Mobile search drops the full field under the bar instead of squeezing it in. */}
        <AnimatePresence>
          {mobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={expo(0.35)}
              className="overflow-hidden border-t border-white/10 md:hidden"
            >
              <div className="shell py-3">
                <SearchBox autoFocus onNavigate={() => setMobileSearch(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[var(--z-drawer)] bg-ink/60 backdrop-blur-[2px] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={expo(0.45)}
              role="dialog"
              aria-label="Menú"
              className="thin-scroll fixed right-0 top-0 z-[var(--z-drawer)] flex h-[100dvh] w-[min(360px,88vw)] flex-col overflow-y-auto bg-ink text-paper lg:hidden"
            >
              <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between px-5">
                <Logo className="h-[20px] w-auto" />
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="grid h-10 w-10 place-items-center text-white/70"
                >
                  <XIcon size={20} weight="bold" />
                </button>
              </div>

              <nav className="flex flex-col px-5 pb-10 pt-4">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border-b border-white/10 py-4 text-[20px] font-bold uppercase tracking-tight"
                  >
                    {item.label}
                  </Link>
                ))}

                <p className="label mt-8 text-white/40">Familias</p>
                <div className="mt-3 flex flex-col">
                  {topFamilies.map((f) => (
                    <Link
                      key={f.slug}
                      href={"/catalogo?familia=" + encodeURIComponent(f.name)}
                      className="flex items-baseline justify-between gap-3 border-b border-white/10 py-2.5"
                    >
                      <span className="text-[13px] text-white/85">{f.name}</span>
                      <span className="code-type text-[11px] text-white/40">{f.count}</span>
                    </Link>
                  ))}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
