import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function generateIntradayData(basePrice: number, changePercent: number, points: number = 78) {
  const data: { time: string; price: number }[] = [];
  const startHour = 9;
  const minuteStep = 5;
  const volatility = Math.abs(changePercent) * 0.3 + 0.1;

  let currentPrice = basePrice * (1 - changePercent / 100);

  for (let i = 0; i < points; i++) {
    const totalMinutes = i * minuteStep;
    const hours = startHour + Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    const progress = i / (points - 1);
    const trendComponent = (changePercent / 100) * basePrice * progress;
    const noise = (Math.random() - 0.5) * basePrice * (volatility / 100);
    const meanReversion = (basePrice + trendComponent - currentPrice) * 0.05;

    currentPrice = currentPrice + trendComponent * (1 / points) + noise + meanReversion;
    currentPrice = Math.max(currentPrice, basePrice * 0.95);
    currentPrice = Math.min(currentPrice, basePrice * 1.05);

    if (i === points - 1) {
      currentPrice = basePrice;
    }

    data.push({ time, price: parseFloat(currentPrice.toFixed(2)) });
  }

  return data;
}

const MARKET_LABELS: Record<string, { name: string; type: string; currency: string }> = {
  "^FCHI": { name: "CAC 40", type: "index", currency: "EUR" },
  "^GSPC": { name: "S&P 500", type: "index", currency: "USD" },
  "^IXIC": { name: "NASDAQ", type: "index", currency: "USD" },
  "BTC-USD": { name: "Bitcoin", type: "crypto", currency: "USD" },
  "ETH-USD": { name: "Ethereum", type: "crypto", currency: "USD" },
  "GC=F": { name: "Or (Gold)", type: "commodity", currency: "USD" },
};

const MOCK_MARKET_DATA = [
  { ticker: "^FCHI", price: 7425.3, change: 45.2, changePercent: 0.61, volume: 3200000000 },
  { ticker: "^GSPC", price: 5890.45, change: 22.1, changePercent: 0.38, volume: 4100000000 },
  { ticker: "^IXIC", price: 18920.8, change: -35.6, changePercent: -0.19, volume: 5300000000 },
  { ticker: "BTC-USD", price: 95000, change: 1250, changePercent: 1.33, volume: 28000000000 },
  { ticker: "ETH-USD", price: 3400, change: -45, changePercent: -1.31, volume: 12000000000 },
  { ticker: "GC=F", price: 2345.6, change: 12.3, changePercent: 0.53, volume: 180000 },
];

export async function GET() {
  try {
    let marketData = await prisma.marketData.findMany({
      orderBy: { timestamp: "desc" },
    });

    // Deduplicate by ticker (keep most recent)
    const seenTickers = new Set<string>();
    marketData = marketData.filter((d) => {
      if (seenTickers.has(d.ticker)) return false;
      seenTickers.add(d.ticker);
      return true;
    });

    // Fallback to mock data if DB is empty
    if (marketData.length === 0) {
      marketData = MOCK_MARKET_DATA.map((d, i) => ({
        id: `mock-${i}`,
        ticker: d.ticker,
        price: d.price,
        change: d.change,
        changePercent: d.changePercent,
        volume: d.volume,
        timestamp: new Date(),
      }));
    }

    const enrichedData = marketData.map((item) => {
      const label = MARKET_LABELS[item.ticker] || {
        name: item.ticker,
        type: "unknown",
        currency: "USD",
      };

      return {
        ...item,
        name: label.name,
        type: label.type,
        currency: label.currency,
        intradayData: generateIntradayData(item.price, item.changePercent),
      };
    });

    return NextResponse.json(enrichedData);
  } catch (error) {
    console.error("Error fetching market data:", error);

    // Full fallback with mock data
    const fallback = MOCK_MARKET_DATA.map((d, i) => {
      const label = MARKET_LABELS[d.ticker] || {
        name: d.ticker,
        type: "unknown",
        currency: "USD",
      };

      return {
        id: `mock-${i}`,
        ...d,
        timestamp: new Date(),
        name: label.name,
        type: label.type,
        currency: label.currency,
        intradayData: generateIntradayData(d.price, d.changePercent),
      };
    });

    return NextResponse.json(fallback);
  }
}
