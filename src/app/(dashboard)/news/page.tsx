"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Newspaper, Search } from "lucide-react";
import { NewsCard } from "@/components/news-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  imageUrl: string | null;
  category: string | null;
  publishedAt: string;
  relevanceScore: number;
}

const CATEGORIES = [
  "Toutes",
  "Macroéconomie",
  "Actions",
  "Crypto",
  "Immobilier",
  "ETF",
];

const CATEGORY_STYLES: Record<string, string> = {
  Toutes: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
  Macroéconomie: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  Actions: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  Crypto: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  Immobilier: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  ETF: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-[200px] rounded-[14px] bg-white/[0.04]" />
      ))}
    </div>
  );
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: newsItems, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["news", activeCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory !== "Toutes") {
        params.set("category", activeCategory);
      }
      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur lors du chargement");
      return res.json();
    },
  });

  const filteredNews = newsItems?.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.source.toLowerCase().includes(query)
    );
  });

  return (
    <div className="px-4 py-6 sm:p-6 pb-16">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Actualités</h1>
        <p className="text-zinc-400">
          Dernières nouvelles financières et analyses
        </p>
      </motion.div>

      <div className="max-w-4xl space-y-6">
        {/* Search and filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4"
        >
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une actualité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/[0.04] border-white/[0.08] text-white rounded-xl h-11 placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Category badges */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat, index) => {
              const isActive = activeCategory === cat;
              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
                  onClick={() => setActiveCategory(cat)}
                >
                  <Badge
                    variant={isActive ? "default" : "outline"}
                    className={`cursor-pointer text-xs px-3 py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? CATEGORY_STYLES[cat] ||
                          "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                        : "bg-transparent text-muted-foreground border-white/[0.08] hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    {cat}
                  </Badge>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Chargement..."
              : `${filteredNews?.length || 0} article${
                  (filteredNews?.length || 0) > 1 ? "s" : ""
                }`}
          </p>
          {activeCategory !== "Toutes" && (
            <button
              onClick={() => setActiveCategory("Toutes")}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Voir toutes les catégories
            </button>
          )}
        </motion.div>

        {/* News list */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredNews && filteredNews.length > 0 ? (
          <div className="space-y-4">
            {filteredNews.map((item, index) => (
              <NewsCard
                key={item.id}
                title={item.title}
                description={item.description}
                source={item.source}
                category={item.category}
                imageUrl={item.imageUrl}
                url={item.url}
                publishedAt={item.publishedAt}
                relevanceScore={item.relevanceScore}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-[14px] p-12 text-center"
          >
            <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              Aucune actualité trouvée
              {searchQuery && ` pour "${searchQuery}"`}
              {activeCategory !== "Toutes" &&
                ` dans la catégorie ${activeCategory}`}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
