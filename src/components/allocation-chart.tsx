"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface AllocationItem {
  label: string;
  value: number;
  percent: number;
  color: string;
}

interface AllocationChartProps {
  data: AllocationItem[];
  totalValue: number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="glass rounded-[10px] px-4 py-3 shadow-xl z-50 relative">
      <p className="text-xs text-zinc-400 mb-1">{item.label}</p>
      <p className="text-sm font-semibold text-white">
        {formatCurrency(item.value)}
      </p>
      <p className="text-xs text-zinc-500">{item.percent}%</p>
    </div>
  );
}

export function AllocationChart({ data, totalValue }: AllocationChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      className="glass rounded-[14px] p-4 sm:p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-1">
        Repartition du patrimoine
      </h3>
      <p className="text-sm text-zinc-400 mb-6">Par classe d&apos;actifs</p>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
        <div className="h-[220px] w-[220px] relative flex-shrink-0 z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                animationDuration={1200}
                animationEasing="ease-out"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 50, pointerEvents: "none" }} offset={10} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xs text-zinc-400">Total</p>
            <p className="text-base font-bold text-white">
              {formatCurrency(totalValue)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {data.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
              className="flex items-center"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-zinc-300 ml-3">{item.label}</span>
              <span className="text-sm font-medium text-white ml-2">
                {formatCurrency(item.value)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
