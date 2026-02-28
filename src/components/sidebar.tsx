"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Newspaper,
  Brain,
  Calculator,
  Settings,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useSettingsStore } from "@/store/use-settings-store";
import { formatCurrency, formatPercent } from "@/lib/utils";

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/markets", label: "Marchés", icon: TrendingUp },
  { href: "/news", label: "Actualités", icon: Newspaper },
  { href: "/insights", label: "Insights", icon: Brain },
  { href: "/simulator", label: "Simulateur", icon: Calculator },
];

const bottomNavItems = [
  { href: "/settings", label: "Paramètres", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const currency = useSettingsStore((s) => s.currency);

  const { data: portfolio } = useQuery<{
    totalValue: number;
    totalGainLossPercent: number;
  }>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      return res.json();
    },
    staleTime: 60_000,
  });

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#818cf8]/10 text-lg">
            🐸
          </div>
          <div className="flex flex-col">
            <span className="gradient-text text-base font-bold tracking-tight leading-tight">
              Mathis Monard
            </span>
            <span className="text-[11px] text-[#71717a] font-medium">
              Patrimoine
            </span>
          </div>
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {mainNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-[10px] border-l-2 border-[#818cf8] bg-[#1a1a2e]"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
              {!active && (
                <motion.div
                  className="absolute inset-0 rounded-[10px] opacity-0 hover:opacity-100 bg-[rgba(255,255,255,0.04)]"
                  transition={{ duration: 0.15 }}
                />
              )}
              <item.icon
                className={`relative z-10 h-[18px] w-[18px] ${
                  active ? "text-[#818cf8]" : "text-[#71717a]"
                }`}
              />
              <span
                className={`relative z-10 ${
                  active ? "text-white" : "text-[#a1a1aa]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        <div className="py-3">
          <Separator className="bg-[rgba(255,255,255,0.06)]" />
        </div>

        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-[10px] border-l-2 border-[#818cf8] bg-[#1a1a2e]"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
              {!active && (
                <motion.div
                  className="absolute inset-0 rounded-[10px] opacity-0 hover:opacity-100 bg-[rgba(255,255,255,0.04)]"
                  transition={{ duration: 0.15 }}
                />
              )}
              <item.icon
                className={`relative z-10 h-[18px] w-[18px] ${
                  active ? "text-[#818cf8]" : "text-[#71717a]"
                }`}
              />
              <span
                className={`relative z-10 ${
                  active ? "text-white" : "text-[#a1a1aa]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Mini patrimoine summary */}
      <div className="mx-3 mb-4 rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,19,0.6)] p-4 backdrop-blur-md">
        <p className="mb-1 text-xs font-medium text-[#71717a]">
          Patrimoine total
        </p>
        <p className="text-lg font-bold text-white">
          {formatCurrency(portfolio?.totalValue ?? 0, currency)}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className={`text-xs font-medium ${(portfolio?.totalGainLossPercent ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatPercent(portfolio?.totalGainLossPercent ?? 0)}
          </span>
          <span className="text-xs text-[#71717a]">global</span>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const sidebarOpen = useSettingsStore((s) => s.sidebarOpen);
  const setSidebarOpen = useSettingsStore((s) => s.setSidebarOpen);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col border-r border-[rgba(255,255,255,0.06)] bg-[#0a0a0c] md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[260px] border-r border-[rgba(255,255,255,0.06)] bg-[#0a0a0c] p-0 md:hidden"
        >
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
