"use client";

import { motion } from "framer-motion";
import { ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NewsCardProps {
  title: string;
  description: string | null;
  source: string;
  category: string | null;
  imageUrl: string | null;
  url: string;
  publishedAt: string;
  relevanceScore: number;
  index?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Macroéconomie: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Actions: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Crypto: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Immobilier: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ETF: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

function getRelevanceColor(score: number): string {
  if (score >= 0.9) return "bg-emerald-500/20 text-emerald-400";
  if (score >= 0.8) return "bg-blue-500/20 text-blue-400";
  if (score >= 0.7) return "bg-amber-500/20 text-amber-400";
  return "bg-gray-500/20 text-gray-400";
}

function getRelevanceLabel(score: number): string {
  if (score >= 0.9) return "Haute";
  if (score >= 0.8) return "Bonne";
  if (score >= 0.7) return "Moyenne";
  return "Faible";
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `il y a ${diffMins}min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function NewsCard({
  title,
  description,
  source,
  category,
  imageUrl,
  url,
  publishedAt,
  relevanceScore,
  index = 0,
}: NewsCardProps) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass rounded-[14px] overflow-hidden flex flex-col sm:flex-row hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(129,140,248,0.12)] transition-all duration-300 group cursor-pointer"
    >
      {/* Image */}
      <div className="relative w-full sm:w-[200px] md:w-[260px] h-[180px] sm:h-auto flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-4xl text-white/20">
              {category?.charAt(0) || "N"}
            </span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/30" />

        {/* Relevance badge on image */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md ${getRelevanceColor(
              relevanceScore
            )}`}
          >
            {Math.round(relevanceScore * 100)}% -{" "}
            {getRelevanceLabel(relevanceScore)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {category && (
              <Badge
                variant="outline"
                className={`text-[10px] border ${
                  CATEGORY_COLORS[category] ||
                  "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }`}
              >
                {category}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground font-medium">
              {source}
            </span>
          </div>

          <h3 className="text-base font-semibold text-white leading-snug mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
            {title}
          </h3>

          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(publishedAt)}
          </div>
          <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Lire <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.a>
  );
}
