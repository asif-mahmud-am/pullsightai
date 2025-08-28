"use client";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types/user";
import { useEffect } from "react";

const HydrateUser = ({ user }: { user: User }) => {
    const { setWorkspaces, setSelectedWorkspace, setUser, setHydrated } =
        useAuthStore((s) => s);

    useEffect(() => {
        if (user) {
            setUser(user);
            setWorkspaces(user.workspaces);
            setSelectedWorkspace(user.currentWorkspace || null);
        }
        setHydrated();
    }, [user, setUser, setHydrated]);

    return null;
};

export default HydrateUser;
