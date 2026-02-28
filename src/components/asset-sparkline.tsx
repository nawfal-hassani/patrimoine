"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface AssetSparklineProps {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}

export function AssetSparkline({
  data,
  positive,
  width = 100,
  height = 32,
}: AssetSparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  const color = positive ? "#34d399" : "#f87171";

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
