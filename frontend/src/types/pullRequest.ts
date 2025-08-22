export interface PullRequest {
    provider: string;
    prId: number;
    prNumber: number;
    prTitle: string;
    prState: string;
    prUser: string;
    prUserAvatar: string;
    prCreatedAt: string;
    prUpdatedAt: string;
    prClosedAt: string | null;
    prMergedAt: string | null;
    repo?: string;
    prUrl: string;
}
