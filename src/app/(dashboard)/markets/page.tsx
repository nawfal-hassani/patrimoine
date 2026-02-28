"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  Globe,
  TrendingUp,
} from "lucide-react";
import { MarketCard } from "@/components/market-card";
import { MarketHeatmap } from "@/components/market-heatmap";
import { Watchlist } from "@/components/watchlist";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

interface MarketItem {
  id: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number | null;
  currency: string;
  type: string;
  intradayData: { time: string; price: number }[];
  timestamp: string;
}

function MarketDetailChart({
  item,
  index,
}: {
  item: MarketItem;
  index: number;
}) {
  const isPositive = item.changePercent >= 0;
  const chartColor = isPositive ? "#34d399" : "#f87171";
  const prices = item.intradayData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className="glass rounded-[14px] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            {item.ticker}
          </h3>
          <p className="text-base font-semibold text-white">{item.name}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">
            {formatCurrency(item.price, item.currency)}
          </p>
          <p
            className={`text-sm ${
              isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {item.changePercent.toFixed(2)}%
          </p>
        </div>
      </div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={item.intradayData}>
            <defs>
              <linearGradient
                id={`detail-gradient-${item.ticker}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 10 }}
              interval={15}
            />
            <YAxis
              domain={[minPrice - padding, maxPrice + padding]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 10 }}
              width={55}
              tickFormatter={(val: number) => val.toLocaleString("fr-FR")}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(17, 17, 19, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                backdropFilter: "blur(12px)",
                color: "#fff",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#71717a" }}
              formatter={(value: number | undefined) => [
                formatCurrency(value ?? 0, item.currency),
                "Prix",
              ]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#detail-gradient-${item.ticker})`}
              animationDuration={2000}
              animationBegin={index * 300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[140px] rounded-[14px] bg-white/[0.04]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[280px] rounded-[14px] bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}

export default function MarketsPage() {
  const { data: marketData, isLoading } = useQuery<MarketItem[]>({
    queryKey: ["market-data"],
    queryFn: async () => {
      const res = await fetch("/api/market");
      if (!res.ok) throw new Error("Erreur lors du chargement");
      return res.json();
    },
  });

  return (
    <div className="px-4 py-6 sm:p-6 pb-16">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Marchés</h1>
        <p className="text-zinc-400 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Indices, crypto &amp; matières premières — données simulées
        </p>
      </motion.div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-8">
          {/* Market overview cards */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">
                Vue d&apos;ensemble
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {marketData?.map((item, index) => (
                <MarketCard
                  key={item.ticker}
                  name={item.name}
                  ticker={item.ticker}
                  price={item.price}
                  change={item.change}
                  changePercent={item.changePercent}
                  currency={item.currency}
                  type={item.type}
                  intradayData={item.intradayData}
                  index={index}
                />
              ))}
            </div>
          </motion.section>

          {/* Tabs: Graphiques / Heatmap / Watchlist */}
          <Tabs defaultValue="charts" className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <TabsList className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 flex-wrap h-auto">
                <TabsTrigger
                  value="charts"
                  className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 rounded-lg text-sm"
                >
                  <BarChart3 className="w-4 h-4 mr-1.5" />
                  Graphiques intraday
                </TabsTrigger>
                <TabsTrigger
                  value="heatmap"
                  className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 rounded-lg text-sm"
                >
                  <Globe className="w-4 h-4 mr-1.5" />
                  Heatmap sectorielle
                </TabsTrigger>
                <TabsTrigger
                  value="watchlist"
                  className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 rounded-lg text-sm"
                >
                  <TrendingUp className="w-4 h-4 mr-1.5" />
                  Watchlist
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="charts" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {marketData?.map((item, index) => (
                  <MarketDetailChart
                    key={item.ticker}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="heatmap" className="mt-6">
              <MarketHeatmap />
            </TabsContent>

            <TabsContent value="watchlist" className="mt-6">
              <div className="max-w-2xl">
                <Watchlist />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
