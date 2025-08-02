import apiClient from "@/lib/axios";
import { Organization } from "@/types/organization";
import { Repository } from "@/types/repository";
import { ApiResponse } from "@/types/response";

export const githubEndpoints = {
    getOrgs: (): Promise<ApiResponse<Organization[]>> =>
        apiClient.get("/github/organizations").then((res) => res.data),
    getRepos: ({
        orgName,
    }: {
        orgName?: string;
    }): Promise<ApiResponse<Repository[]>> =>
        apiClient
            .get("/github/org-repos", {
                params: {},
            })
            .then((res) => res.data),
    getPRs: (id: string) =>
        apiClient
            .get(`/github/repos-pr-list`, {
                params: { repo: id },
            })
            .then((res) => res.data),
    reviewPr: ({
        prId,
        repoId,
    }: {
        prId: string;
        repoId: string;
    }): Promise<ApiResponse<void>> =>
        apiClient
            .get(`/github/review-pr`, {
                params: { prNumber: prId, repo: repoId },
            })
            .then((res) => res.data),
};
