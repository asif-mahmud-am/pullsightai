import { useMutation, useQuery } from "@tanstack/react-query";
import { subscriptionEndpoints } from "../endpoints/subscription";
import { Plan } from "@/types/plan";
import { useAuthStore } from "@/store/authStore";

export const useGetSubscriptionPlansQuery = ({ isEnabled = true } = {}) => {
    return useQuery<{
        data: Plan[];
    }>({
        queryKey: ["subscriptionPlans"],
        queryFn: () => subscriptionEndpoints.getPlans(),
        enabled: isEnabled,
    });
};

export const usePurchasePlanMutation = () => {
    return useMutation({
        mutationKey: ["purchasePlan"],
        mutationFn: (payload: unknown) =>
            subscriptionEndpoints.purchasePlan(payload),
    });
};

export const useCancelPlanMutation = () => {
    const {
        selectedWorkspace,
        setSelectedWorkspace,
        workspaces,
        setWorkspaces,
    } = useAuthStore();
    return useMutation({
        mutationKey: ["user"],
        mutationFn: () => subscriptionEndpoints.cancelPlan(),
        onSuccess: (data) => {
            console.log(data);
            if (selectedWorkspace) {
                setSelectedWorkspace({
                    ...selectedWorkspace,
                    currentPlan: undefined,
                });
            }
            setWorkspaces([
                ...(workspaces
                    ? workspaces?.map((ws) => {
                          if (ws._id === selectedWorkspace?._id) {
                              return {
                                  ...ws,
                                  currentPlan: undefined,
                              };
                          }
                          return ws;
                      })
                    : []),
            ]);
        },
    });
};
