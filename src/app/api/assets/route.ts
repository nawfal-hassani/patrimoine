import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function generateSparklineData(currentPrice: number, buyPrice: number, points: number = 20): number[] {
  const data: number[] = [];
  const trend = (currentPrice - buyPrice) / points;
  let price = buyPrice;

  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * currentPrice * 0.04;
    price += trend + noise;
    price = Math.max(buyPrice * 0.6, price);
    data.push(Math.round(price * 100) / 100);
  }

  data[data.length - 1] = currentPrice;
  return data;
}

function generateHistoryData(currentPrice: number, buyPrice: number, months: number = 12) {
  const data: { date: string; price: number }[] = [];
  const now = new Date();
  const trend = (currentPrice - buyPrice) / (months * 30);
  let price = buyPrice;

  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);

    for (let day = 1; day <= 28; day += 7) {
      const d = new Date(date.getFullYear(), date.getMonth(), day);
      if (d > now) break;
      const noise = (Math.random() - 0.5) * currentPrice * 0.03;
      price += trend * 7 + noise;
      price = Math.max(buyPrice * 0.7, price);
      data.push({
        date: d.toISOString().split("T")[0],
        price: Math.round(price * 100) / 100,
      });
    }
  }

  if (data.length > 0) {
    data[data.length - 1].price = currentPrice;
  }

  return data;
}

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      include: { portfolio: true },
      orderBy: { updatedAt: "desc" },
    });

    const enrichedAssets = assets.map((asset) => {
      const totalValue = asset.quantity * asset.currentPrice;
      const totalCost = asset.quantity * asset.buyPrice;
      const gainLoss = totalValue - totalCost;
      const gainLossPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

      return {
        ...asset,
        totalValue,
        totalCost,
        gainLoss,
        gainLossPercent,
        sparklineData: generateSparklineData(asset.currentPrice, asset.buyPrice),
        historyData: generateHistoryData(asset.currentPrice, asset.buyPrice),
      };
    });

    return NextResponse.json(enrichedAssets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}
