export interface Repository {
    id: number
    name: string
    fullName: string
    private: boolean
    author: {
        name: string
        avatarUrl: string
    }
    createdAt: string
    updatedAt: string
    openIssues: number
}

export interface PullRequestResponse {
    id: number
    nodeId: string
    prNumber: number
    title: string
    status: string
    author: {
        username: string
        avatarUrl: string
    }
    createdAt: string // ISO date string
    updatedAt: string
    closedAt: string | null
    mergedAt: string | null
    url: string
}
