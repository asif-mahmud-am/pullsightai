export interface PRFile {
    prFileName: string
    prFileStatus: string
    prFileAdditions: number
    prFileDeletions: number
    prFileChanges: number
    prFileContentBefore: string
    prFileContentAfter: string
    prFileDiff: string
    prFileBlobUrl: string
}

export interface PullRequestData {
    prId: string
    prUser: string
    owner: string
    repo: string
    prNumber: string
    installationId: string
    prRepoName: string
    prTitle: string
    prBody: string
    prState: string
    prCreatedAt: string
    prUpdatedAt: string
    prHeadBranch: string
    prBaseBranch: string
    prHeadSha: string
    prBaseSha: string
    prFilesChanged: number
    prFiles: PRFile[]
}

export interface StructuredPRData {
    pullRequest: PullRequestData
}
