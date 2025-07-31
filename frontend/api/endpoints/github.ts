import apiClient from "@/lib/axios";
import { Organization } from "@/types/organization";
import { Repository } from "@/types/repository";
import { ApiResponse } from "@/types/response";

export const githubEndpoints = {
    getOrgs: (): Promise<ApiResponse<Organization[]>> =>
        apiClient.get("/github/organizations").then((res) => res.data),
    getRepos: ({
        orgName,
        installationId,
    }: {
        orgName: string;
        installationId: string;
    }): Promise<ApiResponse<Repository[]>> =>
        apiClient
            .get("/github/org-repos", {
                params: { name: orgName, installationId },
            })
            .then((res) => res.data),
    getPRs: (id: string) =>
        apiClient
            .get(`/github/repos-pr-list`, {
                params: { repo: id },
            })
            .then((res) => res.data),
};
