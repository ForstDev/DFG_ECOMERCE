import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s | Panel DFG" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Admin chrome. The login screen renders bare, because a sidebar full of links
 * the visitor cannot reach yet is noise.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface lg:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-line bg-ink text-paper lg:h-[100dvh] lg:w-[236px] lg:border-b-0 lg:border-r lg:border-white/10 lg:sticky lg:top-0">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <Link href="/" className="inline-block transition-opacity hover:opacity-70">
            <Logo className="h-[22px] w-auto" />
          </Link>
          <p className="label mt-1 hidden text-white/40 lg:block">Panel</p>
        </div>

        <AdminNav />

        <div className="mt-auto border-t border-white/10 px-5 py-4">
          <p className="text-[11.5px] text-white/45">
            Sesión: <span className="font-semibold text-white/80">{user}</span>
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/"
              className="text-[12px] font-semibold text-white/70 transition-colors hover:text-white"
            >
              Ver la tienda
            </Link>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
