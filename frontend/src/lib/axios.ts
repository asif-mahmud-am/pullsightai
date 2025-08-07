// src/lib/axios.ts
import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // for cookie-based auth
});

export default apiClient;
