// src/api/auth/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { authEndpoints } from "../endpoints/auth";

export const useUserQuery = () => {
    const setUser = useAuthStore((s) => s.setUser);
    return useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const user = await authEndpoints.getMe();
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
        mutationFn: authEndpoints.logout,
        onSuccess: () => {
            clearUser();
            queryClient.removeQueries({ queryKey: ["user"] });
        },
    });
};

export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore((s) => s);

    return useMutation({
        mutationFn: authEndpoints.updateUser,
        onSuccess: (data) => {
            setUser({ ...user, ...data.data });
            queryClient.invalidateQueries({ queryKey: ["user", "repos"] });
        },
    });
};
