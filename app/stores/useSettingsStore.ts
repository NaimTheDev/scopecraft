import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Settings {
  hourlyRate: number;
}

interface SettingsStore {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  hourlyRate: 100,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateSettings: (newSettings: Partial<Settings>) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },
    }),
    {
      name: "scopecraft-settings",
      version: 1,
    }
  )
);
