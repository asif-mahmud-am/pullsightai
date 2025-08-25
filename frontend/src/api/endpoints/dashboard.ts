import apiClient from "@/lib/axios";

export const dashboardEndpoints = {
    getPrAnalysis: (params: unknown) =>
        apiClient
            .get("/api/dashboard/pr-analysis-card", { params })
            .then((res) => res.data),
};
