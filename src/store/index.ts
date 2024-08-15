// store.ts
import create from 'zustand';

interface AppState {
  selectedRowsCount: number;
  setSelectedRowsCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedRowsCount: 0,
  setSelectedRowsCount: (count) => set({ selectedRowsCount: count }),
}));
