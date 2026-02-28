"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CompoundSimulator } from "@/components/compound-simulator";
import { ScenarioComparison } from "@/components/scenario-comparison";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  TrendingUp,
  Brain,
} from "lucide-react";
import Link from "next/link";

interface SimulatorParams {
  initialAmount: number;
  monthlyContribution: number;
  annualRate: number;
  durationYears: number;
}

export default function SimulatorPage() {
  const [params, setParams] = useState<SimulatorParams>({
    initialAmount: 10000,
    monthlyContribution: 500,
    annualRate: 7,
    durationYears: 20,
  });

  const handleParamsChange = useCallback((newParams: SimulatorParams) => {
    setParams(newParams);
  }, []);

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
              <span className="gradient-text">Simulateur</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Projetez la croissance de votre patrimoine
            </p>
          </div>
          <Link href="/insights">
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground border-white/10 hover:text-white"
            >
              <Brain className="w-4 h-4 mr-1.5" />
              Insights
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="px-4 sm:px-6 md:px-8 py-8 space-y-8">
        {/* Intro card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-[14px] border border-white/[0.06] p-6 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Calculator className="w-7 h-7 text-white" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-lg font-semibold text-white mb-1">
              Simulateur d&apos;interets composes
            </h2>
            <p className="text-sm text-muted-foreground">
              Ajustez les parametres ci-dessous pour visualiser la projection de votre investissement.
              Trois scenarios sont compares : pessimiste, moyen et optimiste, avec un ecart de +/- 3 points.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              Pessimiste
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              Moyen
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              Optimiste
            </div>
          </div>
        </motion.div>

        {/* Main simulator component */}
        <CompoundSimulator onParamsChange={handleParamsChange} />

        {/* Scenario comparison table */}
        <ScenarioComparison
          initialAmount={params.initialAmount}
          monthlyContribution={params.monthlyContribution}
          annualRate={params.annualRate}
          durationYears={params.durationYears}
        />

        {/* Tips section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
              title: "Commencez tot",
              description:
                "Grace aux interets composes, chaque annee supplementaire amplifie considerablement vos gains. Commencer 5 ans plus tot peut doubler vos interets.",
              bgColor: "bg-emerald-500/10",
              borderColor: "border-emerald-500/20",
            },
            {
              icon: <Calculator className="w-5 h-5 text-indigo-400" />,
              title: "La regularite paie",
              description:
                "Des contributions mensuelles regulieres, meme modestes, ont un impact enorme sur le long terme grace a l'effet de lissage du prix d'achat.",
              bgColor: "bg-indigo-500/10",
              borderColor: "border-indigo-500/20",
            },
            {
              icon: <Brain className="w-5 h-5 text-purple-400" />,
              title: "Diversifiez",
              description:
                "Repartir vos investissements entre differentes classes d'actifs reduit le risque global tout en maintenant un bon potentiel de rendement.",
              bgColor: "bg-purple-500/10",
              borderColor: "border-purple-500/20",
            },
          ].map((tip, index) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
              className={`glass rounded-[14px] border ${tip.borderColor} p-5`}
            >
              <div className={`w-10 h-10 rounded-xl ${tip.bgColor} flex items-center justify-center mb-4`}>
                {tip.icon}
              </div>
              <h3 className="font-semibold text-white text-sm mb-2">{tip.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Link to insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="glass rounded-[14px] border border-white/[0.06] p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Analysez votre portefeuille</h3>
              <p className="text-sm text-muted-foreground">
                Decouvrez votre score de diversification et recevez des recommandations personnalisees
              </p>
            </div>
          </div>
          <Link href="/insights">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
              Voir les insights
              <Brain className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
