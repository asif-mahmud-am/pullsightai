import { Organization } from "./organization";

export type Provider = "github" | "bitbucket" | "gitlab";

export interface User {
    _id: string;
    username: string;
    displayName: string;
    email: string;
    provider: Provider;
    providerId: string;
    avatarUrl: string;
    currentWorkspace?: Organization; // Can be Organization object or ID
    workspaces: Organization[];
}

export interface TeamMember {
    username: string;
    provider: Provider;
    providerId: string;
    displayName: string;
    avatarUrl: string;
}
