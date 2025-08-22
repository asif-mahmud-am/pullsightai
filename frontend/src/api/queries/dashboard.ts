import { useQuery } from "@tanstack/react-query";
import { dashboardEndpoints } from "../endpoints/dashboard";

export const useDashboardPrAnalysisQuery = (params: unknown) => {
    return useQuery({
        queryKey: ["dashboardPrAnalysis", params],
        queryFn: () => dashboardEndpoints.getPrAnalysis(params),
    });
};
