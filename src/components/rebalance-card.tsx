"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RebalanceSuggestion {
  assetType: string;
  currentPercent: number;
  targetPercent: number;
  action: "reduce" | "increase";
  label: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface RebalanceCardProps {
  suggestion: RebalanceSuggestion;
  index: number;
}

const priorityConfig = {
  high: {
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    badgeBg: "bg-red-500/20 text-red-400",
    label: "Urgent",
  },
  medium: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    badgeBg: "bg-yellow-500/20 text-yellow-400",
    label: "Recommande",
  },
  low: {
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    badgeBg: "bg-blue-500/20 text-blue-400",
    label: "Optionnel",
  },
};

const typeIcons: Record<string, string> = {
  stock: "Actions",
  etf: "ETF",
  crypto: "Crypto",
  real_estate: "Immobilier",
  savings: "Epargne",
};

export function RebalanceCard({ suggestion, index }: RebalanceCardProps) {
  const config = priorityConfig[suggestion.priority];
  const diff = Math.abs(suggestion.currentPercent - suggestion.targetPercent);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className={cn(
        "glass rounded-[14px] p-5 border transition-all duration-300 hover:border-white/10",
        config.bg
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              suggestion.action === "reduce" ? "bg-red-500/15" : "bg-emerald-500/15"
            )}
          >
            {suggestion.action === "reduce" ? (
              <TrendingDown className="w-5 h-5 text-red-400" />
            ) : (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">
              {typeIcons[suggestion.assetType] || suggestion.label}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {suggestion.action === "reduce" ? "Reduire la position" : "Augmenter la position"}
            </p>
          </div>
        </div>
        <Badge className={cn("text-xs font-medium border-0", config.badgeBg)}>
          {config.label}
        </Badge>
      </div>

      {/* Progress bar showing current vs target */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Allocation actuelle</span>
          <span className="font-medium text-white">{suggestion.currentPercent}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(suggestion.currentPercent, 100)}%` }}
            transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              suggestion.action === "reduce"
                ? "bg-gradient-to-r from-red-500 to-red-400"
                : "bg-gradient-to-r from-emerald-500 to-emerald-400"
            )}
          />
          {/* Target marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-white/60"
            style={{ left: `${Math.min(suggestion.targetPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className="text-muted-foreground">Cible recommandee</span>
          <span className="font-medium text-indigo-400">{suggestion.targetPercent}%</span>
        </div>
      </div>

      {/* Action indicator */}
      <div
        className={cn(
          "flex items-center gap-2 text-xs rounded-lg px-3 py-2",
          suggestion.action === "reduce" ? "bg-red-500/8 text-red-300" : "bg-emerald-500/8 text-emerald-300"
        )}
      >
        {suggestion.action === "reduce" ? (
          <ArrowDown className="w-3.5 h-3.5" />
        ) : (
          <ArrowUp className="w-3.5 h-3.5" />
        )}
        <span>
          {suggestion.action === "reduce" ? "Reduire" : "Augmenter"} de {diff.toFixed(1)} points
        </span>
      </div>
    </motion.div>
  );
}

interface AlertBadgeProps {
  alert: {
    type: string;
    severity: "critical" | "warning" | "info";
    message: string;
    currentPercent: number;
    threshold: number;
  };
  index: number;
}

export function AlertBadge({ alert, index }: AlertBadgeProps) {
  const severityConfig = {
    critical: {
      bg: "bg-red-500/15 border-red-500/30",
      text: "text-red-400",
      icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
    },
    warning: {
      bg: "bg-yellow-500/15 border-yellow-500/30",
      text: "text-yellow-400",
      icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
    },
    info: {
      bg: "bg-blue-500/15 border-blue-500/30",
      text: "text-blue-400",
      icon: <AlertTriangle className="w-4 h-4 text-blue-400" />,
    },
  };

  const config = severityConfig[alert.severity];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn(
        "flex items-center gap-3 rounded-[14px] border px-4 py-3 glass",
        config.bg
      )}
    >
      {config.icon}
      <p className={cn("text-sm flex-1", config.text)}>{alert.message}</p>
      <Badge variant="outline" className={cn("text-xs border-0", config.text)}>
        {alert.currentPercent}%
      </Badge>
    </motion.div>
  );
}
