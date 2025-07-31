export interface Repository {
    id: number
    nodeId: string
    name: string
    fullName: string
    private: boolean
    author: {
        name: string
        avatarUrl: string
    }
    pushedAt: string
    openIssues: number
}
