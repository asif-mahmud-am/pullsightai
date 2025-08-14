import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceEndpoints } from "../endpoints/workspace";

export const useMakeSubscriptionMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workspaceEndpoints.createSubscription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}