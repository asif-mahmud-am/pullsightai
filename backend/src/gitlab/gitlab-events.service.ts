import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from 'src/common/http/http.service'
import { PRFile, StructuredPRData } from 'src/common/interfaces/pr.interface'
import { DatabaseService } from 'src/database/database.service'
import { PullRequestAnalysisComment } from 'src/database/schemas/pull-request-analysis-comment.schema'
import { PullRequestAnalysis } from 'src/database/schemas/pull-request-analysis.schema'
import { GitlabApiService } from './gitlab-api.service'

@Injectable()
export class GitlabEventsService {
    private readonly baseUrl = 'https://gitlab.com/api/v4'
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly dataService: DatabaseService,
        private readonly gitlabApiService: GitlabApiService
    ) {}

    async handleGitlabMergeRequest(payload: any): Promise<StructuredPRData> {
        const mergeRequest = payload.object_attributes
        const project = payload.project

        if (!mergeRequest || !project) {
            throw new Error('Invalid GitLab merge request payload')
        }

        // console.log('Handling GitLab Merge Request:', payload)
        const workspace = project.namespace.id
        const accessToken = await this.getAccessTokenForNamespace(workspace)
        const files = await this.fetchMRFiles(
            project.id,
            mergeRequest.iid,
            accessToken
        )

        const prFiles: PRFile[] = []

        // Process each file to get before/after content
        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            const contentBefore = await this.fetchFileContent(
                project.id,
                file.new_path,
                mergeRequest.target_branch,
                accessToken
            )

            const contentAfter = await this.fetchFileContent(
                project.id,
                file.new_path,
                mergeRequest.source_branch,
                accessToken
            )

            prFiles.push({
                prFileName: file.new_path,
                prFileStatus: file.new_file
                    ? 'added'
                    : file.deleted_file
                      ? 'removed'
                      : 'modified',
                prFileAdditions: 0, // GitLab doesn't provide this in webhook
                prFileDeletions: 0, // GitLab doesn't provide this in webhook
                prFileChanges: 0, // GitLab doesn't provide this in webhook
                prFileContentBefore:
                    contentBefore || 'File not found in target branch',
                prFileContentAfter:
                    contentAfter || 'File not found in source branch',
                prFileDiff: file.diff || 'No diff available',
                prFileDiffHunks: this.parseDiffHunks(file.diff || ''),
                prFileBlobUrl: `${project.web_url}/-/blob/${mergeRequest.source_branch}/${file.new_path}`
            })
        }

        // Create the comprehensive structure matching GitHub format
        const comprehensiveAnalysis: StructuredPRData = {
            pullRequest: {
                provider: 'gitlab',
                prId: mergeRequest.id.toString(),
                prUser:
                    mergeRequest.author?.username ||
                    payload.user?.username ||
                    'unknown',
                owner: project.namespace.path,
                repo: project.name,
                prNumber: mergeRequest.iid.toString(),
                installationId: 'gitlab_integration', // GitLab doesn't have installation concept
                prRepoName: project.path_with_namespace,
                prTitle: mergeRequest.title,
                prBody: mergeRequest.description || '',
                prState: mergeRequest.state,
                prCreatedAt: mergeRequest.created_at,
                prUpdatedAt: mergeRequest.updated_at,
                prHeadBranch: mergeRequest.source_branch,
                prBaseBranch: mergeRequest.target_branch,
                prHeadSha: mergeRequest.last_commit?.id || 'unknown',
                prBaseSha: 'unknown', // Not provided in webhook
                prFilesChanged: files.length,
                prFiles: prFiles
            }
        }

        return comprehensiveAnalysis
    }

    private async getAccessTokenForNamespace(
        workspace: string
    ): Promise<string> {
        const workspaceRecord = await this.dataService.workspaces.findOne({
            id: workspace,
            provider: 'gitlab'
        })

        if (!workspaceRecord) {
            throw new BadRequestException(
                'Workspace not found for the provided GitLab namespace'
            )
        }

        // Find a user who has this workspace in their workspaces array
        const userData = await this.dataService.users.findOne(
            { workspaces: workspaceRecord._id },
            'accessToken refreshToken tokenExpiresAt'
        )

        const now = new Date()
        const expiryBuffer = 5 * 60 * 1000 // 5 minutes in milliseconds
        const isTokenExpired =
            userData?.tokenExpiresAt &&
            new Date(userData.tokenExpiresAt).getTime() <
                now.getTime() + expiryBuffer

        if (isTokenExpired && userData.refreshToken) {
            const newTokens = await this.gitlabApiService.refreshAccessToken(
                userData.refreshToken
            )

            if (newTokens) {
                const tokenExpiresAt = new Date(
                    Date.now() + (newTokens.expires_in || 7200) * 1000
                )
                await this.dataService.users.updateOne(
                    { _id: userData._id },
                    {
                        $set: {
                            accessToken: newTokens.access_token,
                            refreshToken:
                                newTokens.refresh_token ||
                                userData.refreshToken,
                            tokenExpiresAt
                        }
                    }
                )
                return newTokens.access_token
            } else {
                throw new BadRequestException('Failed to refresh access token')
            }
        }
        return userData?.accessToken as string
    }

    private async fetchMRFiles(
        projectId: number,
        mergeRequestIid: number,
        accessToken: string
    ): Promise<any[]> {
        const gitlabApiUrl = this.baseUrl

        let allFiles: any[] = []
        let page = 1
        const perPage = 100 // GitLab default is 20, max is 100

        while (true) {
            const response = await this.httpService.get(
                `${gitlabApiUrl}/projects/${projectId}/merge_requests/${mergeRequestIid}/changes`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    },
                    params: {
                        page: page,
                        per_page: perPage
                    }
                }
            )

            const changes = response.changes || []

            if (changes.length === 0) {
                // No more files to fetch
                break
            }

            allFiles = allFiles.concat(changes)

            // Check if we got fewer results than requested, meaning this is the last page
            if (changes.length < perPage) {
                break
            }

            page++

            // Safety limit to prevent infinite loops
            if (allFiles.length > 10000) {
                console.warn(
                    `Too many files in MR ${mergeRequestIid}, stopping at ${allFiles.length} files`
                )
                break
            }
        }

        console.log(
            `Fetched ${allFiles.length} files for MR ${mergeRequestIid}`
        )
        return allFiles
    }

    private async fetchFileContent(
        projectId: number,
        filePath: string,
        branch: string,
        accessToken?: string | null
    ): Promise<string | null> {
        if (!accessToken) {
            console.warn(
                'No access token provided for GitLab file content API call'
            )
            return null
        }
        const gitlabApiUrl =
            this.configService.get('GITLAB_API_URL') ||
            'https://gitlab.com/api/v4'

        const response = await this.httpService.get(
            `${gitlabApiUrl}/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}/raw`,
            {
                params: { ref: branch },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        return response
    }

    async addPRReviewComments(
        analysis: PullRequestAnalysis,
        comments: PullRequestAnalysisComment[]
    ): Promise<any> {
        const accessToken = await this.getAccessTokenForProject(
            analysis.repositorySlug
        )

        const actualProjectId = encodeURIComponent(analysis.repositorySlug)

        // Get merge request details to obtain SHA values
        const mrDetails = await this.getMergeRequestDetails(
            actualProjectId,
            +analysis.prNumber,
            accessToken
        )

        // Get merge request diffs to find line codes
        const diffs = await this.getMergeRequestDiffs(
            actualProjectId,
            +analysis.prNumber,
            accessToken
        )

        const gitlabApiUrl =
            this.configService.get('GITLAB_API_URL') ||
            'https://gitlab.com/api/v4'

        const results: any[] = []
        for (const comment of comments) {
            // Find the line_code for the specific file and line
            const lineCode = this.findLineCode(
                diffs,
                comment.filePath,
                comment.lineEnd
            )
            if (!lineCode) {
                // Fallback to general note if line_code not found
                const fallbackData = {
                    body: `**📁 File:** \`${comment.filePath}\` **📍 Line:** ${comment.lineEnd}\n\n${comment.content}`
                }
                const fallbackUrl = `${gitlabApiUrl}/projects/${actualProjectId}/merge_requests/${analysis.prNumber}/notes`
                const fallbackResponse = await this.httpService.post(
                    fallbackUrl,
                    fallbackData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                )

                results.push(fallbackResponse)
                continue
            }

            const commentData = {
                body: comment.content,
                position: {
                    position_type: 'text',
                    base_sha: mrDetails.diff_refs.base_sha,
                    start_sha: mrDetails.diff_refs.start_sha,
                    head_sha: mrDetails.diff_refs.head_sha,
                    new_path: comment.filePath,
                    old_path: comment.filePath,
                    new_line: comment.lineEnd,
                    old_line: null // For new lines, old_line can be null
                }
            }
            const apiUrl = `${gitlabApiUrl}/projects/${actualProjectId}/merge_requests/${analysis.prNumber}/discussions`
            const response = await this.httpService.post(apiUrl, commentData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            })

            results.push(response)
        }
        return results
    }

    async addPRSummery(analysis: PullRequestAnalysis): Promise<any> {
        const accessToken = await this.getAccessTokenForProject(
            analysis.repositorySlug
        )

        const actualProjectId = encodeURIComponent(analysis.repositorySlug)

        const commentData = {
            body: analysis.summary
        }

        const apiUrl = `${this.baseUrl}/projects/${actualProjectId}/merge_requests/${analysis.prNumber}/notes`

        const response = await this.httpService.post(apiUrl, commentData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        return response
    }

    private async getMergeRequestDiffs(
        projectId: string,
        mrNumber: number,
        accessToken: string
    ): Promise<any[]> {
        const gitlabApiUrl =
            this.configService.get('GITLAB_API_URL') ||
            'https://gitlab.com/api/v4'

        const apiUrl = `${gitlabApiUrl}/projects/${projectId}/merge_requests/${mrNumber}/diffs`

        const response = await this.httpService.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        return response
    }

    private findLineCode(
        diffs: any[],
        filePath: string,
        lineNumber: number
    ): string | null {
        console.log('Looking for line code for:', filePath, 'line:', lineNumber)

        for (const diff of diffs) {
            if (diff.new_path === filePath || diff.old_path === filePath) {
                // Simple line code format - GitLab expects specific format
                const lineCode = `${diff.new_path}_0_${lineNumber}`
                return lineCode
            }
        }

        console.log('No matching file found in diffs')
        return null
    }

    private async getMergeRequestDetails(
        projectId: string,
        mrNumber: number,
        accessToken: string
    ): Promise<any> {
        const gitlabApiUrl =
            this.configService.get('GITLAB_API_URL') ||
            'https://gitlab.com/api/v4'

        const apiUrl = `${gitlabApiUrl}/projects/${projectId}/merge_requests/${mrNumber}`

        const response = await this.httpService.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        return response
    }

    private async getAccessTokenForProject(projectId: string): Promise<string> {
        const workspaceRecord = await this.dataService.workspaces.findOne({
            slug: projectId,
            provider: 'gitlab'
        })

        if (workspaceRecord?._id) {
            const userData = await this.dataService.users.findOne(
                { workspaces: workspaceRecord._id },
                'accessToken'
            )

            if (!userData?.accessToken) {
                throw new BadRequestException(
                    'No user found with access token for the provided GitLab project'
                )
            }
            return userData.accessToken
        } else {
            throw new BadRequestException(
                'No workspace found for the provided GitLab project'
            )
        }
    }

    private parseDiffHunks(diffContent: string): string[] {
        if (!diffContent) return []

        const hunks: string[] = []
        const hunkRegex = /@@[^@]*@@.*?(?=@@|$)/gs

        let match
        while ((match = hunkRegex.exec(diffContent)) !== null) {
            hunks.push(match[0])
        }

        return hunks
    }
}
