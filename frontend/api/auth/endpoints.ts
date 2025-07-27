// src/api/auth/endpoints.ts
import axios from "@/lib/axios";
import { AUTH_CONSTANTS } from "@/lib/constants";

export const getMe = async () => {
    const res = await axios.get("/auth/profile");
    return res.data;
};

export const getUserFromServer = async (token: string) => {
    const res = await axios.get("/auth/profile", {
        headers: {
            Cookie: token,
        },
    });
    return res.data;
};
export const logout = async () => {
    const res = await axios.post("/auth/logout");
    return res.data;
};
