import apiClient from "@/lib/axios";

export const githubEndpoints = {
    getOrgs: () => apiClient.get("/github/organizations").then((res) => res.data),
    getRepos: () => apiClient.get("/github/repos").then((res) => res.data),
    getPR: (id: string) =>
        apiClient.get(`/github/pr/${id}`).then((res) => res.data),
};
