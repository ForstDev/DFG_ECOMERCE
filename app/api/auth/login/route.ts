import { NextResponse } from "next/server";
import { checkCredentials, createToken, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { user, pass } = (await request.json().catch(() => ({}))) as {
    user?: string;
    pass?: string;
  };

  if (!user || !pass || !checkCredentials(user, pass)) {
    // A deliberate delay blunts trivial credential guessing against the demo.
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ ok: false, error: "Usuario o clave incorrectos" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createToken(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
