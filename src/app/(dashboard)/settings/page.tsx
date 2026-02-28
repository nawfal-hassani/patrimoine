"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Moon,
  Sun,
  Tags,
  Download,
  Upload,
  Plus,
  X,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useSettingsStore } from "@/store/use-settings-store";
import { toast } from "sonner";

const defaultCategories = [
  "Actions",
  "ETF",
  "Crypto",
  "Immobilier",
  "Livrets",
  "Obligations",
  "Matières premières",
  "Fonds",
];

const itemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function SettingsPage() {
  const { currency, theme, setCurrency, setTheme } = useSettingsStore();
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [newCategory, setNewCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Currency ---
  function handleCurrencyChange(value: string) {
    setCurrency(value as "EUR" | "USD");
    toast.success(`Devise mise à jour : ${value}`);
  }

  // --- Theme ---
  function handleThemeToggle(checked: boolean) {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    toast.success(`Thème ${newTheme === "dark" ? "sombre" : "clair"} activé`);
  }

  // --- Categories ---
  function handleAddCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      toast.error("Cette catégorie existe déjà");
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    setNewCategory("");
    toast.success(`Catégorie "${trimmed}" ajoutée`);
  }

  function handleDeleteCategory(index: number) {
    const removed = categories[index];
    setCategories((prev) => prev.filter((_, i) => i !== index));
    toast.success(`Catégorie "${removed}" supprimée`);
  }

  function handleStartEdit(index: number) {
    setEditingIndex(index);
    setEditValue(categories[index]);
  }

  function handleConfirmEdit(index: number) {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditingIndex(null);
      return;
    }
    if (categories.some((c, i) => c === trimmed && i !== index)) {
      toast.error("Cette catégorie existe déjà");
      return;
    }
    setCategories((prev) => prev.map((c, i) => (i === index ? trimmed : c)));
    setEditingIndex(null);
    toast.success("Catégorie modifiée");
  }

  function handleCancelEdit() {
    setEditingIndex(null);
    setEditValue("");
  }

  // --- Export ---
  async function handleExport() {
    try {
      const response = await fetch("/api/portfolio");
      const portfolios = await response.json();

      const assetsResponse = await fetch("/api/assets");
      const assets = await assetsResponse.json();

      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        settings: { currency, theme, categories },
        portfolios,
        assets,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patrimoine-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Données exportées avec succès");
    } catch {
      toast.error("Erreur lors de l'export des données");
    }
  }

  // --- Import ---
  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version || !data.exportDate) {
        toast.error("Format de fichier invalide");
        return;
      }

      // Restore settings
      if (data.settings) {
        if (data.settings.currency) {
          setCurrency(data.settings.currency);
        }
        if (data.settings.theme) {
          setTheme(data.settings.theme);
        }
        if (data.settings.categories && Array.isArray(data.settings.categories)) {
          setCategories(data.settings.categories);
        }
      }

      toast.success("Données importées avec succès");
    } catch {
      toast.error("Erreur lors de la lecture du fichier");
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:p-6">
      {/* Devise */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0 }}
      >
        <Card className="border-[rgba(255,255,255,0.06)] bg-[#111113]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#818cf8]/10">
                <Globe className="h-[18px] w-[18px] text-[#818cf8]" />
              </div>
              <div>
                <CardTitle className="text-white">Devise</CardTitle>
                <CardDescription>
                  Choisissez la devise d&apos;affichage pour votre patrimoine
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label className="text-[#a1a1aa]">Devise principale</Label>
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-40 rounded-[10px] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[10px] border-[rgba(255,255,255,0.08)] bg-[#1a1a2e]">
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Theme */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <Card className="border-[rgba(255,255,255,0.06)] bg-[#111113]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#a78bfa]/10">
                {theme === "dark" ? (
                  <Moon className="h-[18px] w-[18px] text-[#a78bfa]" />
                ) : (
                  <Sun className="h-[18px] w-[18px] text-[#fbbf24]" />
                )}
              </div>
              <div>
                <CardTitle className="text-white">Apparence</CardTitle>
                <CardDescription>
                  Basculer entre le thème sombre et clair
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-[#71717a]" />
                <Label className="text-[#a1a1aa]">Thème sombre</Label>
                <Moon className="h-4 w-4 text-[#71717a]" />
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={handleThemeToggle}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <Card className="border-[rgba(255,255,255,0.06)] bg-[#111113]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-emerald-500/10">
                <Tags className="h-[18px] w-[18px] text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-white">
                  Catégories d&apos;actifs
                </CardTitle>
                <CardDescription>
                  Gérez les catégories pour classer vos actifs
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add new category */}
            <div className="mb-4 flex gap-2">
              <Input
                placeholder="Nouvelle catégorie..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                }}
                className="flex-1 rounded-[10px] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-white placeholder:text-[#71717a]"
              />
              <Button
                onClick={handleAddCategory}
                size="sm"
                className="rounded-[10px] bg-[#818cf8] text-white hover:bg-[#818cf8]/90"
              >
                <Plus className="mr-1 h-4 w-4" />
                Ajouter
              </Button>
            </div>

            <Separator className="mb-4 bg-[rgba(255,255,255,0.06)]" />

            {/* Category list */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {categories.map((category, index) => (
                  <motion.div
                    key={category}
                    layout
                    variants={itemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex items-center justify-between rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-2.5"
                  >
                    {editingIndex === index ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleConfirmEdit(index);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="h-8 flex-1 rounded-[8px] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-sm text-white"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-400"
                          onClick={() => handleConfirmEdit(index)}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[#71717a] hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm text-[#e4e4e7]">
                          {category}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[#71717a] hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
                            onClick={() => handleStartEdit(index)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[#71717a] hover:bg-red-500/10 hover:text-red-400"
                            onClick={() => handleDeleteCategory(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Import / Export */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <Card className="border-[rgba(255,255,255,0.06)] bg-[#111113]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#fbbf24]/10">
                <Download className="h-[18px] w-[18px] text-[#fbbf24]" />
              </div>
              <div>
                <CardTitle className="text-white">Import / Export</CardTitle>
                <CardDescription>
                  Sauvegardez ou restaurez vos données au format JSON
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                onClick={handleExport}
                className="flex-1 rounded-[10px] bg-[#818cf8] text-white hover:bg-[#818cf8]/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter les données
              </Button>
              <Button
                onClick={handleImportClick}
                variant="outline"
                className="flex-1 rounded-[10px] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-white hover:bg-[rgba(255,255,255,0.08)]"
              >
                <Upload className="mr-2 h-4 w-4" />
                Importer un fichier
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
            <p className="mt-3 text-xs text-[#71717a]">
              L&apos;export inclut vos portefeuilles, actifs et paramètres.
              L&apos;import restaurera les paramètres du fichier.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
