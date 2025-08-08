import apiClient from "@/lib/axios";
import { Organization } from "@/types/organization";
import { Repository } from "@/types/repository";
import { ApiResponse } from "@/types/response";

export const bitbucketEndpoints = {
    getOrgs: async (): Promise<ApiResponse<Organization[]>> => {
        return apiClient
            .get("/bitbucket/organizations")
            .then((res) => res.data);
    },

    addOrg: async ({ slug, type }: { slug: string; type?: string }) => {
        return apiClient
            .post("/bitbucket/add-workspace", { slug, type })
            .then((res) => res.data);
    },

    getRepos: async ({
        orgName,
    }: {
        orgName: string;
    }): Promise<ApiResponse<Repository[]>> => {
        return apiClient
            .get("/bitbucket/org-repos", {
                params: {},
            })
            .then((res) => res.data);
    },

    getPRs: async (id: string) => {
        return apiClient
            .get(`/bitbucket/repos-pr-list`, {
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
            .get(`/bitbucket/review-pr`, {
                params: { prNumber: prId, repo: repoId },
            })
            .then((res) => res.data);
    },
};
