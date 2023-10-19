import { create } from "zustand";

export type Status = "success" | "info" | "error" | "warning";

interface AlertStore {
  status: Status | null;
  message: string | null;
  setAlert: (status: Status, message: string) => void;
  clearAlert: () => void;
}

export const useAlert = create<AlertStore>((set) => ({
  status: null,
  message: null,
  setAlert: (status, message) => set({ status, message }),
  clearAlert: () => set({ status: null, message: null }),
}));
