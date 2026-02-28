"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { Coins, Calendar, TrendingUp, PiggyBank } from "lucide-react";

interface SimulatorParams {
  initialAmount: number;
  monthlyContribution: number;
  annualRate: number;
  durationYears: number;
}

interface YearlyDataPoint {
  year: number;
  pessimistic: number;
  average: number;
  optimistic: number;
  contributions: number;
}

function calculateCompoundInterest(
  pv: number,
  pmt: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;

  if (monthlyRate === 0) {
    return pv + pmt * months;
  }

  const compoundFactor = Math.pow(1 + monthlyRate, months);
  const futureValuePV = pv * compoundFactor;
  const futureValuePMT = pmt * ((compoundFactor - 1) / monthlyRate);

  return futureValuePV + futureValuePMT;
}

function generateLocalProjection(params: SimulatorParams): YearlyDataPoint[] {
  const { initialAmount, monthlyContribution, annualRate, durationYears } = params;
  const pessimisticRate = Math.max(0, annualRate - 3);
  const optimisticRate = annualRate + 3;
  const data: YearlyDataPoint[] = [];

  for (let year = 0; year <= durationYears; year++) {
    data.push({
      year,
      pessimistic: Math.round(
        calculateCompoundInterest(initialAmount, monthlyContribution, pessimisticRate, year)
      ),
      average: Math.round(
        calculateCompoundInterest(initialAmount, monthlyContribution, annualRate, year)
      ),
      optimistic: Math.round(
        calculateCompoundInterest(initialAmount, monthlyContribution, optimisticRate, year)
      ),
      contributions: Math.round(initialAmount + monthlyContribution * 12 * year),
    });
  }

  return data;
}

function CustomTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="glass rounded-xl border border-white/10 p-4 shadow-xl min-w-[200px]">
      <p className="text-xs text-muted-foreground mb-3 font-medium">Annee {label}</p>
      <div className="space-y-2">
        {payload.map((entry, index) => {
          const labels: Record<string, string> = {
            optimistic: "Optimiste",
            average: "Moyen",
            pessimistic: "Pessimiste",
            contributions: "Contributions",
          };
          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {labels[entry.name] || entry.name}
                </span>
              </div>
              <span className="text-xs font-semibold text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CompoundSimulatorProps {
  onParamsChange?: (params: SimulatorParams) => void;
}

export function CompoundSimulator({ onParamsChange }: CompoundSimulatorProps = {}) {
  const [params, setParams] = useState<SimulatorParams>({
    initialAmount: 10000,
    monthlyContribution: 500,
    annualRate: 7,
    durationYears: 20,
  });

  const chartData = useMemo(() => generateLocalProjection(params), [params]);

  useEffect(() => {
    onParamsChange?.(params);
  }, [params, onParamsChange]);

  const updateParam = useCallback(
    <K extends keyof SimulatorParams>(key: K, value: SimulatorParams[K]) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const finalYear = chartData[chartData.length - 1];
  const totalContributions = finalYear?.contributions || 0;
  const pessimisticRate = Math.max(0, params.annualRate - 3);
  const optimisticRate = params.annualRate + 3;

  const sliders = [
    {
      key: "initialAmount" as const,
      label: "Capital initial",
      icon: <Coins className="w-4 h-4 text-indigo-400" />,
      min: 0,
      max: 100000,
      step: 1000,
      value: params.initialAmount,
      format: (v: number) => formatCurrency(v),
    },
    {
      key: "monthlyContribution" as const,
      label: "Contribution mensuelle",
      icon: <PiggyBank className="w-4 h-4 text-purple-400" />,
      min: 0,
      max: 2000,
      step: 50,
      value: params.monthlyContribution,
      format: (v: number) => formatCurrency(v),
    },
    {
      key: "annualRate" as const,
      label: "Taux de rendement annuel",
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      min: 1,
      max: 15,
      step: 0.5,
      value: params.annualRate,
      format: (v: number) => `${v}%`,
    },
    {
      key: "durationYears" as const,
      label: "Duree (annees)",
      icon: <Calendar className="w-4 h-4 text-amber-400" />,
      min: 5,
      max: 40,
      step: 1,
      value: params.durationYears,
      format: (v: number) => `${v} ans`,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sliders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-[14px] border border-white/[0.06] p-3 sm:p-6"
      >
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          Parametres de simulation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {sliders.map((slider, index) => (
            <motion.div
              key={slider.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                  {slider.icon}
                  {slider.label}
                </Label>
                <span className="text-xs sm:text-sm font-semibold text-white bg-white/5 px-2 sm:px-3 py-1 rounded-lg">
                  {slider.format(slider.value)}
                </span>
              </div>
              <Slider
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={[slider.value]}
                onValueChange={([value]) => updateParam(slider.key, value)}
                className="[&_[data-slot=slider-thumb]]:bg-indigo-400 [&_[data-slot=slider-thumb]]:border-indigo-500 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-indigo-500 [&_[data-slot=slider-range]]:to-purple-500 [&_[data-slot=slider-track]]:bg-white/5"
              />
              <div className="flex justify-between text-xs text-muted-foreground/60">
                <span>{slider.format(slider.min)}</span>
                <span>{slider.format(slider.max)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass rounded-[14px] border border-white/[0.06] p-3 sm:p-6"
      >
        <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Projection de croissance</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
          3 scenarios : pessimiste ({pessimisticRate}%), moyen ({params.annualRate}%), optimiste ({optimisticRate}%)
        </p>

        <div className="h-[220px] sm:h-[350px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPessimistic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }}
                tickFormatter={(v) => `${v}a`}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }}
                tickFormatter={(v) => {
                  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                  if (v >= 1000) return `${Math.round(v / 1000)}k`;
                  return String(v);
                }}
              />
              <RechartsTooltip content={<CustomTooltipContent />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: "20px", flexWrap: "wrap" }}
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    optimistic: "Optimiste",
                    average: "Moyen",
                    pessimistic: "Pessimiste",
                    contributions: "Contributions",
                  };
                  return (
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
                      {labels[value] || value}
                    </span>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="contributions"
                stroke="#71717a"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                fill="url(#colorContributions)"
                animationDuration={2000}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="pessimistic"
                stroke="#f87171"
                strokeWidth={2}
                fill="url(#colorPessimistic)"
                animationDuration={2000}
                animationEasing="ease-out"
                animationBegin={200}
              />
              <Area
                type="monotone"
                dataKey="average"
                stroke="#818cf8"
                strokeWidth={2.5}
                fill="url(#colorAverage)"
                animationDuration={2000}
                animationEasing="ease-out"
                animationBegin={400}
              />
              <Area
                type="monotone"
                dataKey="optimistic"
                stroke="#34d399"
                strokeWidth={2}
                fill="url(#colorOptimistic)"
                animationDuration={2000}
                animationEasing="ease-out"
                animationBegin={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            label: "Pessimiste",
            rate: pessimisticRate,
            value: finalYear?.pessimistic || 0,
            interest: (finalYear?.pessimistic || 0) - totalContributions,
            color: "text-red-400",
            borderColor: "border-red-500/20",
            bgColor: "bg-red-500/10",
            dotColor: "bg-red-400",
          },
          {
            label: "Moyen",
            rate: params.annualRate,
            value: finalYear?.average || 0,
            interest: (finalYear?.average || 0) - totalContributions,
            color: "text-indigo-400",
            borderColor: "border-indigo-500/20",
            bgColor: "bg-indigo-500/10",
            dotColor: "bg-indigo-400",
          },
          {
            label: "Optimiste",
            rate: optimisticRate,
            value: finalYear?.optimistic || 0,
            interest: (finalYear?.optimistic || 0) - totalContributions,
            color: "text-emerald-400",
            borderColor: "border-emerald-500/20",
            bgColor: "bg-emerald-500/10",
            dotColor: "bg-emerald-400",
          },
        ].map((scenario, index) => (
          <motion.div
            key={scenario.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.04, y: -4 }}
            className={`glass rounded-[14px] border ${scenario.borderColor} p-3 sm:p-5 cursor-pointer hover:shadow-[0_8px_30px_rgba(129,140,248,0.12)] transition-all duration-300`}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2.5 h-2.5 rounded-full ${scenario.dotColor}`} />
              <span className="text-sm font-medium text-muted-foreground">{scenario.label}</span>
              <span className={`text-xs ml-auto ${scenario.color}`}>{scenario.rate}%/an</span>
            </div>
            <p className={`text-2xl font-bold ${scenario.color} mb-1`}>
              {formatCurrency(scenario.value)}
            </p>
            <div className="flex justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-white/[0.06]">
              <div>
                <p className="text-muted-foreground/60 mb-0.5">Interets</p>
                <p className="font-medium text-white">{formatCurrency(scenario.interest)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground/60 mb-0.5">Ratio</p>
                <p className="font-medium text-white">
                  {totalContributions > 0
                    ? `${((scenario.interest / totalContributions) * 100).toFixed(0)}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
