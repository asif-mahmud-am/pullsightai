export interface Organization {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    avatar_url?: string | null;
    author?: string;
    time?: string;
    updated_at?: string;
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
