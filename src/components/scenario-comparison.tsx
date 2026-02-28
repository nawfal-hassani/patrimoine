"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";
import { Calendar, TrendingUp, ArrowUpRight } from "lucide-react";

interface ScenarioComparisonProps {
  initialAmount: number;
  monthlyContribution: number;
  annualRate: number;
  durationYears: number;
}

interface MilestoneRow {
  years: number;
  totalContributions: number;
  pessimistic: number;
  average: number;
  optimistic: number;
  pessimisticInterest: number;
  averageInterest: number;
  optimisticInterest: number;
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
  return pv * compoundFactor + pmt * ((compoundFactor - 1) / monthlyRate);
}

export function ScenarioComparison({
  initialAmount,
  monthlyContribution,
  annualRate,
  durationYears,
}: ScenarioComparisonProps) {
  const pessimisticRate = Math.max(0, annualRate - 3);
  const optimisticRate = annualRate + 3;

  const milestones: MilestoneRow[] = useMemo(() => {
    const years = [5, 10, 20, 30].filter((y) => y <= durationYears);
    if (!years.includes(durationYears)) {
      years.push(durationYears);
    }

    return years.map((y) => {
      const totalContributions = initialAmount + monthlyContribution * 12 * y;
      const pessimistic = Math.round(
        calculateCompoundInterest(initialAmount, monthlyContribution, pessimisticRate, y)
      );
      const average = Math.round(
        calculateCompoundInterest(initialAmount, monthlyContribution, annualRate, y)
      );
      const optimistic = Math.round(
        calculateCompoundInterest(initialAmount, monthlyContribution, optimisticRate, y)
      );

      return {
        years: y,
        totalContributions: Math.round(totalContributions),
        pessimistic,
        average,
        optimistic,
        pessimisticInterest: pessimistic - totalContributions,
        averageInterest: average - totalContributions,
        optimisticInterest: optimistic - totalContributions,
      };
    });
  }, [initialAmount, monthlyContribution, annualRate, durationYears, pessimisticRate, optimisticRate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      whileHover={{ scale: 1.01, y: -3 }}
      className="glass rounded-[14px] border border-white/[0.06] overflow-hidden hover:border-white/[0.12] hover:shadow-[0_8px_30px_rgba(129,140,248,0.1)] transition-all duration-300"
    >
      <div className="p-3 sm:p-6 border-b border-white/[0.06]">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          Projection par paliers
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Comparaison des 3 scenarios aux differentes echeances
        </p>
      </div>

      {/* Mobile: card layout */}
      <div className="block sm:hidden p-3 space-y-3">
        {milestones.map((row, index) => (
          <motion.div
            key={row.years}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.7 + index * 0.08 }}
            className={cn(
              "rounded-xl border border-white/[0.06] p-3 space-y-3",
              row.years === durationYears && "bg-indigo-500/5 border-indigo-500/20"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{row.years}</span>
                </div>
                <span className="text-sm text-muted-foreground">ans</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Investi: <span className="text-white font-medium">{formatCurrency(row.totalContributions)}</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="text-[10px] text-red-400/80">Pessimiste</span>
                </div>
                <p className="text-sm font-semibold text-red-400">{formatCurrency(row.pessimistic)}</p>
                <p className="text-[10px] text-red-400/60 mt-0.5">+{formatCurrency(row.pessimisticInterest)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span className="text-[10px] text-indigo-400/80">Moyen</span>
                </div>
                <p className="text-sm font-semibold text-indigo-400">{formatCurrency(row.average)}</p>
                <p className="text-[10px] text-indigo-400/60 mt-0.5">+{formatCurrency(row.averageInterest)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-emerald-400/80">Optimiste</span>
                </div>
                <p className="text-sm font-semibold text-emerald-400">{formatCurrency(row.optimistic)}</p>
                <p className="text-[10px] text-emerald-400/60 mt-0.5">+{formatCurrency(row.optimisticInterest)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Duree</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">
                Contributions
              </th>
              <th className="text-right text-xs font-medium text-red-400/80 p-4">
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  Pessimiste ({pessimisticRate}%)
                </div>
              </th>
              <th className="text-right text-xs font-medium text-indigo-400/80 p-4">
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  Moyen ({annualRate}%)
                </div>
              </th>
              <th className="text-right text-xs font-medium text-emerald-400/80 p-4">
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  Optimiste ({optimisticRate}%)
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((row, index) => (
              <motion.tr
                key={row.years}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.08 }}
                className={cn(
                  "border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]",
                  row.years === durationYears && "bg-indigo-500/5"
                )}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{row.years}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">ans</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-white font-medium">
                    {formatCurrency(row.totalContributions)}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div>
                    <span className="text-sm font-semibold text-red-400">
                      {formatCurrency(row.pessimistic)}
                    </span>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <ArrowUpRight className="w-3 h-3 text-red-400/60" />
                      <span className="text-xs text-red-400/60">
                        +{formatCurrency(row.pessimisticInterest)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div>
                    <span className="text-sm font-semibold text-indigo-400">
                      {formatCurrency(row.average)}
                    </span>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <ArrowUpRight className="w-3 h-3 text-indigo-400/60" />
                      <span className="text-xs text-indigo-400/60">
                        +{formatCurrency(row.averageInterest)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div>
                    <span className="text-sm font-semibold text-emerald-400">
                      {formatCurrency(row.optimistic)}
                    </span>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <ArrowUpRight className="w-3 h-3 text-emerald-400/60" />
                      <span className="text-xs text-emerald-400/60">
                        +{formatCurrency(row.optimisticInterest)}
                      </span>
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="p-3 sm:p-4 border-t border-white/[0.06] bg-white/[0.01]">
        <p className="text-[10px] sm:text-xs text-muted-foreground/60 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Calcul base sur les interets composes mensuels</span>
        </p>
      </div>
    </motion.div>
  );
}
