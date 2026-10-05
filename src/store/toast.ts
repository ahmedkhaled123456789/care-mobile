import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';
export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  items: ToastItem[];
  show: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

/** Snackbar queue rendered by `<ToastHost />`. Only the latest three are kept. */
export const useToastStore = create<ToastState>((set) => ({
  items: [],
  show: (message, tone = 'info') => {
    const id = nextId++;
    set((s) => ({ items: [...s.items.slice(-2), { id, message, tone }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((i) => i.id !== id) })), tone === 'error' ? 4500 : 3000);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
}));

/** `toast.success('Saved')` — callable from components, hooks and mutation callbacks. */
export const toast = {
  success: (m: string) => useToastStore.getState().show(m, 'success'),
  error: (m: string) => useToastStore.getState().show(m, 'error'),
  info: (m: string) => useToastStore.getState().show(m, 'info')
};
