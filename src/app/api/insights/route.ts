import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface AssetAllocation {
  type: string;
  totalValue: number;
  percentage: number;
  count: number;
}

interface RebalanceSuggestion {
  assetType: string;
  currentPercent: number;
  targetPercent: number;
  action: "reduce" | "increase";
  label: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface Alert {
  type: string;
  severity: "critical" | "warning" | "info";
  message: string;
  currentPercent: number;
  threshold: number;
}

const TARGET_ALLOCATION: Record<string, { min: number; max: number; target: number; label: string }> = {
  stock: { min: 20, max: 40, target: 30, label: "Actions" },
  etf: { min: 15, max: 35, target: 25, label: "ETF" },
  crypto: { min: 5, max: 15, target: 10, label: "Crypto" },
  real_estate: { min: 20, max: 40, target: 25, label: "Immobilier" },
  savings: { min: 5, max: 20, target: 10, label: "Epargne" },
};

function calculateDiversificationScore(allocations: AssetAllocation[]): number {
  if (allocations.length === 0) return 0;

  const totalValue = allocations.reduce((sum, a) => sum + a.totalValue, 0);
  if (totalValue === 0) return 0;

  // Herfindahl-Hirschman Index (HHI)
  const percentages = allocations.map((a) => a.totalValue / totalValue);
  const hhi = percentages.reduce((sum, p) => sum + p * p, 0);

  // Normalize: HHI ranges from 1/n (perfect diversification) to 1 (all in one asset)
  const n = allocations.length;
  const minHHI = 1 / n;
  const maxHHI = 1;

  // Inverted HHI score (0-100)
  let score = ((maxHHI - hhi) / (maxHHI - minHHI)) * 100;

  // Bonus for number of asset types (up to 5 types = full bonus)
  const typeDiversityBonus = Math.min(n / 5, 1) * 15;
  score = Math.min(100, score + typeDiversityBonus);

  return Math.round(Math.max(0, Math.min(100, score)));
}

function generateSuggestions(allocations: AssetAllocation[]): RebalanceSuggestion[] {
  const totalValue = allocations.reduce((sum, a) => sum + a.totalValue, 0);
  if (totalValue === 0) return [];

  const suggestions: RebalanceSuggestion[] = [];

  for (const alloc of allocations) {
    const target = TARGET_ALLOCATION[alloc.type];
    if (!target) continue;

    const currentPercent = (alloc.totalValue / totalValue) * 100;
    const diff = currentPercent - target.target;

    if (Math.abs(diff) > 5) {
      const action = diff > 0 ? "reduce" : "increase";
      const priority = Math.abs(diff) > 15 ? "high" : Math.abs(diff) > 10 ? "medium" : "low";

      suggestions.push({
        assetType: alloc.type,
        currentPercent: Math.round(currentPercent * 10) / 10,
        targetPercent: target.target,
        action,
        label: target.label,
        description:
          action === "reduce"
            ? `Surexposition ${target.label} ${currentPercent.toFixed(0)}% -> reduire a ${target.target}%`
            : `Sous-exposition ${target.label} ${currentPercent.toFixed(0)}% -> augmenter a ${target.target}%`,
        priority,
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions;
}

function generateAlerts(allocations: AssetAllocation[]): Alert[] {
  const totalValue = allocations.reduce((sum, a) => sum + a.totalValue, 0);
  if (totalValue === 0) return [];

  const alerts: Alert[] = [];

  for (const alloc of allocations) {
    const target = TARGET_ALLOCATION[alloc.type];
    if (!target) continue;

    const currentPercent = (alloc.totalValue / totalValue) * 100;

    if (currentPercent > target.max) {
      alerts.push({
        type: alloc.type,
        severity: currentPercent > target.max + 10 ? "critical" : "warning",
        message: `${target.label} represente ${currentPercent.toFixed(1)}% du portefeuille (max recommande: ${target.max}%)`,
        currentPercent: Math.round(currentPercent * 10) / 10,
        threshold: target.max,
      });
    }

    if (currentPercent < target.min && alloc.totalValue > 0) {
      alerts.push({
        type: alloc.type,
        severity: "info",
        message: `${target.label} sous-represente a ${currentPercent.toFixed(1)}% (min recommande: ${target.min}%)`,
        currentPercent: Math.round(currentPercent * 10) / 10,
        threshold: target.min,
      });
    }
  }

  return alerts;
}

function calculateRiskIndicators(assets: { buyPrice: number; currentPrice: number; quantity: number; type: string }[]) {
  if (assets.length === 0) {
    return { volatility: 0, sharpeRatio: 0, maxDrawdown: 0, beta: 0 };
  }

  // Simulate monthly returns based on asset types
  const typeVolatility: Record<string, number> = {
    stock: 0.18,
    etf: 0.12,
    crypto: 0.60,
    real_estate: 0.06,
    savings: 0.02,
  };

  const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);

  // Weighted average volatility
  let weightedVolatility = 0;
  let portfolioReturn = 0;

  for (const asset of assets) {
    const value = asset.quantity * asset.currentPrice;
    const weight = value / totalValue;
    const vol = typeVolatility[asset.type] || 0.15;
    const assetReturn = asset.buyPrice > 0 ? (asset.currentPrice - asset.buyPrice) / asset.buyPrice : 0;

    weightedVolatility += weight * vol;
    portfolioReturn += weight * assetReturn;
  }

  // Annualized portfolio return
  const annualizedReturn = portfolioReturn * 100;

  // Risk-free rate (Livret A at 3%)
  const riskFreeRate = 3;

  // Sharpe Ratio
  const sharpeRatio = weightedVolatility > 0 ? (annualizedReturn - riskFreeRate) / (weightedVolatility * 100) : 0;

  // Simulate max drawdown based on volatility
  const maxDrawdown = weightedVolatility * 2.5 * 100;

  return {
    volatility: Math.round(weightedVolatility * 10000) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 10) / 10,
    beta: Math.round((weightedVolatility / 0.15) * 100) / 100,
  };
}

export async function GET() {
  try {
    const [assets, profile] = await Promise.all([
      prisma.asset.findMany({ include: { portfolio: true } }),
      prisma.investorProfile.findFirst({ orderBy: { createdAt: "desc" } }),
    ]);

    // Calculate allocations by type
    const allocationMap = new Map<string, { totalValue: number; count: number }>();

    for (const asset of assets) {
      const value = asset.quantity * asset.currentPrice;
      const existing = allocationMap.get(asset.type) || { totalValue: 0, count: 0 };
      allocationMap.set(asset.type, {
        totalValue: existing.totalValue + value,
        count: existing.count + 1,
      });
    }

    const totalPortfolioValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);

    const allocations: AssetAllocation[] = Array.from(allocationMap.entries()).map(([type, data]) => ({
      type,
      totalValue: data.totalValue,
      percentage: totalPortfolioValue > 0 ? Math.round((data.totalValue / totalPortfolioValue) * 1000) / 10 : 0,
      count: data.count,
    }));

    const diversificationScore = calculateDiversificationScore(allocations);
    const suggestions = generateSuggestions(allocations);
    const alerts = generateAlerts(allocations);
    const riskIndicators = calculateRiskIndicators(
      assets.map((a) => ({
        buyPrice: a.buyPrice,
        currentPrice: a.currentPrice,
        quantity: a.quantity,
        type: a.type,
      }))
    );

    return NextResponse.json({
      profile,
      diversificationScore,
      allocations,
      suggestions,
      alerts,
      riskIndicators,
      totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100,
    });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { riskTolerance, investmentHorizon, experience, objectives } = body;

    // Calculate profile score based on answers
    const riskScores: Record<string, number> = {
      conservative: 20,
      moderate: 50,
      aggressive: 75,
      very_aggressive: 95,
    };
    const horizonScores: Record<string, number> = {
      short: 15,
      medium: 40,
      long: 70,
      very_long: 90,
    };
    const experienceScores: Record<string, number> = {
      beginner: 20,
      intermediate: 50,
      advanced: 75,
      expert: 95,
    };

    const score = Math.round(
      (riskScores[riskTolerance] || 50) * 0.4 +
        (horizonScores[investmentHorizon] || 50) * 0.3 +
        (experienceScores[experience] || 50) * 0.3
    );

    const profile = await prisma.investorProfile.create({
      data: {
        riskTolerance,
        investmentHorizon,
        experience,
        objectives: objectives || "",
        score,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
