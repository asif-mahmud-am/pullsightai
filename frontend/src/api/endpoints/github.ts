import apiClient from "@/lib/axios";
import { Organization } from "@/types/organization";
import { Repository } from "@/types/repository";
import { ApiResponse } from "@/types/response";

export const githubEndpoints = {
    getOrgs: async (): Promise<ApiResponse<Organization[]>> => {
        return apiClient.get("/github/organizations").then((res) => res.data);
    },
    getRepos: async ({
        orgName,
    }: {
        orgName?: string;
    }): Promise<ApiResponse<Repository[]>> => {
        return apiClient
            .get("/github/org-repos", {
                params: {},
            })
            .then((res) => res.data);
    },
    getPRs: async (id: string) => {
        return apiClient
            .get(`/github/repos-pr-list`, {
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
            .get(`/github/review-pr`, {
                params: { prNumber: prId, repo: repoId },
            })
            .then((res) => res.data);
    },
};
