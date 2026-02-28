import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const watchlistSchema = z.object({
  ticker: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
});

const MOCK_WATCHLIST = [
  { id: "mock-1", ticker: "NVDA", name: "NVIDIA", type: "stock", addedAt: new Date() },
  { id: "mock-2", ticker: "ASML.AS", name: "ASML Holding", type: "stock", addedAt: new Date() },
  { id: "mock-3", ticker: "ADA-USD", name: "Cardano", type: "crypto", addedAt: new Date() },
  { id: "mock-4", ticker: "IWDA.AS", name: "iShares MSCI World", type: "etf", addedAt: new Date() },
];

export async function GET() {
  try {
    let items = await prisma.watchlistItem.findMany({
      orderBy: { addedAt: "desc" },
    });

    if (items.length === 0) {
      return NextResponse.json(MOCK_WATCHLIST);
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(MOCK_WATCHLIST);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = watchlistSchema.parse(body);

    // Check if already exists
    const existing = await prisma.watchlistItem.findFirst({
      where: { ticker: parsed.ticker },
    });

    if (existing) {
      // Remove it (toggle behavior)
      await prisma.watchlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "removed", ticker: parsed.ticker });
    }

    // Add new item
    const item = await prisma.watchlistItem.create({
      data: parsed,
    });

    return NextResponse.json({ action: "added", item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.issues }, { status: 400 });
    }
    console.error("Error updating watchlist:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
