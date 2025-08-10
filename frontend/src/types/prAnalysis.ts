export interface AIComment {
    _id: string;
    metadata: unknown | null; // Metadata can be any additional information, currently not used
    filePath: string;
    lineStart: number;
    lineEnd: number;
    content: string; // Full content of the comment
    suggestion: string;
    codeSnippet: string;
    codeSnippetLineStart: number;
    severity: string; // Severity can be "Critical", "Warning", "Info" or similar
    category: string;
    pullRequestAnalysisId: string; // Reference to the PR analysis this comment belongs to
    createdAt: string;
    updatedAt: string;
}

export interface PRAnalysisData {
    _id: string;
    prId: string;
    provider: "github" | "gitlab" | "bitbucket";
    workspaceSlug: string;
    repositorySlug: string;
    prNumber: string;
    installationId: string;
    status: "pending" | "completed" | "failed";
    startedAt: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    summary: string;
    comments: AIComment[];
}
