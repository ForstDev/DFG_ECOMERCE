/**
 * The session cookie name lives on its own so the middleware can import it
 * without pulling in lib/auth.ts, which uses node:crypto and therefore cannot
 * be bundled into the Edge runtime.
 */
export const SESSION_COOKIE = "dfg_admin";
