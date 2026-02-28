import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const MOCK_NEWS = [
  {
    id: "mock-1",
    title: "La BCE maintient ses taux directeurs inchangés",
    description:
      "Christine Lagarde a annoncé le maintien des taux, signalant une pause dans le cycle de resserrement monétaire. Les marchés européens ont bien réagi à cette annonce.",
    url: "https://example.com/bce-taux",
    source: "Les Echos",
    category: "Macroéconomie",
    relevanceScore: 0.95,
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
    publishedAt: new Date("2026-02-28T08:30:00"),
  },
  {
    id: "mock-2",
    title: "Bitcoin franchit les 95 000$ pour la première fois",
    description:
      "La cryptomonnaie phare atteint un nouveau sommet historique, portée par l'adoption institutionnelle et l'approbation de nouveaux ETF Bitcoin spot.",
    url: "https://example.com/btc-95k",
    source: "CoinDesk",
    category: "Crypto",
    relevanceScore: 0.92,
    imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400",
    publishedAt: new Date("2026-02-28T07:15:00"),
  },
  {
    id: "mock-3",
    title: "LVMH publie des résultats record au T4",
    description:
      "Le groupe de luxe français dépasse les attentes avec un CA en hausse de 13% sur le trimestre. L'action grimpe de 4% en pré-ouverture.",
    url: "https://example.com/lvmh-q4",
    source: "Reuters",
    category: "Actions",
    relevanceScore: 0.88,
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
    publishedAt: new Date("2026-02-27T18:00:00"),
  },
  {
    id: "mock-4",
    title: "L'immobilier parisien montre des signes de reprise",
    description:
      "Après deux ans de baisse, les prix au m² repartent à la hausse dans plusieurs arrondissements. Le marché reprend confiance.",
    url: "https://example.com/immo-paris",
    source: "Les Echos",
    category: "Immobilier",
    relevanceScore: 0.85,
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400",
    publishedAt: new Date("2026-02-27T14:30:00"),
  },
  {
    id: "mock-5",
    title: "ETF : collecte record en Europe en 2025",
    description:
      "Les ETF européens ont collecté plus de 200 milliards d'euros cette année, un record historique. Les investisseurs privilégient l'indiciel.",
    url: "https://example.com/etf-record",
    source: "Reuters",
    category: "ETF",
    relevanceScore: 0.82,
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400",
    publishedAt: new Date("2026-02-27T10:00:00"),
  },
  {
    id: "mock-6",
    title: "Solana dépasse Ethereum en transactions quotidiennes",
    description:
      "Le réseau Solana traite désormais plus de transactions par jour qu'Ethereum, marquant un tournant dans la guerre des blockchains.",
    url: "https://example.com/sol-eth",
    source: "CoinDesk",
    category: "Crypto",
    relevanceScore: 0.78,
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
    publishedAt: new Date("2026-02-26T16:45:00"),
  },
  {
    id: "mock-7",
    title: "La Fed signale une possible baisse des taux au T2 2026",
    description:
      "Jerome Powell a indiqué que les conditions économiques pourraient justifier un assouplissement monétaire au deuxième trimestre.",
    url: "https://example.com/fed-rates",
    source: "Bloomberg",
    category: "Macroéconomie",
    relevanceScore: 0.93,
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400",
    publishedAt: new Date("2026-02-26T20:00:00"),
  },
  {
    id: "mock-8",
    title: "Amundi lance un nouvel ETF ESG à frais réduits",
    description:
      "Le géant de la gestion passive propose un ETF World ESG avec des frais de 0.12%, le plus bas du marché européen.",
    url: "https://example.com/amundi-etf",
    source: "Boursorama",
    category: "ETF",
    relevanceScore: 0.75,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    publishedAt: new Date("2026-02-26T09:00:00"),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let newsItems = await prisma.newsItem.findMany({
      orderBy: { publishedAt: "desc" },
      ...(category && category !== "Toutes"
        ? { where: { category } }
        : {}),
    });

    // Fallback to mock data if DB is empty
    if (newsItems.length === 0) {
      let mockData = MOCK_NEWS;
      if (category && category !== "Toutes") {
        mockData = mockData.filter((n) => n.category === category);
      }
      return NextResponse.json(mockData);
    }

    return NextResponse.json(newsItems);
  } catch (error) {
    console.error("Error fetching news:", error);

    // Full fallback
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    let mockData = MOCK_NEWS;
    if (category && category !== "Toutes") {
      mockData = mockData.filter((n) => n.category === category);
    }
    return NextResponse.json(mockData);
  }
}
