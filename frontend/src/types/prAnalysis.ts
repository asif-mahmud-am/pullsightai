export interface AIComment {
    path: string;
    line_start: number;
    line_end: number;
    issue: string;
    suggestion: string;
    code_snippet: string;
    code_snippet_line_start: number;
    severity: "critical" | "warning" | "info";
}

export interface PRAnalysisData {
    pullRequest: {
        prTitle: string;
        prNumber: number;
        prState: string;
        merged: boolean;
        prUser: string;
        // user: {
        //     login: string;
        //     avatar_url: string;
        // };
        html_url: string;
        prCreatedAt: string;
        prAdditions: number;
        prDeletions: number;
        prFilesChanged: number;
    };
    analysis: {
        summary: string;
        comments: AIComment[];
    };
}
