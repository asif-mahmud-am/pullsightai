// src/api/auth/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, logout } from "./endpoints";
import { useAuthStore } from "@/store/authStore";

export const useUserQuery = () => {
    const setUser = useAuthStore((s) => s.setUser);
    return useQuery({
        queryKey: ["user"],
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
