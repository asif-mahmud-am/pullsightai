import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceEndpoints } from "../endpoints/workspace";

export const useMakeSubscriptionMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workspaceEndpoints.createSubscription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

export const useGetRepositoriesQuery = () => {
    return useQuery({
        queryKey: ["repositories"],
        queryFn: workspaceEndpoints.getRepositories,
    });
};

export const useGetPullRequestsQuery = () => {
    return useQuery({
        queryKey: ["pullRequests"],
        queryFn: workspaceEndpoints.getPullRequests,
    });
};
