import apiClient from "@/lib/axios";
import { Organization } from "@/types/organization";
import { Repository } from "@/types/repository";
import { ApiResponse } from "@/types/response";

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
        orgName,
    }: {
        orgName?: string;
    }): Promise<ApiResponse<Repository[]>> => {
        return apiClient
            .get("/gitlab/org-repos", {
                params: {},
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
};
