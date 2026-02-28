"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface IntradayPoint {
  time: string;
  price: number;
}

interface MarketCardProps {
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  type: string;
  intradayData: IntradayPoint[];
  index?: number;
}

export function MarketCard({
  name,
  ticker,
  price,
  change,
  changePercent,
  currency,
  intradayData,
  index = 0,
}: MarketCardProps) {
  const isPositive = changePercent >= 0;
  const chartColor = isPositive ? "#34d399" : "#f87171";

  const prices = intradayData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass rounded-[14px] p-5 hover:border-white/10 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{ticker}</h3>
          <p className="text-lg font-semibold text-white mt-0.5">{name}</p>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isPositive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {formatPercent(changePercent)}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {formatCurrency(price, currency)}
          </p>
          <p
            className={`text-sm mt-0.5 ${
              isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(change, currency)}
          </p>
        </div>

        <div className="w-[80px] sm:w-[120px] h-[50px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={intradayData}>
              <defs>
                <linearGradient
                  id={`gradient-${ticker}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis
                domain={[minPrice - padding, maxPrice + padding]}
                hide
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={1.5}
                fill={`url(#gradient-${ticker})`}
                animationDuration={1500}
                animationBegin={index * 200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
