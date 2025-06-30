import { create } from 'zustand'

interface UIState {
  booted: boolean
  setBooted: (value: boolean) => void
}

export const useUIState = create<UIState>((set) => ({
  booted: false,
  setBooted: (value) => set({ booted: value }),
})) 