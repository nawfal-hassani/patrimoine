"use client";

import { motion } from "framer-motion";
import { formatPercent } from "@/lib/utils";

interface SectorData {
  name: string;
  performance: number;
  marketCap: string;
}

const SECTOR_DATA: SectorData[] = [
  { name: "Technologie", performance: 2.4, marketCap: "3.2T" },
  { name: "Finance", performance: 0.8, marketCap: "1.8T" },
  { name: "Énergie", performance: -1.2, marketCap: "1.5T" },
  { name: "Santé", performance: 1.5, marketCap: "2.1T" },
  { name: "Consommation", performance: -0.3, marketCap: "1.2T" },
  { name: "Industrie", performance: 0.6, marketCap: "1.4T" },
  { name: "Matériaux", performance: -0.9, marketCap: "0.8T" },
  { name: "Immobilier", performance: -1.8, marketCap: "0.6T" },
  { name: "Telecom", performance: 0.3, marketCap: "0.9T" },
  { name: "Utilities", performance: -0.5, marketCap: "0.7T" },
  { name: "Luxe", performance: 3.1, marketCap: "1.1T" },
  { name: "Auto", performance: -2.1, marketCap: "0.5T" },
];

function getHeatmapColor(performance: number): string {
  const absPerf = Math.abs(performance);
  const intensity = Math.min(absPerf / 3, 1);

  if (performance >= 0) {
    const r = Math.round(16 + (52 - 16) * (1 - intensity));
    const g = Math.round(50 + (211 - 50) * intensity);
    const b = Math.round(30 + (153 - 30) * intensity * 0.6);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const r = Math.round(80 + (248 - 80) * intensity);
    const g = Math.round(30 + (113 - 30) * (1 - intensity));
    const b = Math.round(30 + (113 - 30) * (1 - intensity));
    return `rgb(${r}, ${g}, ${b})`;
  }
}

function getTextColor(performance: number): string {
  const absPerf = Math.abs(performance);
  return absPerf > 1.5 ? "text-white" : "text-white/80";
}

export function MarketHeatmap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass rounded-[14px] p-4 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-white mb-4">
        Heatmap sectorielle
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {SECTOR_DATA.map((sector, index) => (
          <motion.div
            key={sector.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
            className="relative rounded-xl p-3 cursor-pointer transition-transform duration-200 hover:scale-105 hover:z-10"
            style={{
              backgroundColor: getHeatmapColor(sector.performance),
              minHeight: "80px",
            }}
          >
            <div className="flex flex-col justify-between h-full">
              <p
                className={`text-xs font-medium leading-tight ${getTextColor(
                  sector.performance
                )}`}
              >
                {sector.name}
              </p>
              <div className="mt-1">
                <p
                  className={`text-sm font-bold ${getTextColor(
                    sector.performance
                  )}`}
                >
                  {formatPercent(sector.performance)}
                </p>
                <p className="text-[10px] text-white/50 mt-0.5">
                  {sector.marketCap}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-muted-foreground">Baisse</span>
        <div className="flex h-2 rounded-full overflow-hidden w-48">
          <div className="flex-1 bg-gradient-to-r from-red-500 via-red-500/30 to-transparent" />
          <div className="flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-emerald-500" />
        </div>
        <span className="text-xs text-muted-foreground">Hausse</span>
      </div>
    </motion.div>
  );
}
