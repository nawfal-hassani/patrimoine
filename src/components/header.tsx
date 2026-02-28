"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/use-settings-store";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/portfolio": "Portfolio",
  "/markets": "Marchés",
  "/news": "Actualités",
  "/insights": "Insights",
  "/simulator": "Simulateur",
  "/settings": "Paramètres",
};

export function Header() {
  const pathname = usePathname();
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);

  const title = pageTitles[pathname] || "Patrimoine";

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-transparent px-4 sm:px-6 backdrop-blur-xl"
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Hamburger - mobile only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 rounded-[10px] text-[#71717a] hover:bg-[rgba(255,255,255,0.04)] hover:text-white md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page title */}
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Search - desktop */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717a]" />
          <Input
            placeholder="Rechercher..."
            className="h-9 w-64 rounded-[10px] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] pl-9 text-sm text-white placeholder:text-[#71717a] focus-visible:border-[#818cf8] focus-visible:ring-[#818cf8]/20"
          />
        </div>

        {/* Search icon - mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-[10px] text-[#71717a] hover:bg-[rgba(255,255,255,0.04)] hover:text-white sm:hidden"
        >
          <Search className="h-[18px] w-[18px]" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-[10px] text-[#71717a] hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#818cf8]" />
        </Button>

        {/* Avatar */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#818cf8] to-[#a78bfa] text-sm font-semibold text-white transition-opacity hover:opacity-90">
          MM
        </button>
      </div>
    </motion.header>
  );
}
