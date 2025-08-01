import apiClient from "@/lib/axios";
import { Organization } from "@/types/organization";
import { Repository } from "@/types/repository";
import { ApiResponse } from "@/types/response";

export const bitbucketEndpoints = {
    getOrgs: (): Promise<ApiResponse<Organization[]>> =>
        apiClient.get("/bitbucket/organizations").then((res) => res.data),
    getRepos: ({
        orgName,
        installationId,
    }: {
        orgName: string;
        installationId: string;
    }): Promise<ApiResponse<Repository[]>> =>
        apiClient
            .get("/bitbucket/repositories", {
                params: { workspace: orgName },
            })
            .then((res) => res.data),
    getPRs: (id: string) =>
        apiClient
            .get(`/bitbucket/repos-pr-list`, {
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
            .get(`/bitbucket/review-pr`, {
                params: { prNumber: prId, repo: repoId },
            })
            .then((res) => res.data),
};
