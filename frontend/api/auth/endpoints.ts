// src/api/auth/endpoints.ts
import apiClient from "@/lib/axios";

export const authEndpoints = {
    getMe: async () => apiClient.get("/auth/profile").then((res) => res.data),
    getUserFromServer: async (token: string) =>
        apiClient
            .get("/auth/profile", { headers: { Cookie: token } })
            .then((res) => res.data),
    logout: async () => apiClient.post("/auth/logout").then((res) => res.data),
};
