export interface Repository {
    _id: string;
    id: string;
    external_id: number;
    name: string;
    author?: {
        username: string;
        avatarUrl: string;
    };
    slug: string;
    ignore: string[];
    minSeverity: "info" | "minor" | "major" | "critical" | "blocker";
    createdOn?: string;
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
