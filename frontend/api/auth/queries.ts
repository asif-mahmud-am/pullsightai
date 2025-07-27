// src/api/auth/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, logout } from "./endpoints";
import { useAuthStore } from "@/store/authStore";
import Cookies from "js-cookie";
import { AUTH_CONSTANTS } from "@/lib/constants";

export const useUserQuery = () => {
    const setUser = useAuthStore((s) => s.setUser);

    // const hasCookie = Boolean(Cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN));

    return useQuery({
        queryKey: ["user"],
        // enabled: hasCookie,
        queryFn: async () => {
            const user = await getMe();
            setUser(user);
            return user;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};

export const useLogoutMutation = () => {
    const queryClient = useQueryClient();
    const clearUser = useAuthStore((s) => s.clearUser);

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            clearUser();
            queryClient.removeQueries({ queryKey: ["user"] });
        },
    });
};
