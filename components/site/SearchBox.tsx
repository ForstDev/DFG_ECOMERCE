"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { MagnifyingGlassIcon, XIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { expo, snap } from "@/lib/motion";
import { track } from "@/lib/track";

type Suggestion = {
  slug: string;
  code: string;
  name: string;
  family: string;
  brandLabel: string;
  image: string;
};

/**
 * Search by part number or description. Suggestions come from the server so the
 * browser never has to download the 1.828 item index; the request is debounced
 * and the in-flight one is aborted when the user keeps typing.
 */
export function SearchBox({
  variant = "header",
  autoFocus = false,
  initialValue = "",
  onNavigate,
}: {
  variant?: "header" | "page";
  autoFocus?: boolean;
  initialValue?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const listId = useId();
  const [value, setValue] = useState(initialValue);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Whether the suggestion panel is showing is derived, never stored: with two
  // characters or fewer there is nothing to show, so the stale results simply
  // do not render and there is no state to reset.
  const canSuggest = value.trim().length >= 2;

  useEffect(() => {
    const term = value.trim();
    if (term.length < 2) return;

    const controller = new AbortController();
    // The spinner appears when the request actually leaves, not during the
    // 180 ms of debounce, so a fast typist never sees it flicker per keystroke.
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/search?q=" + encodeURIComponent(term), {
          signal: controller.signal,
        });
        const data = (await res.json()) as { items: Suggestion[]; total: number };
        setItems(data.items);
        setTotal(data.total);
        setActive(-1);
      } catch {
        /* aborted or offline: keep the previous suggestions on screen */
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value]);

  // Close the panel when the pointer lands anywhere else.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const go = (href: string, term?: string) => {
    if (term) track({ type: "search", term, results: total });
    setOpen(false);
    onNavigate?.();
    router.push(href);
  };

  const submit = () => {
    const term = value.trim();
    if (!term) return;
    if (active >= 0 && items[active]) {
      go("/producto/" + items[active].slug, term);
      return;
    }
    go("/catalogo?q=" + encodeURIComponent(term), term);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const onHeader = variant === "header";

  return (
    <div ref={boxRef} className="relative w-full">
      <div
        className={
          onHeader
            ? "flex items-center gap-2 border border-white/20 bg-white/5 px-3 transition-colors focus-within:border-red focus-within:bg-white/10"
            : "flex items-center gap-3 border border-line-strong bg-paper px-4 transition-colors focus-within:border-red"
        }
      >
        <MagnifyingGlassIcon
          size={onHeader ? 16 : 20}
          weight="bold"
          className={onHeader ? "shrink-0 text-white/60" : "shrink-0 text-ink-mute"}
        />
        <input
          ref={inputRef}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={open && canSuggest}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Buscar por código o descripción"
          placeholder="Buscar por código o descripción"
          className={
            onHeader
              ? "h-10 w-full bg-transparent text-[13px] text-white placeholder:text-white/45 focus:outline-none"
              : "h-14 w-full bg-transparent text-[15px] text-ink placeholder:text-ink-mute focus:outline-none"
          }
        />
        {loading && canSuggest && (
          <SpinnerGapIcon
            size={16}
            className={
              "shrink-0 animate-spin " + (onHeader ? "text-white/60" : "text-ink-mute")
            }
          />
        )}
        {(!loading || !canSuggest) && value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            aria-label="Borrar búsqueda"
            className={
              "shrink-0 " +
              (onHeader ? "text-white/60 hover:text-white" : "text-ink-mute hover:text-ink")
            }
          >
            <XIcon size={onHeader ? 15 : 18} weight="bold" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && canSuggest && (
          <motion.div
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={expo(0.28)}
            className="thin-scroll absolute left-0 right-0 top-[calc(100%+6px)] z-[var(--z-drawer)] max-h-[70vh] overflow-y-auto border border-line bg-paper shadow-[0_24px_60px_-24px_rgba(11,11,12,0.4)]"
          >
            {items.length === 0 && !loading ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-semibold text-ink">Sin resultados</p>
                <p className="mt-1 text-[13px] text-ink-mute">
                  Busca por número de parte o por una palabra de la descripción.
                </p>
              </div>
            ) : (
              <>
                {items.map((s, i) => (
                  <button
                    key={s.slug}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go("/producto/" + s.slug, value.trim())}
                    className={
                      "flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-left last:border-b-0 " +
                      (i === active ? "bg-surface" : "bg-paper")
                    }
                  >
                    <span className="photo-plate h-11 w-11 shrink-0 border border-line">
                      {s.image ? (
                        <Image
                          src={s.image}
                          alt=""
                          width={44}
                          height={44}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <span className="code-type text-[9px] text-ink-mute">S/F</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="code-type block text-[12px] font-bold text-red">
                        {s.code}
                      </span>
                      <span className="block truncate text-[12.5px] leading-snug text-ink">
                        {s.name}
                      </span>
                      <span className="block truncate text-[11px] text-ink-mute">
                        {s.brandLabel || s.family}
                      </span>
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => go("/catalogo?q=" + encodeURIComponent(value.trim()), value.trim())}
                  className="sticky bottom-0 flex w-full items-center justify-between bg-ink px-4 py-3 text-left text-[12px] font-bold uppercase tracking-[0.1em] text-paper"
                >
                  <span>Ver los {total} resultados</span>
                  <motion.span whileHover={{ x: 3 }} transition={snap} aria-hidden="true">
                    &rarr;
                  </motion.span>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
