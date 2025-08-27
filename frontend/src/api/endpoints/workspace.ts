import apiClient from "@/lib/axios";
import { get } from "http";

export const workspaceEndpoints = {
    updateWorkspaceSettings: (payload: unknown) => {
        return apiClient
            .patch("/workspace/update-settings", payload)
            .then((res) => res.data);
    },
    createSubscription: (payload: unknown) =>
        apiClient
            .post("/workspace/subscription", payload)
            .then((res) => res.data),

    getRepositories: ({
        page = 1,
        limit = 10,
        isActive,
        author = null,
    }: {
        page?: number;
        limit?: number;
        isActive?: boolean;
        author?: string | null;
    }) => {
        return apiClient
            .get("/workspace/repositories", {
                params: { isActive, page, limit, author },
            })
            .then((res) => res.data);
    },

    updateRepository: (payload: { id: string; data: unknown }) => {
        return apiClient
            .patch(`/workspace/repositories/${payload.id}`, payload.data)
            .then((res) => res.data);
    },

    getPullRequests: ({
        page = 1,
        limit = 10,
        repo = null,
        prState = null,
        prUser = null,
    }: {
        page?: number;
        limit?: number;
        repo?: string | null;
        prState?: string | null;
        prUser?: string | null;
    }) => {
        return apiClient
            .get("/workspace/pr-list", {
                params: { page, limit, repo, prState, prUser },
            })
            .then((res) => res.data);
    },
    getTeamMembers: ({
        page = 1,
        limit = 10,
    }: {
        page?: number;
        limit?: number;
    }) => {
        return apiClient
            .get("/workspace/team-members", {
                params: { page, limit },
            })
            .then((res) => res.data);
    },
};
