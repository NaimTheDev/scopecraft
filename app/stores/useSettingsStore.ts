import { create } from "zustand";
import { auth, getUserSettings, updateUserHourlyRate } from "../utils/firebase.client";
import { onAuthStateChanged, User } from "firebase/auth";

interface Settings {
  hourlyRate: number;
}

interface SettingsStore {
  settings: Settings;
  loading: boolean;
  user: User | null;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  loadUserSettings: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const defaultSettings: Settings = {
  hourlyRate: 100,
};

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  settings: defaultSettings,
  loading: false,
  user: null,

  setUser: (user: User | null) => {
    set({ user });
  },

  loadUserSettings: async () => {
    const { user } = get();
    if (!user) return;

    set({ loading: true });
    try {
      const userSettings = await getUserSettings(user);
      if (userSettings) {
        set({
          settings: {
            hourlyRate: userSettings.hourlyRate || defaultSettings.hourlyRate,
          },
        });
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (newSettings: Partial<Settings>) => {
    const { user } = get();
    if (!user) return;

    set({ loading: true });
    try {
      // Update local state immediately for responsive UI
      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      }));

      // Update Firestore
      if (newSettings.hourlyRate !== undefined) {
        await updateUserHourlyRate(user, newSettings.hourlyRate);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      // Revert local changes on error
      await get().loadUserSettings();
    } finally {
      set({ loading: false });
    }
  },

  resetSettings: async () => {
    const { user } = get();
    if (!user) return;

    set({ loading: true });
    try {
      // Reset to default settings
      set({ settings: defaultSettings });
      
      // Update Firestore with default values
      await updateUserHourlyRate(user, defaultSettings.hourlyRate);
    } catch (error) {
      console.error("Error resetting settings:", error);
      // Reload from Firestore on error
      await get().loadUserSettings();
    } finally {
      set({ loading: false });
    }
  },
}));

// Initialize auth listener when the store is created
let authInitialized = false;

export const initializeSettingsAuth = () => {
  if (authInitialized) return;
  authInitialized = true;

  onAuthStateChanged(auth, async (user) => {
    const store = useSettingsStore.getState();
    store.setUser(user);
    
    if (user) {
      await store.loadUserSettings();
    } else {
      // Reset to default when user logs out
      useSettingsStore.setState({ settings: defaultSettings });
    }
  });
};
