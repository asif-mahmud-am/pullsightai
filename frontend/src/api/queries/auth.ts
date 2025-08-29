// src/api/auth/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { authEndpoints } from "../endpoints/auth";

export const useUserQuery = () => {
    const { setSelectedWorkspace, setWorkspaces, setUser } = useAuthStore(
        (s) => s
    );
    return useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const user = await authEndpoints.getMe();
            setUser(user);
            setWorkspaces(user.workspaces);
            setSelectedWorkspace(user.currentWorkspace || null);
            return user;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};

export const useLogoutMutation = () => {
    const queryClient = useQueryClient();
    const clearStore = useAuthStore((s) => s.clearStore);

    return useMutation({
        mutationFn: authEndpoints.logout,
        onSuccess: () => {
            clearStore();
            queryClient.removeQueries({ queryKey: ["user"] });
        },
    });
};

export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();
    const { user, setUser, setSelectedWorkspace } = useAuthStore((s) => s);

    return useMutation({
        mutationFn: authEndpoints.updateUser,
        onSuccess: (data) => {
            setUser({ ...user, ...data.data });
            setSelectedWorkspace(data.data.currentWorkspace || null);
            queryClient.invalidateQueries({ queryKey: ["user", "repos"] });
        },
    });
};
