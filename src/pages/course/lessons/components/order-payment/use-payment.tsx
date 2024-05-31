import { create } from "zustand";

const usePayment = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setOpenPayment: (isOpen: boolean) => set({ isOpen }),
}));

export default usePayment;
