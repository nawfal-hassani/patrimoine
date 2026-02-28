import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function generatePortfolioHistory(totalValue: number) {
  const months = 12;
  const data: { month: string; value: number }[] = [];
  const now = new Date();
  const monthNames = [
    "Jan", "Fev", "Mar", "Avr", "Mai", "Jun",
    "Jul", "Aou", "Sep", "Oct", "Nov", "Dec",
  ];

  const startValue = totalValue * 0.72;
  const trend = (totalValue - startValue) / months;

  let value = startValue;
  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const noise = (Math.random() - 0.45) * totalValue * 0.025;
    value += trend + noise;
    value = Math.max(startValue * 0.9, value);

    data.push({
      month: `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`,
      value: Math.round(value),
    });
  }

  data[data.length - 1].value = Math.round(totalValue);
  return data;
}

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      include: { portfolio: true },
    });

    let totalValue = 0;
    let totalCost = 0;

    const allocationMap: Record<string, { label: string; value: number; color: string }> = {};

    const typeLabels: Record<string, string> = {
      stock: "Actions",
      etf: "ETF",
      crypto: "Crypto",
      real_estate: "Immobilier",
      savings: "Epargne",
    };

    const typeColors: Record<string, string> = {
      stock: "#818cf8",
      etf: "#a78bfa",
      crypto: "#f59e0b",
      real_estate: "#34d399",
      savings: "#60a5fa",
    };

    for (const asset of assets) {
      const assetValue = asset.quantity * asset.currentPrice;
      const assetCost = asset.quantity * asset.buyPrice;
      totalValue += assetValue;
      totalCost += assetCost;

      if (!allocationMap[asset.type]) {
        allocationMap[asset.type] = {
          label: typeLabels[asset.type] || asset.type,
          value: 0,
          color: typeColors[asset.type] || "#888",
        };
      }
      allocationMap[asset.type].value += assetValue;
    }

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

    const allocation = Object.values(allocationMap).map((item) => ({
      ...item,
      value: Math.round(item.value),
      percent: Math.round((item.value / totalValue) * 1000) / 10,
    }));

    allocation.sort((a, b) => b.value - a.value);

    const enrichedAssets = assets.map((asset) => {
      const assetValue = asset.quantity * asset.currentPrice;
      const assetCost = asset.quantity * asset.buyPrice;
      return {
        id: asset.id,
        name: asset.name,
        ticker: asset.ticker,
        type: asset.type,
        totalValue: assetValue,
        totalCost: assetCost,
        gainLoss: assetValue - assetCost,
        gainLossPercent: assetCost > 0 ? ((assetValue - assetCost) / assetCost) * 100 : 0,
      };
    });

    const sortedByPerformance = [...enrichedAssets].sort(
      (a, b) => b.gainLossPercent - a.gainLossPercent
    );

    const topPerformers = sortedByPerformance.slice(0, 3);
    const worstPerformers = sortedByPerformance.slice(-3).reverse();

    const history = generatePortfolioHistory(totalValue);

    return NextResponse.json({
      totalValue: Math.round(totalValue),
      totalCost: Math.round(totalCost),
      totalGainLoss: Math.round(totalGainLoss),
      totalGainLossPercent: Math.round(totalGainLossPercent * 100) / 100,
      assetCount: assets.length,
      allocation,
      topPerformers,
      worstPerformers,
      history,
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}
