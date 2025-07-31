export interface Repository {
    external_id: number;
    name: string;
    owner_name: string;
    slug: string;
    created_at: string;
    owner_avatar: string | null;
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
