import type { TrackEvent } from "./types";

/**
 * Fire-and-forget analytics. Every call is best effort: if the endpoint is
 * unreachable the shopper must never notice, so failures are swallowed.
 * `keepalive` lets the last event survive a navigation.
 */
export function track(event: TrackEvent) {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* analytics must never break the page */
  }
}
