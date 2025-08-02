export interface AIComment {
    path: string;
    line_start: number;
    line_end: number;
    suggestion: string;
    code_snippet: string;
    code_snippet_line_start: number;
    severity: "critical" | "warning" | "info";
}

export interface PRAnalysisData {
    pull_request: {
        pr_title: string;
        pr_number: number;
        pr_state: string;
        merged: boolean;
        pr_user: string;
        // user: {
        //     login: string;
        //     avatar_url: string;
        // };
        html_url: string;
        pr_created_at: string;
        pr_additions: number;
        pr_deletions: number;
        pr_files_changed: number;
    };
    analysis: {
        summary: string;
        comments: AIComment[];
    };
}
