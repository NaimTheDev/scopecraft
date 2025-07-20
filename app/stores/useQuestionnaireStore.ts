// app/stores/useQuestionnaireStore.ts
import { create } from "zustand";

export type EstimateBreakdown = {
  feature: string;
  hours: number;
  cost: number;
};

export type GeneratedEstimate = {
  totalHours: number;
  totalCost: number;
  breakdown: EstimateBreakdown[];
  hourlyRate: number;
};

export type QuestionnaireState = {
  clientRequest: string;
  projectType: string;
  features: string[];
  timeline: string;
  budget: string;
  notes: string;
  generatedEstimate: GeneratedEstimate | null;
  setClientRequest: (value: string) => void;
  setProjectType: (type: string) => void;
  toggleFeature: (feature: string) => void;
  setTimeline: (value: string) => void;
  setBudget: (value: string) => void;
  setNotes: (value: string) => void;
  setGeneratedEstimate: (estimate: GeneratedEstimate) => void;
  clearGeneratedEstimate: () => void;
};

export const useQuestionnaireStore = create<QuestionnaireState>((set) => ({
  clientRequest: "",
  projectType: "",
  features: [],
  timeline: "",
  budget: "",
  notes: "",
  generatedEstimate: null,
  setClientRequest: (value) => set({ clientRequest: value }),
  setProjectType: (type) => set({ projectType: type }),
  toggleFeature: (feature) =>
    set((state) => ({
      features: state.features.includes(feature)
        ? state.features.filter((f) => f !== feature)
        : [...state.features, feature],
    })),
  setTimeline: (value) => set({ timeline: value }),
  setBudget: (value) => set({ budget: value }),
  setNotes: (value) => set({ notes: value }),
  setGeneratedEstimate: (estimate) => set({ generatedEstimate: estimate }),
  clearGeneratedEstimate: () => set({ generatedEstimate: null }),
}));
