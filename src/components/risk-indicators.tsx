"use client";

import { motion } from "framer-motion";
import { Activity, TrendingDown, Shield, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskIndicatorsProps {
  indicators: {
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    beta: number;
  };
}

interface KpiCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  status: "good" | "neutral" | "bad";
  index: number;
}

function KpiCard({ label, value, subtitle, icon, color, bgColor, status, index }: KpiCardProps) {
  const statusConfig = {
    good: "border-emerald-500/20",
    neutral: "border-yellow-500/20",
    bad: "border-red-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className={cn(
        "glass rounded-[14px] p-5 border transition-all duration-300 hover:border-white/10",
        statusConfig[status]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bgColor)}>
          {icon}
        </div>
        <div
          className={cn(
            "w-2 h-2 rounded-full mt-1",
            status === "good" ? "bg-emerald-400" : status === "neutral" ? "bg-yellow-400" : "bg-red-400"
          )}
        />
      </div>

      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className={cn("text-2xl font-bold mb-1", color)}
        >
          {value}
        </motion.p>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </motion.div>
  );
}

export function RiskIndicators({ indicators }: RiskIndicatorsProps) {
  const volatilityStatus =
    indicators.volatility < 15 ? "good" : indicators.volatility < 30 ? "neutral" : "bad";
  const sharpeStatus =
    indicators.sharpeRatio > 1.5 ? "good" : indicators.sharpeRatio > 0.5 ? "neutral" : "bad";
  const drawdownStatus =
    indicators.maxDrawdown < 15 ? "good" : indicators.maxDrawdown < 30 ? "neutral" : "bad";
  const betaStatus = indicators.beta < 1.2 ? "good" : indicators.beta < 1.8 ? "neutral" : "bad";

  const cards: Omit<KpiCardProps, "index">[] = [
    {
      label: "Volatilite",
      value: `${indicators.volatility}%`,
      subtitle: indicators.volatility < 15 ? "Risque faible" : indicators.volatility < 30 ? "Risque modere" : "Risque eleve",
      icon: <Activity className="w-5 h-5 text-indigo-400" />,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/15",
      status: volatilityStatus,
    },
    {
      label: "Ratio de Sharpe",
      value: indicators.sharpeRatio.toFixed(2),
      subtitle: indicators.sharpeRatio > 1.5 ? "Performance ajustee excellente" : indicators.sharpeRatio > 0.5 ? "Performance ajustee correcte" : "Performance ajustee faible",
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/15",
      status: sharpeStatus,
    },
    {
      label: "Drawdown Max",
      value: `-${indicators.maxDrawdown}%`,
      subtitle: "Perte maximale estimee",
      icon: <TrendingDown className="w-5 h-5 text-red-400" />,
      color: "text-red-400",
      bgColor: "bg-red-500/15",
      status: drawdownStatus,
    },
    {
      label: "Beta",
      value: indicators.beta.toFixed(2),
      subtitle: indicators.beta < 1 ? "Moins volatile que le marche" : indicators.beta > 1.5 ? "Beaucoup plus volatile" : "Plus volatile que le marche",
      icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
      color: "text-amber-400",
      bgColor: "bg-amber-500/15",
      status: betaStatus,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <KpiCard key={card.label} {...card} index={index} />
      ))}
    </div>
  );
}
