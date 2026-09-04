"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageBrokenIcon } from "@phosphor-icons/react";

/**
 * A product photo with a branded empty state.
 *
 * The images live on dfgtruckparts.com, so two things can leave a tile without
 * one: the 198 items the excel never had a photo for, and the occasional
 * upstream hiccup that makes the image optimiser return a 500. Both land in the
 * same place here, so the grid never shows a browser broken-image glyph.
 */
export function ProductPhoto({
  src,
  alt,
  sizes,
  className = "",
  padding = "p-4",
  width,
  height,
  priority = false,
  label = "Sin foto",
  compact = false,
}: {
  src?: string;
  alt: string;
  /** Omit width and height to render with `fill`, inside a positioned parent. */
  sizes?: string;
  className?: string;
  padding?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  label?: string;
  compact?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const missing = !src || failed;

  if (missing) {
    return (
      <span
        className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-line-strong"
        role="img"
        aria-label={alt + ". " + label}
      >
        <ImageBrokenIcon size={compact ? 14 : 28} weight="light" />
        {!compact && (
          <span className="label text-[9px] text-ink-mute">{label}</span>
        )}
      </span>
    );
  }

  // `alt` is passed explicitly at both call sites rather than spread, so the
  // accessibility lint can see it.
  const common = {
    src,
    priority,
    onError: () => setFailed(true),
    className: "object-contain " + padding + " " + className,
  };

  return width && height ? (
    <Image {...common} alt={alt} width={width} height={height} />
  ) : (
    <Image {...common} alt={alt} fill sizes={sizes} />
  );
}
