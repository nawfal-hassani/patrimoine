"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  type: string;
  addedAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  stock: "bg-indigo-500/20 text-indigo-400",
  crypto: "bg-amber-500/20 text-amber-400",
  etf: "bg-emerald-500/20 text-emerald-400",
  commodity: "bg-orange-500/20 text-orange-400",
};

export function Watchlist() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTicker, setNewTicker] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("stock");

  const { data: watchlist = [], isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const res = await fetch("/api/watchlist");
      if (!res.ok) throw new Error("Erreur lors du chargement");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (item: { ticker: string; name: string; type: string }) => {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      if (data.action === "removed") {
        toast.success(`${data.ticker} retiré de la watchlist`);
      } else {
        toast.success(`${data.item.ticker} ajouté à la watchlist`);
      }
      setShowAddForm(false);
      setNewTicker("");
      setNewName("");
      setNewType("stock");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const handleAdd = () => {
    if (!newTicker.trim() || !newName.trim()) {
      toast.error("Remplissez tous les champs");
      return;
    }
    mutation.mutate({
      ticker: newTicker.toUpperCase(),
      name: newName,
      type: newType,
    });
  };

  const handleRemove = (item: WatchlistItem) => {
    mutation.mutate({
      ticker: item.ticker,
      name: item.name,
      type: item.type,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass rounded-[14px] p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Ma Watchlist</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-muted-foreground hover:text-white"
        >
          {showAddForm ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Ticker (ex: AAPL)"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-sm"
                />
                <Input
                  placeholder="Nom (ex: Apple)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-sm"
                />
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex gap-1 flex-1">
                  {["stock", "etf", "crypto"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewType(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        newType === t
                          ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/50"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      {t === "stock" ? "Action" : t === "etf" ? "ETF" : "Crypto"}
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={mutation.isPending}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs"
                >
                  {mutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "Ajouter"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 rounded-xl bg-white/[0.03] animate-pulse"
            />
          ))}
        </div>
      ) : watchlist.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          Aucun actif dans la watchlist
        </p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {watchlist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.12] hover:shadow-[0_4px_20px_rgba(129,140,248,0.08)] transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-400">
                      {item.ticker.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.ticker}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${
                      TYPE_COLORS[item.type] || TYPE_COLORS.stock
                    }`}
                  >
                    {item.type === "stock"
                      ? "Action"
                      : item.type === "etf"
                      ? "ETF"
                      : "Crypto"}
                  </Badge>
                  <button
                    onClick={() => handleRemove(item)}
                    className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/10"
                  >
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
