import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceEndpoints } from "../endpoints/workspace";

export const useUpdateWorkspaceSettingsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workspaceEndpoints.updateWorkspaceSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspace"] });
        },
    });
};

export const useMakeSubscriptionMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workspaceEndpoints.createSubscription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

export const useGetWorkspaceRepositoriesQuery = ({
    isActive = undefined,
    page = 1,
    limit = 10,
    author = null,
    isEnabled = true,
}: {
    isActive?: boolean;
    page?: number;
    limit?: number;
    author?: string | null;
    isEnabled?: boolean;
}) => {
    return useQuery({
        queryKey: ["repositories", { isActive, page, limit, author }],
        queryFn: ({}) =>
            workspaceEndpoints.getRepositories({
                isActive,
                page,
                limit,
                author,
            }),
        enabled: isEnabled,
    });
};

export const useUpdateRepositoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workspaceEndpoints.updateRepository,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["repositories"] });
        },
    });
};

export const useGetWorkspacePullRequestsQuery = ({
    page = 1,
    limit = 10,
    repo = null,
    prState = null,
    prUser = null,
    isEnabled = true,
}: {
    page?: number;
    limit?: number;
    repo?: string | null;
    prState?: string | null;
    prUser?: string | null;
    isEnabled?: boolean;
}) => {
    return useQuery({
        queryKey: ["pullRequests", { page, limit, repo, prState, prUser }],
        queryFn: () =>
            workspaceEndpoints.getPullRequests({
                page,
                limit,
                repo: repo || undefined,
                prState: prState || undefined,
                prUser: prUser || undefined,
            }),
        enabled: isEnabled,
    });
};

export const useGetWorkspaceTeamMembersQuery = ({
    page = 1,
    limit = 10,
    isEnabled = true,
}: {
    page?: number;
    limit?: number;
    isEnabled?: boolean;
}) => {
    return useQuery({
        queryKey: ["teamMembers", { page, limit }],
        queryFn: () =>
            workspaceEndpoints.getTeamMembers({
                page,
                limit,
            }),
        enabled: isEnabled,
    });
};
