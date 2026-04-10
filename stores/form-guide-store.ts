import { create } from 'zustand';
import type {
  ChatMessage,
  CurrentImage,
  GuideMode,
} from '@/types/form-guide';

interface FormGuideState {
  currentImage: CurrentImage | null;
  messages: ChatMessage[];
  isAnalyzing: boolean;
  error: string | null;
  guideMode: GuideMode;
}

interface FormGuideActions {
  setCurrentImage: (image: CurrentImage) => void;
  clearCurrentImage: () => void;
  appendMessage: (message: ChatMessage) => void;
  setAnalyzing: (flag: boolean) => void;
  setError: (message: string | null) => void;
  setGuideMode: (mode: GuideMode) => void;
  reset: () => void;
}

const INITIAL_STATE: FormGuideState = {
  currentImage: null,
  messages: [],
  isAnalyzing: false,
  error: null,
  guideMode: 'form',
};

export const useFormGuideStore = create<FormGuideState & FormGuideActions>(
  (set) => ({
    ...INITIAL_STATE,
    setCurrentImage: (image) =>
      set({ currentImage: image, messages: [], error: null }),
    clearCurrentImage: () => set({ currentImage: null, messages: [] }),
    appendMessage: (message) =>
      set((state) => ({ messages: [...state.messages, message] })),
    setAnalyzing: (flag) => set({ isAnalyzing: flag }),
    setError: (message) => set({ error: message }),
    setGuideMode: (mode) => set({ guideMode: mode }),
    reset: () => set({ ...INITIAL_STATE }),
  }),
);
