"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Shield,
  GraduationCap,
  Target,
  Wallet,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionOption {
  value: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  options: QuestionOption[];
}

interface QuestionnaireAnswers {
  investmentHorizon: string;
  riskTolerance: string;
  experience: string;
  objectives: string;
  monthlyBudget: string;
  reactionToDrop: string;
}

interface InvestorQuestionnaireProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  isSubmitting?: boolean;
}

const questions: Question[] = [
  {
    id: "investmentHorizon",
    title: "Quel est votre horizon d'investissement ?",
    subtitle: "La duree pendant laquelle vous prevoyez de garder vos investissements",
    icon: <Clock className="w-6 h-6" />,
    options: [
      {
        value: "short",
        label: "Court terme",
        description: "Moins de 3 ans",
        icon: <Clock className="w-5 h-5" />,
      },
      {
        value: "medium",
        label: "Moyen terme",
        description: "3 a 7 ans",
        icon: <Clock className="w-5 h-5" />,
      },
      {
        value: "long",
        label: "Long terme",
        description: "7 a 15 ans",
        icon: <Clock className="w-5 h-5" />,
      },
      {
        value: "very_long",
        label: "Tres long terme",
        description: "Plus de 15 ans",
        icon: <Clock className="w-5 h-5" />,
      },
    ],
  },
  {
    id: "riskTolerance",
    title: "Quelle est votre tolerance au risque ?",
    subtitle: "Votre capacite a accepter des pertes temporaires pour un potentiel de gains plus eleve",
    icon: <Shield className="w-6 h-6" />,
    options: [
      {
        value: "conservative",
        label: "Conservateur",
        description: "Je prefere la securite, meme si les gains sont limites",
        icon: <Shield className="w-5 h-5" />,
      },
      {
        value: "moderate",
        label: "Modere",
        description: "J'accepte un risque modere pour de meilleurs rendements",
        icon: <Shield className="w-5 h-5" />,
      },
      {
        value: "aggressive",
        label: "Dynamique",
        description: "J'accepte des pertes significatives pour maximiser les gains",
        icon: <Shield className="w-5 h-5" />,
      },
      {
        value: "very_aggressive",
        label: "Tres dynamique",
        description: "Je vise la performance maximale, peu importe la volatilite",
        icon: <Shield className="w-5 h-5" />,
      },
    ],
  },
  {
    id: "experience",
    title: "Quel est votre niveau d'experience ?",
    subtitle: "Votre familiarite avec les marches financiers et l'investissement",
    icon: <GraduationCap className="w-6 h-6" />,
    options: [
      {
        value: "beginner",
        label: "Debutant",
        description: "Je debute dans l'investissement",
        icon: <GraduationCap className="w-5 h-5" />,
      },
      {
        value: "intermediate",
        label: "Intermediaire",
        description: "J'investis depuis quelques annees",
        icon: <GraduationCap className="w-5 h-5" />,
      },
      {
        value: "advanced",
        label: "Avance",
        description: "J'ai une bonne maitrise des marches",
        icon: <GraduationCap className="w-5 h-5" />,
      },
      {
        value: "expert",
        label: "Expert",
        description: "Je maitrise les strategies complexes",
        icon: <GraduationCap className="w-5 h-5" />,
      },
    ],
  },
  {
    id: "objectives",
    title: "Quels sont vos objectifs principaux ?",
    subtitle: "Ce que vous souhaitez accomplir avec vos investissements",
    icon: <Target className="w-6 h-6" />,
    options: [
      {
        value: "preservation",
        label: "Preservation du capital",
        description: "Proteger mon patrimoine contre l'inflation",
        icon: <Target className="w-5 h-5" />,
      },
      {
        value: "income",
        label: "Revenus reguliers",
        description: "Generer des revenus passifs (dividendes, loyers)",
        icon: <Wallet className="w-5 h-5" />,
      },
      {
        value: "growth",
        label: "Croissance",
        description: "Faire croitre mon patrimoine sur le long terme",
        icon: <Target className="w-5 h-5" />,
      },
      {
        value: "speculation",
        label: "Performance maximale",
        description: "Viser les rendements les plus eleves possibles",
        icon: <Sparkles className="w-5 h-5" />,
      },
    ],
  },
  {
    id: "monthlyBudget",
    title: "Quel montant pouvez-vous investir mensuellement ?",
    subtitle: "Le montant que vous pouvez investir regulierement sans impacter votre quotidien",
    icon: <Wallet className="w-6 h-6" />,
    options: [
      {
        value: "small",
        label: "Moins de 200 EUR",
        description: "Investissement modeste mais regulier",
        icon: <Wallet className="w-5 h-5" />,
      },
      {
        value: "medium",
        label: "200 - 500 EUR",
        description: "Investissement modere",
        icon: <Wallet className="w-5 h-5" />,
      },
      {
        value: "large",
        label: "500 - 1500 EUR",
        description: "Investissement consequent",
        icon: <Wallet className="w-5 h-5" />,
      },
      {
        value: "very_large",
        label: "Plus de 1500 EUR",
        description: "Investissement important",
        icon: <Wallet className="w-5 h-5" />,
      },
    ],
  },
  {
    id: "reactionToDrop",
    title: "Comment reagiriez-vous a une baisse de -20% ?",
    subtitle: "Imaginez que votre portefeuille perd 20% de sa valeur en un mois",
    icon: <Shield className="w-6 h-6" />,
    options: [
      {
        value: "conservative",
        label: "Je vends tout",
        description: "Je prefere securiser ce qu'il reste",
        icon: <Shield className="w-5 h-5" />,
      },
      {
        value: "moderate",
        label: "J'attends",
        description: "Je ne fais rien et j'attends la reprise",
        icon: <Shield className="w-5 h-5" />,
      },
      {
        value: "aggressive",
        label: "J'achete un peu plus",
        description: "C'est une opportunite d'achat",
        icon: <Shield className="w-5 h-5" />,
      },
      {
        value: "very_aggressive",
        label: "J'investis massivement",
        description: "Je renforce fortement ma position",
        icon: <Sparkles className="w-5 h-5" />,
      },
    ],
  },
];

