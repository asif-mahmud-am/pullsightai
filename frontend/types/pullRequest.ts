export interface PullRequest {
    id?: string; // Unique identifier for the pull request
    external_id: number;
    number: number;
    state: string;
    merged: boolean;
    title: string;
    created_at: string;
    html_url: string;
    additions: number;
    deletions: number;
    changed_files: number;
    avatar_url?: string | null;
    author?: string;
    time?: string;
    updated_at?: string;
    provider: "github" | "gitlab" | "bitbucket";
    user: {
        login: string;
        avatar_url: string;
    };
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
