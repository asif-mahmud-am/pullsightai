export interface Organization {
    _id?: string;
    id: string;
    name: string;
    nodeId: string;
    url: string;
    avatarUrl?: string | null;
    reposUrl?: string;
    type?: "Organization" | "User";
    author?: string;
    installationId?: string;
}
