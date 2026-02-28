"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Percent,
  BarChart3,
} from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { PortfolioChart } from "@/components/portfolio-chart";
import { AllocationChart } from "@/components/allocation-chart";
import { PerformersList } from "@/components/performers-list";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";

interface PortfolioData {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  assetCount: number;
  allocation: {
    label: string;
    value: number;
    percent: number;
    color: string;
  }[];
  topPerformers: {
    id: string;
    name: string;
    ticker: string;
    type: string;
    totalValue: number;
    totalCost: number;
    gainLoss: number;
    gainLossPercent: number;
  }[];
  worstPerformers: {
    id: string;
    name: string;
    ticker: string;
    type: string;
    totalValue: number;
    totalCost: number;
    gainLoss: number;
    gainLossPercent: number;
  }[];
  history: { month: string; value: number }[];
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-[130px] rounded-[14px] bg-white/[0.04]"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Skeleton className="h-[400px] rounded-[14px] bg-white/[0.04] lg:col-span-3" />
        <Skeleton className="h-[400px] rounded-[14px] bg-white/[0.04] lg:col-span-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[250px] rounded-[14px] bg-white/[0.04]" />
        <Skeleton className="h-[250px] rounded-[14px] bg-white/[0.04]" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<PortfolioData>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      return res.json();
    },
  });

  return (
    <div className="px-4 py-6 sm:p-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Bonjour, Mathis</h1>
        <p className="text-zinc-400">
          Vue d&apos;ensemble de ton portefeuille patrimoine
        </p>
      </motion.div>

      {isLoading && <DashboardSkeleton />}

      {error && (
        <div className="glass rounded-[14px] p-8 text-center">
          <p className="text-red-400">
            Erreur lors du chargement des donnees.
          </p>
        </div>
      )}

      {data && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Patrimoine total"
              value={formatCurrency(data.totalValue)}
              icon={Wallet}
              index={0}
            />
            <KpiCard
              title="Gain / Perte"
              value={formatCurrency(data.totalGainLoss)}
              change={formatPercent(data.totalGainLossPercent)}
              changeType={
                data.totalGainLoss >= 0 ? "positive" : "negative"
              }
              icon={TrendingUp}
              index={1}
            />
            <KpiCard
              title="Performance"
              value={formatPercent(data.totalGainLossPercent)}
              changeType={
                data.totalGainLossPercent >= 0 ? "positive" : "negative"
              }
              icon={Percent}
              index={2}
            />
            <KpiCard
              title="Nombre d'actifs"
              value={formatNumber(data.assetCount)}
              icon={BarChart3}
              index={3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <PortfolioChart data={data.history} />
            </div>
            <div className="lg:col-span-2">
              <AllocationChart
                data={data.allocation}
                totalValue={data.totalValue}
              />
            </div>
          </div>

          <PerformersList
            topPerformers={data.topPerformers}
            worstPerformers={data.worstPerformers}
          />
        </div>
      )}
    </div>
  );
}
