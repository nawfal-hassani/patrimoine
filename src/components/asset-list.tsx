"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AssetSparkline } from "@/components/asset-sparkline";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

type SortField = "performance" | "value" | "name";
type SortDirection = "asc" | "desc";

const typeLabels: Record<string, string> = {
  stock: "Actions",
  etf: "ETF",
  crypto: "Crypto",
  real_estate: "Immobilier",
  savings: "Epargne",
};

const typeFilters = [
  { value: "all", label: "Tous" },
  { value: "stock", label: "Actions" },
  { value: "etf", label: "ETF" },
  { value: "crypto", label: "Crypto" },
  { value: "real_estate", label: "Immobilier" },
  { value: "savings", label: "Epargne" },
];

function DetailTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-[10px] px-4 py-3 shadow-xl">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

interface AssetListProps {
  assets: Asset[];
}

export function AssetList({ assets }: AssetListProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("performance");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const filteredAndSorted = useMemo(() => {
    let filtered = assets;
    if (activeFilter !== "all") {
      filtered = assets.filter((a) => a.type === activeFilter);
    }

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "performance":
          cmp = a.gainLossPercent - b.gainLossPercent;
          break;
        case "value":
          cmp = a.totalValue - b.totalValue;
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
      }
      return sortDirection === "desc" ? -cmp : cmp;
    });
  }, [assets, activeFilter, sortField, sortDirection]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }

  function SortButton({ field, label }: { field: SortField; label: string }) {
    const isActive = sortField === field;
    return (
      <button
        onClick={() => toggleSort(field)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all",
          isActive
            ? "bg-[#818cf8]/15 text-[#818cf8]"
            : "text-zinc-400 hover:text-zinc-300 hover:bg-white/[0.04]"
        )}
      >
        {label}
        {isActive ? (
          sortDirection === "desc" ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ArrowUp className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        )}
      </button>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Tabs
            value={activeFilter}
            onValueChange={setActiveFilter}
            className="w-full sm:w-auto"
          >
            <TabsList className="bg-white/[0.04] border border-white/[0.06] rounded-[10px] h-auto flex-wrap overflow-x-auto">
              {typeFilters.map((f) => (
                <TabsTrigger
                  key={f.value}
                  value={f.value}
                  className="rounded-[8px] text-xs data-[state=active]:bg-[#818cf8]/15 data-[state=active]:text-[#818cf8] data-[state=active]:shadow-none"
                >
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1">
            <SortButton field="performance" label="Performance" />
            <SortButton field="value" label="Valeur" />
            <SortButton field="name" label="Nom" />
          </div>
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredAndSorted.map((asset, index) => {
              const isPositive = asset.gainLossPercent >= 0;
              return (
                <motion.div
                  key={asset.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  onClick={() => setSelectedAsset(asset)}
                  className={cn(
                    "glass rounded-[14px] p-4 cursor-pointer group",
                    "hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(129,140,248,0.1)] transition-all duration-200"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-[10px] bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                          <span className="text-xs font-bold text-[#818cf8] uppercase">
                            {asset.ticker.slice(0, 3)}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-white truncate">
                            {asset.name}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-white/[0.04] text-zinc-400 border-white/[0.06] flex-shrink-0"
                          >
                            {typeLabels[asset.type] || asset.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500">
                          {asset.ticker} · {asset.quantity}{" "}
                          {asset.quantity > 1 ? "parts" : "part"} ·{" "}
                          {formatCurrency(asset.currentPrice)}/u
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:block flex-shrink-0">
                      <AssetSparkline
                        data={asset.sparklineData}
                        positive={isPositive}
                      />
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(asset.totalValue)}
                      </p>
                      <p
                        className={cn(
                          "text-xs font-medium",
                          isPositive ? "text-emerald-400" : "text-red-400"
                        )}
                      >
                        {formatPercent(asset.gainLossPercent)}{" "}
                        <span className="text-zinc-500">
                          ({isPositive ? "+" : ""}
                          {formatCurrency(asset.gainLoss)})
                        </span>
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredAndSorted.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              Aucun actif dans cette categorie.
            </div>
          )}
        </div>
      </motion.div>

      <Sheet
        open={!!selectedAsset}
        onOpenChange={(open) => {
          if (!open) setSelectedAsset(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg bg-[#09090b] border-white/[0.06] overflow-y-auto"
        >
          {selectedAsset && (
            <AssetDetailContent
              asset={selectedAsset}
              onClose={() => setSelectedAsset(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function AssetDetailContent({
  asset,
  onClose,
}: {
  asset: Asset;
  onClose: () => void;
}) {
  const isPositive = asset.gainLossPercent >= 0;

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-0">
        <div className="flex items-start justify-between">
          <div>
            <SheetTitle className="text-xl text-white">
              {asset.name}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2 mt-1">
              <span>{asset.ticker}</span>
              <Badge
                variant="secondary"
                className="text-[10px] bg-white/[0.04] text-zinc-400 border-white/[0.06]"
              >
                {typeLabels[asset.type] || asset.type}
              </Badge>
              {asset.category && (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-[#818cf8]/10 text-[#818cf8] border-transparent"
                >
                  {asset.category}
                </Badge>
              )}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="flex-1 space-y-6 mt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-[10px] p-4">
            <p className="text-xs text-zinc-400 mb-1">Valeur totale</p>
            <p className="text-lg font-bold text-white">
              {formatCurrency(asset.totalValue)}
            </p>
          </div>
          <div className="glass rounded-[10px] p-4">
            <p className="text-xs text-zinc-400 mb-1">Gain/Perte</p>
            <p
              className={cn(
                "text-lg font-bold",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}
            >
              {formatPercent(asset.gainLossPercent)}
            </p>
            <p className="text-xs text-zinc-500">
              {isPositive ? "+" : ""}
              {formatCurrency(asset.gainLoss)}
            </p>
          </div>
          <div className="glass rounded-[10px] p-4">
            <p className="text-xs text-zinc-400 mb-1">Prix actuel</p>
            <p className="text-sm font-semibold text-white">
              {formatCurrency(asset.currentPrice)}
            </p>
          </div>
          <div className="glass rounded-[10px] p-4">
            <p className="text-xs text-zinc-400 mb-1">PRU</p>
            <p className="text-sm font-semibold text-white">
              {formatCurrency(asset.buyPrice)}
            </p>
          </div>
          <div className="glass rounded-[10px] p-4">
            <p className="text-xs text-zinc-400 mb-1">Quantite</p>
            <p className="text-sm font-semibold text-white">
              {asset.quantity}
            </p>
          </div>
          <div className="glass rounded-[10px] p-4">
            <p className="text-xs text-zinc-400 mb-1">Cout total</p>
            <p className="text-sm font-semibold text-white">
              {formatCurrency(asset.totalCost)}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">
            Historique du prix
          </h4>
          <div className="glass rounded-[14px] p-4">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={asset.historyData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id={`detailGrad-${asset.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={isPositive ? "#34d399" : "#f87171"}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={isPositive ? "#34d399" : "#f87171"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    tickFormatter={(v: string) => {
                      const d = new Date(v);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    domain={["auto", "auto"]}
                    tickFormatter={(v: number) =>
                      v >= 1000
                        ? `${(v / 1000).toFixed(0)}k`
                        : v.toFixed(0)
                    }
                  />
                  <Tooltip content={<DetailTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "#34d399" : "#f87171"}
                    strokeWidth={2}
                    fill={`url(#detailGrad-${asset.id})`}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass rounded-[10px] p-4">
          <h4 className="text-sm font-semibold text-white mb-3">
            Informations
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Date d&apos;achat</span>
              <span className="text-white">
                {new Date(asset.buyDate).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Devise</span>
              <span className="text-white">{asset.currency}</span>
            </div>
            {asset.category && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Categorie</span>
                <span className="text-white">{asset.category}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