export function InvestorQuestionnaire({ onComplete, isSubmitting }: InvestorQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const canGoNext = answers[currentQuestion.id] !== undefined;
  const progress = ((currentStep + 1) / questions.length) * 100;

  function handleSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  function handleNext() {
    if (isLastStep && canGoNext) {
      onComplete(answers as unknown as QuestionnaireAnswers);
    } else if (canGoNext) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="glass rounded-[14px] border border-white/[0.06] overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="p-6 md:p-8">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
              {currentQuestion.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Question {currentStep + 1} sur {questions.length}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i === currentStep
                    ? "bg-indigo-400 w-6"
                    : i < currentStep
                      ? "bg-indigo-400/40"
                      : "bg-white/10"
                )}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              {currentQuestion.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-8">{currentQuestion.subtitle}</p>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.options.map((option, optIndex) => {
                const isSelected = answers[currentQuestion.id] === option.value;

                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: optIndex * 0.06 }}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "relative text-left rounded-[14px] border p-4 transition-all duration-300 cursor-pointer group",
                      isSelected
                        ? "border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(129,140,248,0.1)]"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-300",
                          isSelected ? "border-indigo-400 bg-indigo-500" : "border-white/20"
                        )}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <p
                          className={cn(
                            "font-medium text-sm transition-colors",
                            isSelected ? "text-white" : "text-white/80"
                          )}
                        >
                          {option.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.06]">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="text-muted-foreground hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Precedent
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canGoNext || isSubmitting}
            className={cn(
              "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600",
              "transition-all duration-300",
              !canGoNext && "opacity-50"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Analyse en cours...
              </span>
            ) : isLastStep ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Voir mes resultats
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Suivant
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
