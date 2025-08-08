export interface Repository {
    id: number
    name: string
    fullName: string
    slug: string
    private: boolean
    author: {
        username: string
        avatarUrl: string
    }
    createdOn: string
    updatedOn: string
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
    createdOn: string // ISO date string
    updatedOn: string
    closedOn: string | null
    mergedOn: string | null
    url: string
}
