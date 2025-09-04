import apiClient from "@/lib/axios";

export const subscriptionEndpoints = {
    getPlans: async () => {
        return apiClient.get("/plan").then((res) => res.data);
    },
    purchasePlan: async (payload: unknown) => {
        return apiClient
            .post("/plan/purchase", payload)
            .then((res) => res.data);
    },
    cancelPlan: async () => {
        return apiClient.post("/plan/cancel-plan").then((res) => res.data);
    },
};
