export interface Repository {
    id: string;
    external_id: number;
    name: string;
    author?: {
        name: string;
        avatarUrl: string;
    };
    slug: string;
    pushedAt: string;
    owner_avatar: string | null;
    avatar_url?: string | null;
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
