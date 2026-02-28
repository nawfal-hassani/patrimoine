import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.asset.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.marketData.deleteMany();
  await prisma.newsItem.deleteMany();
  await prisma.investorProfile.deleteMany();
  await prisma.watchlistItem.deleteMany();

  const portfolio = await prisma.portfolio.create({
    data: { name: "Mon Patrimoine", description: "Portefeuille principal diversifié" },
  });

  const assets = [
    { name: "LVMH", ticker: "MC.PA", type: "stock", quantity: 5, buyPrice: 680, currentPrice: 742, buyDate: new Date("2023-06-15"), category: "Luxe", currency: "EUR" },
    { name: "TotalEnergies", ticker: "TTE.PA", type: "stock", quantity: 30, buyPrice: 52, currentPrice: 58.4, buyDate: new Date("2023-03-10"), category: "Énergie", currency: "EUR" },
    { name: "Air Liquide", ticker: "AI.PA", type: "stock", quantity: 15, buyPrice: 155, currentPrice: 178, buyDate: new Date("2022-11-20"), category: "Industrie", currency: "EUR" },
    { name: "Apple", ticker: "AAPL", type: "stock", quantity: 20, buyPrice: 165, currentPrice: 198, buyDate: new Date("2023-01-05"), category: "Tech", currency: "USD" },
    { name: "Microsoft", ticker: "MSFT", type: "stock", quantity: 10, buyPrice: 310, currentPrice: 415, buyDate: new Date("2023-02-14"), category: "Tech", currency: "USD" },
    { name: "MSCI World ETF", ticker: "CW8.PA", type: "etf", quantity: 50, buyPrice: 380, currentPrice: 428, buyDate: new Date("2022-09-01"), category: "Monde", currency: "EUR" },
    { name: "S&P 500 ETF", ticker: "SPY", type: "etf", quantity: 15, buyPrice: 420, currentPrice: 512, buyDate: new Date("2023-04-20"), category: "US", currency: "USD" },
    { name: "Emerging Markets ETF", ticker: "AEEM.PA", type: "etf", quantity: 100, buyPrice: 22, currentPrice: 24.5, buyDate: new Date("2023-07-01"), category: "Émergents", currency: "EUR" },
    { name: "Bitcoin", ticker: "BTC", type: "crypto", quantity: 0.5, buyPrice: 28000, currentPrice: 95000, buyDate: new Date("2023-05-10"), category: "Crypto", currency: "USD" },
    { name: "Ethereum", ticker: "ETH", type: "crypto", quantity: 4, buyPrice: 1800, currentPrice: 3400, buyDate: new Date("2023-06-01"), category: "Crypto", currency: "USD" },
    { name: "Solana", ticker: "SOL", type: "crypto", quantity: 50, buyPrice: 22, currentPrice: 175, buyDate: new Date("2023-08-15"), category: "Crypto", currency: "USD" },
    { name: "Appartement Paris 11e", ticker: "IMMO-PAR11", type: "real_estate", quantity: 1, buyPrice: 320000, currentPrice: 345000, buyDate: new Date("2020-03-15"), category: "Résidentiel", currency: "EUR" },
    { name: "SCPI Corum Origin", ticker: "CORUM", type: "real_estate", quantity: 20, buyPrice: 1090, currentPrice: 1135, buyDate: new Date("2022-01-10"), category: "SCPI", currency: "EUR" },
    { name: "Livret A", ticker: "LVA", type: "savings", quantity: 1, buyPrice: 22950, currentPrice: 22950, buyDate: new Date("2021-01-01"), category: "Épargne réglementée", currency: "EUR" },
    { name: "Assurance Vie Boursorama", ticker: "AV-BOUR", type: "savings", quantity: 1, buyPrice: 15000, currentPrice: 16800, buyDate: new Date("2021-06-01"), category: "Assurance Vie", currency: "EUR" },
    { name: "PEA PME", ticker: "PEA-PME", type: "savings", quantity: 1, buyPrice: 5000, currentPrice: 5450, buyDate: new Date("2023-01-15"), category: "PEA", currency: "EUR" },
  ];

  for (const asset of assets) {
    await prisma.asset.create({ data: { ...asset, portfolioId: portfolio.id } });
  }

  const marketDataEntries = [
    { ticker: "^FCHI", price: 7425.30, change: 45.20, changePercent: 0.61, volume: 3200000000 },
    { ticker: "^GSPC", price: 5890.45, change: 22.10, changePercent: 0.38, volume: 4100000000 },
    { ticker: "^IXIC", price: 18920.80, change: -35.60, changePercent: -0.19, volume: 5300000000 },
    { ticker: "BTC-USD", price: 95000, change: 1250, changePercent: 1.33, volume: 28000000000 },
    { ticker: "ETH-USD", price: 3400, change: -45, changePercent: -1.31, volume: 12000000000 },
    { ticker: "GC=F", price: 2345.60, change: 12.30, changePercent: 0.53, volume: 180000 },
  ];

  for (const data of marketDataEntries) {
    await prisma.marketData.create({ data });
  }

  const newsItems = [
    { title: "La BCE maintient ses taux directeurs inchangés", description: "Christine Lagarde a annoncé le maintien des taux, signalant une pause dans le cycle de resserrement monétaire.", url: "https://example.com/bce-taux", source: "Les Echos", category: "Macroéconomie", relevanceScore: 0.95, imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400" },
    { title: "Bitcoin franchit les 95 000$ pour la première fois", description: "La cryptomonnaie phare atteint un nouveau sommet historique, portée par l'adoption institutionnelle.", url: "https://example.com/btc-95k", source: "CoinDesk", category: "Crypto", relevanceScore: 0.92, imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400" },
    { title: "LVMH publie des résultats record au T4", description: "Le groupe de luxe français dépasse les attentes avec un CA en hausse de 13% sur le trimestre.", url: "https://example.com/lvmh-q4", source: "Reuters", category: "Actions", relevanceScore: 0.88, imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400" },
    { title: "L'immobilier parisien montre des signes de reprise", description: "Après deux ans de baisse, les prix au m² repartent à la hausse dans plusieurs arrondissements.", url: "https://example.com/immo-paris", source: "Les Echos", category: "Immobilier", relevanceScore: 0.85, imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
    { title: "ETF : collecte record en Europe en 2025", description: "Les ETF européens ont collecté plus de 200 milliards d'euros cette année, un record historique.", url: "https://example.com/etf-record", source: "Reuters", category: "ETF", relevanceScore: 0.82, imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400" },
    { title: "Solana dépasse Ethereum en transactions quotidiennes", description: "Le réseau Solana traite désormais plus de transactions par jour qu'Ethereum, renforçant sa position.", url: "https://example.com/sol-eth", source: "CoinDesk", category: "Crypto", relevanceScore: 0.78, imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400" },
  ];

  for (const item of newsItems) {
    await prisma.newsItem.create({ data: item });
  }

  await prisma.watchlistItem.createMany({
    data: [
      { ticker: "NVDA", name: "NVIDIA", type: "stock" },
      { ticker: "ASML.AS", name: "ASML Holding", type: "stock" },
      { ticker: "ADA-USD", name: "Cardano", type: "crypto" },
      { ticker: "IWDA.AS", name: "iShares MSCI World", type: "etf" },
    ],
  });

  await prisma.investorProfile.create({
    data: {
      riskTolerance: "moderate",
      investmentHorizon: "long",
      experience: "intermediate",
      objectives: "Croissance long terme avec revenus passifs",
      score: 65,
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
