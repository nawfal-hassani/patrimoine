"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InvestorQuestionnaire } from "@/components/investor-questionnaire";
import { DiversificationGauge } from "@/components/diversification-gauge";
import { RebalanceCard, AlertBadge } from "@/components/rebalance-card";
import { RiskIndicators } from "@/components/risk-indicators";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  PieChart,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Lightbulb,
  Shield,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";

interface QuestionnaireAnswers {
  investmentHorizon: string;
  riskTolerance: string;
  experience: string;
  objectives: string;
  monthlyBudget: string;
  reactionToDrop: string;
}

interface InsightsData {
  profile: {
    id: string;
    riskTolerance: string;
    investmentHorizon: string;
    experience: string;
    objectives: string | null;
    score: number;
  } | null;
  diversificationScore: number;
  allocations: {
    type: string;
    totalValue: number;
    percentage: number;
    count: number;
  }[];
  suggestions: {
    assetType: string;
    currentPercent: number;
    targetPercent: number;
    action: "reduce" | "increase";
    label: string;
    description: string;
    priority: "high" | "medium" | "low";
  }[];
  alerts: {
    type: string;
    severity: "critical" | "warning" | "info";
    message: string;
    currentPercent: number;
    threshold: number;
  }[];
  riskIndicators: {
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    beta: number;
  };
  totalPortfolioValue: number;
}

const typeLabels: Record<string, string> = {
  stock: "Actions",
  etf: "ETF",
  crypto: "Crypto",
  real_estate: "Immobilier",
  savings: "Epargne",
};

const typeColors: Record<string, string> = {
  stock: "bg-indigo-500",
  etf: "bg-purple-500",
  crypto: "bg-amber-500",
  real_estate: "bg-emerald-500",
  savings: "bg-blue-500",
};

export default function InsightsPage() {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<InsightsData>({
    queryKey: ["insights"],
    queryFn: async () => {
      const res = await fetch("/api/insights");
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (answers: QuestionnaireAnswers) => {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riskTolerance: answers.riskTolerance || answers.reactionToDrop || "moderate",
          investmentHorizon: answers.investmentHorizon || "long",
          experience: answers.experience || "intermediate",
          objectives: answers.objectives || "growth",
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      return res.json();
    },
    onSuccess: () => {
      setShowQuestionnaire(false);
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });

  const handleQuestionnaireComplete = useCallback(
    (answers: QuestionnaireAnswers) => {
      profileMutation.mutate(answers);
    },
    [profileMutation]
  );

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-80" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64 md:col-span-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const profileLabel: Record<string, string> = {
    conservative: "Conservateur",
    moderate: "Modere",
    aggressive: "Dynamique",
    very_aggressive: "Tres dynamique",
  };

  const horizonLabel: Record<string, string> = {
    short: "Court terme",
    medium: "Moyen terme",
    long: "Long terme",
    very_long: "Tres long terme",
  };

  const experienceLabel: Record<string, string> = {
    beginner: "Debutant",
    intermediate: "Intermediaire",
    advanced: "Avance",
    expert: "Expert",
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-white/[0.06] px-4 sm:px-6 md:px-8 py-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analyse intelligente de votre portefeuille
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-muted-foreground border-white/10 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Actualiser
            </Button>
            <Button
              size="sm"
              onClick={() => setShowQuestionnaire(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
            >
              <Brain className="w-4 h-4 mr-1.5" />
              Profil investisseur
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="px-4 sm:px-6 md:px-8 py-8 space-y-8">
        {/* Questionnaire modal */}
        <AnimatePresence>
          {showQuestionnaire && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowQuestionnaire(false);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <InvestorQuestionnaire
                  onComplete={handleQuestionnaireComplete}
                  isSubmitting={profileMutation.isPending}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portfolio value + profile summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Portfolio value card */}
          <div className="glass rounded-[14px] border border-white/[0.06] p-6 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-2">Valeur du portefeuille</p>
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl font-bold gradient-text"
            >
              {formatCurrency(data?.totalPortfolioValue || 0)}
            </motion.p>
            {data?.profile && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <Badge variant="secondary" className="text-xs bg-indigo-500/15 text-indigo-400 border-0">
                  {profileLabel[data.profile.riskTolerance] || data.profile.riskTolerance}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-purple-500/15 text-purple-400 border-0">
                  {horizonLabel[data.profile.investmentHorizon] || data.profile.investmentHorizon}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-emerald-500/15 text-emerald-400 border-0">
                  {experienceLabel[data.profile.experience] || data.profile.experience}
                </Badge>
              </div>
            )}
          </div>

          {/* Diversification gauge */}
          <div className="glass rounded-[14px] border border-white/[0.06] p-6 flex flex-col items-center justify-center">
            <DiversificationGauge score={data?.diversificationScore || 0} size={200} />
          </div>

          {/* Allocation breakdown */}
          <div className="glass rounded-[14px] border border-white/[0.06] p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Repartition par classe d&apos;actifs
            </h3>
            <div className="space-y-3">
              {data?.allocations
                .sort((a, b) => b.percentage - a.percentage)
                .map((alloc, index) => (
                  <motion.div
                    key={alloc.type}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2.5 h-2.5 rounded-full", typeColors[alloc.type] || "bg-gray-500")} />
                        <span className="text-sm text-white">{typeLabels[alloc.type] || alloc.type}</span>
                        <span className="text-xs text-muted-foreground">({alloc.count})</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{alloc.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${alloc.percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                        className={cn("h-full rounded-full", typeColors[alloc.type] || "bg-gray-500")}
                      />
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* Risk indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Indicateurs de risque
          </h2>
          {data?.riskIndicators && <RiskIndicators indicators={data.riskIndicators} />}
        </motion.div>

        {/* Tabs for suggestions and alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Tabs defaultValue="suggestions" className="w-full">
            <TabsList className="bg-white/5 border border-white/[0.06]">
              <TabsTrigger value="suggestions" className="data-[state=active]:bg-indigo-500/15 data-[state=active]:text-indigo-400">
                <Lightbulb className="w-4 h-4 mr-1.5" />
                Suggestions ({data?.suggestions.length || 0})
              </TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-red-500/15 data-[state=active]:text-red-400">
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Alertes ({data?.alerts.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions" className="mt-6">
              {data?.suggestions && data.suggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.suggestions.map((suggestion, index) => (
                    <RebalanceCard key={suggestion.assetType} suggestion={suggestion} index={index} />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-[14px] border border-white/[0.06] p-12 text-center"
                >
                  <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Portefeuille equilibre</h3>
                  <p className="text-sm text-muted-foreground">
                    Aucune suggestion de reequilibrage pour le moment. Votre allocation est dans les seuils recommandes.
                  </p>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="mt-6">
              {data?.alerts && data.alerts.length > 0 ? (
                <div className="space-y-3">
                  {data.alerts.map((alert, index) => (
                    <AlertBadge key={`${alert.type}-${alert.severity}`} alert={alert} index={index} />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-[14px] border border-white/[0.06] p-12 text-center"
                >
                  <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Aucune alerte</h3>
                  <p className="text-sm text-muted-foreground">
                    Votre portefeuille ne presente aucune alerte de surexposition.
                  </p>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="glass rounded-[14px] border border-white/[0.06] p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Simulez la croissance de votre patrimoine</h3>
              <p className="text-sm text-muted-foreground">
                Projetez vos investissements avec notre simulateur d&apos;interets composes
              </p>
            </div>
          </div>
          <Link href="/simulator">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600">
              Ouvrir le simulateur
              <TrendingUp className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
