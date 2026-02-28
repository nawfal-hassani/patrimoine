"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  index?: number;
}

export function KpiCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  index = 0,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className={cn(
        "glass rounded-[14px] p-4 sm:p-6 relative overflow-hidden group cursor-pointer",
        "hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(129,140,248,0.12)] transition-all duration-300"
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#818cf8]/[0.06] to-transparent rounded-bl-full" />

      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-[10px] bg-[#818cf8]/10">
          <Icon className="w-5 h-5 text-[#818cf8]" />
        </div>
        {change && (
          <span
            className={cn(
              "text-sm font-medium px-2.5 py-1 rounded-full",
              changeType === "positive" && "text-emerald-400 bg-emerald-400/10",
              changeType === "negative" && "text-red-400 bg-red-400/10",
              changeType === "neutral" && "text-zinc-400 bg-zinc-400/10"
            )}
          >
            {change}
          </span>
        )}
      </div>

      <p className="text-sm text-zinc-400 mb-1">{title}</p>
      <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">{value}</p>
    </motion.div>
  );
}
