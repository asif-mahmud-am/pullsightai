import apiClient from "@/lib/axios";
import { Organization } from "@/types/organization";
import { Repository } from "@/types/repository";
import { ApiResponse, PaginatedResponse } from "@/types/response";
import { User } from "@/types/user";

export const gitlabEndpoints = {
    getOrgs: async (): Promise<ApiResponse<Organization[]>> => {
        return apiClient.get("/gitlab/organizations").then((res) => res.data);
    },
    addOrg: async ({ slug, type }: { slug: string; type?: string }) => {
        return apiClient
            .post("/gitlab/add-workspace", { slug, type })
            .then((res) => res.data);
    },
    getRepos: async ({
        filter,
    }: {
        filter?: string;
    }): Promise<ApiResponse<Repository[]>> => {
        return apiClient
            .get("/gitlab/org-repos", {
                params: { filter },
            })
            .then((res) => res.data);
    },
    getOtherRepos: async ({
        page = 1,
        limit = 10,
    }): Promise<PaginatedResponse<Repository>> => {
        return apiClient
            .get("/gitlab/user-repos", {
                params: { page, limit },
            })
            .then((res) => res.data);
    },
    getPRs: async (id: string) => {
        return apiClient
            .get(`/gitlab/repos-pr-list`, {
                params: { repo: id },
            })
            .then((res) => res.data);
    },
    reviewPr: async ({
        prId,
        repoId,
    }: {
        prId: string;
        repoId: string;
    }): Promise<ApiResponse<void>> => {
        return apiClient
            .get(`/gitlab/review-pr`, {
                params: { prNumber: prId, repo: repoId },
            })
            .then((res) => res.data);
    },

    getTeamMembers: async (): Promise<ApiResponse<User[]>> => {
        return apiClient.get(`/gitlab/org-members`).then((res) => res.data);
    },
};
