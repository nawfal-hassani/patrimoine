"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Brain,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/markets", label: "Marchés", icon: TrendingUp },
  { href: "/insights", label: "Insights", icon: Brain },
  { href: "/simulator", label: "Simuler", icon: Calculator },
];

export function MobileNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="border-t border-white/[0.06] bg-[#0a0a0c]/95 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors",
                  active ? "text-[#818cf8]" : "text-[#71717a]"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -top-px left-2 right-2 h-0.5 bg-[#818cf8] rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
