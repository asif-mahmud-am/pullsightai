import { User } from "@/types/user";
import { create } from "zustand";

type AuthState = {
    hydrated: boolean;
    user: User | null;
    setHydrated: () => void;
    setUser: (user: User) => void;
    clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    hydrated: false,
    user: null,
    setHydrated: () => set({ hydrated: true }),
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
}));
