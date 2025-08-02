export interface Repository {
    id: string;
    external_id: number;
    name: string;
    author?: {
        name: string;
        avatarUrl: string;
    };
    slug: string;
    createdAt: string;
    updatedAt: string;
    time?: string;
    provider: "github" | "gitlab" | "bitbucket";
    integrations?: {
        bitbucket?: {
            connected: boolean;
            connected_at?: string;
        };
        jira?: {
            connected: boolean;
            connected_at?: string;
            url?: string;
        };
    };
}
