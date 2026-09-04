"use client";

import { motion, useReducedMotion } from "motion/react";
import { expo, inView } from "@/lib/motion";

/**
 * Scroll reveal for a block of content. Wraps the house entrance so sections do
 * not each invent their own offset and easing. Under reduced motion the element
 * simply renders in place.
 */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={expo(0.7, delay)}
    >
      {children}
    </Tag>
  );
}
