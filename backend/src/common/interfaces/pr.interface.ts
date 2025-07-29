export interface PRFile {
    pr_file_name: string
    pr_file_status: string
    pr_file_additions: number
    pr_file_deletions: number
    pr_file_changes: number
    pr_file_content_before: string
    pr_file_content_after: string
    pr_file_diff: string
    pr_file_blob_url: string
}

export interface PullRequestData {
    pr_id: string
    pr_user: string
    owner: string
    repo: string
    prNumber: string
    installationId: string
    pr_repo_name: string
    pr_number: number
    pr_title: string
    pr_body: string
    pr_state: string
    pr_created_at: string
    pr_updated_at: string
    pr_head_branch: string
    pr_base_branch: string
    pr_head_sha: string
    pr_base_sha: string
    pr_files_changed: number
    pr_files: PRFile[]
}

export interface StructuredPRData {
    pull_request: PullRequestData
}
