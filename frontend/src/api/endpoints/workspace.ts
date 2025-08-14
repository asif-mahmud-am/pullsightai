import apiClient from "@/lib/axios";

export const workspaceEndpoints = {
    createSubscription: (payload:unknown) =>
        apiClient.post("/workspace/subscription", payload).then((res) => res.data),
}