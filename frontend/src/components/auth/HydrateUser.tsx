"use client";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types/user";
import { useEffect } from "react";

const HydrateUser = ({ user }: { user: User }) => {
    const setUser = useAuthStore((s) => s.setUser);
    const setHydrated = useAuthStore((s) => s.setHydrated);

    useEffect(() => {
        if (user) setUser(user);
        setHydrated();
    }, [user, setUser, setHydrated]);

    return null;
};

export default HydrateUser;
