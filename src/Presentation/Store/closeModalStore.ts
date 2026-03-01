import { create } from 'zustand';

interface CloseModalState {
  isOpen: boolean;
  windowId: string | null;
  onSave: (() => void) | null;
  onDiscard: (() => void) | null;
}

interface CloseModalActions {
  openModal: (windowId: string, onSave: () => void, onDiscard: () => void) => void;
  closeModal: () => void;
  setOnSave: (onSave: (() => void) | null) => void;
  setOnDiscard: (onDiscard: (() => void) | null) => void;
}

export const useCloseModalStore = create<CloseModalState & CloseModalActions>()(set => ({
  isOpen: false,
  windowId: null,
  onSave: null,
  onDiscard: null,

  openModal: (windowId, onSave, onDiscard) =>
    set({
      isOpen: true,
      windowId,
      onSave,
      onDiscard,
    }),

  closeModal: () => set({ isOpen: false, windowId: null, onSave: null, onDiscard: null }),

  setOnSave: onSave => set({ onSave }),

  setOnDiscard: onDiscard => set({ onDiscard }),
}));
