"use client";
import { User } from "@/features/users/profile";
import { create } from "zustand";

type State = {
  currentUser: User | null;
};

type Action = {
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const useUserMenu = create<State & Action>((set) => ({
  currentUser: null,
  setUser: (user) => set({ currentUser: user }),
  clearUser: () => set({ currentUser: null }),
}));
