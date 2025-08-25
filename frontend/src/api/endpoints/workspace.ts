import apiClient from "@/lib/axios";
import { get } from "http";

export const workspaceEndpoints = {
    createSubscription: (payload: unknown) =>
        apiClient
            .post("/workspace/subscription", payload)
            .then((res) => res.data),

    getRepositories: () =>
        apiClient.get("/workspace/repositories").then((res) => res.data),

    updateRepository: (payload: { id: string; data: unknown }) =>
        apiClient
            .patch(`/workspace/repositories/${payload.id}`, payload.data)
            .then((res) => res.data),

    getPullRequests: () =>
        apiClient.get("/workspace/pr-list").then((res) => res.data),
};
