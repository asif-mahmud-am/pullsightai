import { Organization } from "@/types/organization";
import { User } from "@/types/user";
import { create } from "zustand";

type AuthState = {
    hydrated: boolean;
    user: User | null;
    selectedWorkspace: Organization | null;
    workspaces: Organization[] | null;
};

interface AuthActions {
    setHydrated: () => void;
    setUser: (user: User) => void;
    setSelectedWorkspace: (workspace: Organization | null) => void;
    setWorkspaces: (workspaces: Organization[] | null) => void;
    clearStore: () => void;
}

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set) => ({
    hydrated: false,
    user: null,
    selectedWorkspace: null,
    workspaces: null,
    setHydrated: (): void => set({ hydrated: true }),
    setUser: (user: User): void => set({ user }),
    setSelectedWorkspace: (workspace: Organization | null): void =>
        set({ selectedWorkspace: workspace }),
    setWorkspaces: (workspaces: Organization[] | null): void =>
        set({ workspaces }),
    clearStore: (): void =>
        set({
            user: null,
            selectedWorkspace: null,
            workspaces: null,
        }),
}));
