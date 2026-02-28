"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AssetList } from "@/components/asset-list";
import { Skeleton } from "@/components/ui/skeleton";

interface Asset {
  id: string;
  name: string;
  ticker: string;
  type: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  currency: string;
  category: string | null;
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
  sparklineData: number[];
  historyData: { date: string; price: number }[];
  buyDate: string;
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full max-w-lg rounded-[10px] bg-white/[0.04] mb-6" />
      {[...Array(8)].map((_, i) => (
        <Skeleton
          key={i}
          className="h-[72px] rounded-[14px] bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

export default function PortfolioPage() {
  const { data, isLoading, error } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => {
      const res = await fetch("/api/assets");
      if (!res.ok) throw new Error("Failed to fetch assets");
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
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Portfolio</h1>
        <p className="text-zinc-400">
          {data
            ? `${data.length} actifs dans votre portefeuille`
            : "Chargement de vos actifs..."}
        </p>
      </motion.div>

      {isLoading && <PortfolioSkeleton />}

      {error && (
        <div className="glass rounded-[14px] p-8 text-center">
          <p className="text-red-400">
            Erreur lors du chargement des actifs.
          </p>
        </div>
      )}

      {data && <AssetList assets={data} />}
    </div>
  );
}
