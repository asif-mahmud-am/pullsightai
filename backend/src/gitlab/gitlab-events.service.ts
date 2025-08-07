import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { PRFile, StructuredPRData } from 'src/common/interfaces/pr.interface'
import { DatabaseService } from 'src/database/database.service'
import { GitlabApiService } from './gitlab-api.service'
import { PostReviewDto } from './dto/post-review.dto'
import { PostSummeryDto } from './dto/post-summery.dto'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class GitlabEventsService {
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
    ): Promise<string | null> {
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
        accessToken?: string | null
    ): Promise<any[]> {
        try {
            if (!accessToken) {
                console.warn('No access token provided for GitLab API call')
                return []
            }

            const gitlabApiUrl =
                this.configService.get('GITLAB_API_URL') ||
                'https://gitlab.com/api/v4'

            const response = await firstValueFrom(
                this.httpService.get(
                    `${gitlabApiUrl}/projects/${projectId}/merge_requests/${mergeRequestIid}/changes`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                )
            )
            return response.data.changes || []
        } catch (error) {
            console.error('Error fetching GitLab MR files:', error)
            return []
        }
    }

    private async fetchFileContent(
        projectId: number,
        filePath: string,
        branch: string,
        accessToken?: string | null
    ): Promise<string | null> {
        try {
            if (!accessToken) {
                console.warn(
                    'No access token provided for GitLab file content API call'
                )
                return null
            }
            const gitlabApiUrl =
                this.configService.get('GITLAB_API_URL') ||
                'https://gitlab.com/api/v4'

            const response = await firstValueFrom(
                this.httpService.get(
                    `${gitlabApiUrl}/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}/raw`,
                    {
                        params: { ref: branch },
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                )
            )
            return response.data
        } catch (error) {
            console.error('Error fetching GitLab file content:', error)
            return null
        }
    }

    async addPRReviewComments(postReviewDto: PostReviewDto): Promise<any> {
        const accessToken = await this.getAccessTokenForProject(
            postReviewDto.projectId
        )

        const actualProjectId = encodeURIComponent(postReviewDto.projectId)

        // Get merge request details to obtain SHA values
        const mrDetails = await this.getMergeRequestDetails(
            actualProjectId,
            postReviewDto.prNumber,
            accessToken
        )

        // Get merge request diffs to find line codes
        const diffs = await this.getMergeRequestDiffs(
            actualProjectId,
            postReviewDto.prNumber,
            accessToken
        )

        const gitlabApiUrl =
            this.configService.get('GITLAB_API_URL') ||
            'https://gitlab.com/api/v4'

        const results: any[] = []
        for (const comment of postReviewDto.comments) {
            // Find the line_code for the specific file and line
            const lineCode = this.findLineCode(diffs, comment.path, comment.position)
            console.log('lineCode',lineCode)
            if (!lineCode) {
                console.warn(`Could not find line_code for ${comment.path}:${comment.position}`)
                // Fallback to general note if line_code not found
                const fallbackData = {
                    body: `**📁 File:** \`${comment.path}\` **📍 Line:** ${comment.position}\n\n${comment.body}`
                }
                const fallbackUrl = `${gitlabApiUrl}/projects/${actualProjectId}/merge_requests/${postReviewDto.prNumber}/notes`
                const fallbackResponse = await firstValueFrom(
                    this.httpService.post(fallbackUrl, fallbackData, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    })
                )
                results.push(fallbackResponse.data)
                continue
            }

            const commentData = {
                body: comment.body,
                position: {
                    position_type: 'text',
                    base_sha: mrDetails.diff_refs.base_sha,
                    start_sha: mrDetails.diff_refs.start_sha,
                    head_sha: mrDetails.diff_refs.head_sha,
                    new_path: comment.path,
                    old_path: comment.path,
                    new_line: comment.position,
                    old_line: null // For new lines, old_line can be null
                }
            }
            const apiUrl = `${gitlabApiUrl}/projects/${actualProjectId}/merge_requests/${postReviewDto.prNumber}/discussions`
            const response = await firstValueFrom(
                this.httpService.post(apiUrl, commentData, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            )
            results.push(response.data)
            console.log('Successfully posted inline comment')
        }
        return results
    }

    async addPRSummery(postSummeryDto: PostSummeryDto): Promise<any> {
        const accessToken = await this.getAccessTokenForProject(
            postSummeryDto.projectId
        )

        const actualProjectId = encodeURIComponent(postSummeryDto.projectId)

        const gitlabApiUrl =
            this.configService.get('GITLAB_API_URL') ||
            'https://gitlab.com/api/v4'

        const commentData = {
            body: postSummeryDto.body
        }

        const apiUrl = `${gitlabApiUrl}/projects/${actualProjectId}/merge_requests/${postSummeryDto.prNumber}/notes`

        const response = await firstValueFrom(
            this.httpService.post(apiUrl, commentData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            })
        )
        return response.data
    }

    private async getMergeRequestDiffs(projectId: string, mrNumber: number, accessToken: string): Promise<any[]> {
        const gitlabApiUrl =
            this.configService.get('GITLAB_API_URL') ||
            'https://gitlab.com/api/v4'

        const apiUrl = `${gitlabApiUrl}/projects/${projectId}/merge_requests/${mrNumber}/diffs`

        const response = await firstValueFrom(
            this.httpService.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            })
        )

        console.log('Merge Request Diffs fetched:', response.data.length, 'files')
        return response.data
    }

    private findLineCode(diffs: any[], filePath: string, lineNumber: number): string | null {
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

    private async getMergeRequestDetails(projectId: string, mrNumber: number, accessToken: string): Promise<any> {
            const gitlabApiUrl =
                this.configService.get('GITLAB_API_URL') ||
                'https://gitlab.com/api/v4'

            const apiUrl = `${gitlabApiUrl}/projects/${projectId}/merge_requests/${mrNumber}`

            const response = await firstValueFrom(
                this.httpService.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            )

            return response.data
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
