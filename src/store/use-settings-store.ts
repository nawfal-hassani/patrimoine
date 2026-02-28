import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  currency: "EUR" | "USD";
  theme: "dark" | "light";
  sidebarOpen: boolean;
  setCurrency: (currency: "EUR" | "USD") => void;
  setTheme: (theme: "dark" | "light") => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: "EUR",
      theme: "dark",
      sidebarOpen: false,
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: "patrimoine-settings",
      partialize: (state) => ({
        currency: state.currency,
        theme: state.theme,
      }),
    }
  )
);
