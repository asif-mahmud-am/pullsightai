export interface PullRequest {
    id?: string; // Unique identifier for the pull request
    prNumber: string; // PR number
    external_id: number;
    number: number;
    status: string;
    merged: boolean;
    title: string;
    createdAt: string;
    html_url: string;
    additions: number;
    deletions: number;
    changed_files: number;
    avatar_url?: string | null;
    time?: string;
    updatedAt?: string;
    provider: "github" | "gitlab" | "bitbucket";
    user?: {
        username: string;
        avatarUrl: string;
    };
    author?: {
        username: string;
        avatarUrl: string;
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
