import type { Transition, Variants } from "motion/react";

/**
 * One motion vocabulary for the whole product, so nothing animates with an
 * easing or duration invented on the spot.
 *
 * - `expo` is the house ease-out for anything entering the screen.
 * - `snap` is the spring for interactive feedback (hover, press, layout).
 * - `settle` is the softer spring reserved for shared-element transitions,
 *   where an overshoot on a product photo would read as a glitch.
 */
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export const expo = (duration = 0.6, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE_EXPO,
});

export const snap: Transition = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 };

export const settle: Transition = { type: "spring", stiffness: 220, damping: 30, mass: 0.9 };

/** Fade and lift. The default entrance for a block of content. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: expo(0.7) },
};

/** Parent that cascades its children. Pair with `riseItem`. */
export const stagger = (gap = 0.07, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: expo(0.6) },
};

/** Wipe a headline up from behind a mask. Needs an overflow-hidden wrapper. */
export const maskUp: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: expo(0.9) },
};

/** Shared viewport config so reveals fire at the same point everywhere. */
export const inView = { once: true, amount: 0.25 } as const;
