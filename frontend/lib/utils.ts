import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getAuthUrl(
    provider: string,
    options:
        | string
        | string[][]
        | Record<string, string>
        | URLSearchParams
        | undefined = {}
): string {
    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const baseUrl = `${apiUrl}/auth/${provider}`;
    const queryParams = new URLSearchParams(options).toString();
    return queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
}
