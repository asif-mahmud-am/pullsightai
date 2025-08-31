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
    _id?: string; // ID for updates
    username: string;
    provider: Provider;
    providerId: string;
    displayName: string;
    avatarUrl: string;
    isActive?: boolean; // Active status
    invitedAt?: string; // Invitation date
    joinedAt?: string; // Joining date
    createdAt?: string; // Creation date
    updatedAt?: string; // Update date
}
