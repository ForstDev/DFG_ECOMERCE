"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ChartBarIcon, PackageIcon, GearSixIcon } from "@phosphor-icons/react";
import { snap } from "@/lib/motion";

const LINKS = [
  { href: "/admin", label: "Indicadores", Icon: ChartBarIcon },
  { href: "/admin/productos", label: "Productos", Icon: PackageIcon },
  { href: "/admin/ajustes", label: "Ajustes", Icon: GearSixIcon },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0 lg:pt-2">
      {LINKS.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={
              "relative flex shrink-0 items-center gap-2.5 px-3 py-2.5 text-[13px] font-semibold transition-colors " +
              (active ? "text-white" : "text-white/55 hover:text-white/90")
            }
          >
            {active && (
              <motion.span
                layoutId="admin-nav-active"
                transition={snap}
                className="absolute inset-0 -z-10 bg-white/10"
              />
            )}
            <Icon size={17} weight={active ? "fill" : "regular"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
