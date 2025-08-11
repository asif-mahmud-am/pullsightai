export interface PullRequest {
    id?: string; // Unique identifier for the pull request
    prNumber: string; // PR number
    external_id: number;
    prState: string;
    number: number;
    status: string;
    merged: boolean;
    title: string;
    prTitle: string;
    html_url: string;
    prAdditions: number;
    prDeletions: number;
    prFilesChanged: number;
    avatar_url?: string | null;
    time?: string;
    createdOn?: string;
    updatedOn?: string;
    createdAt: string;
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
