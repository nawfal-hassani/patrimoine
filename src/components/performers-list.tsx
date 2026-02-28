"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

interface Performer {
  id: string;
  name: string;
  ticker: string;
  type: string;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface PerformersListProps {
  topPerformers: Performer[];
  worstPerformers: Performer[];
}

function PerformerRow({
  performer,
  index,
  delayBase,
}: {
  performer: Performer;
  index: number;
  delayBase: number;
}) {
  const isPositive = performer.gainLossPercent >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: delayBase + index * 0.08 }}
      className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-[8px] flex items-center justify-center text-xs font-bold",
            isPositive ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"
          )}
        >
          {index + 1}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{performer.name}</p>
          <p className="text-xs text-zinc-500">{performer.ticker}</p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={cn(
            "text-sm font-semibold",
            isPositive ? "text-emerald-400" : "text-red-400"
          )}
        >
          {formatPercent(performer.gainLossPercent)}
        </p>
        <p className="text-xs text-zinc-500">
          {formatCurrency(performer.gainLoss)}
        </p>
      </div>
    </motion.div>
  );
}

export function PerformersList({
  topPerformers,
  worstPerformers,
}: PerformersListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        className="glass rounded-[14px] p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-[8px] bg-emerald-400/10">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Top performers</h3>
        </div>
        <div>
          {topPerformers.map((performer, index) => (
            <PerformerRow
              key={performer.id}
              performer={performer}
              index={index}
              delayBase={0.6}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        className="glass rounded-[14px] p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-[8px] bg-red-400/10">
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Worst performers</h3>
        </div>
        <div>
          {worstPerformers.map((performer, index) => (
            <PerformerRow
              key={performer.id}
              performer={performer}
              index={index}
              delayBase={0.7}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
