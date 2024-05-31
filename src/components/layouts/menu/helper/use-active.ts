import { create } from "zustand";

const useActiveMenu = create((set) => ({
  active: null,
  setActive: (value) => set(() => ({ active: value })),
}));

export default useActiveMenu;
