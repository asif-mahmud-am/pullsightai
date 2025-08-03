import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { PRFile, StructuredPRData } from 'src/common/interfaces/pr.interface'
import { DatabaseService } from 'src/database/database.service'
import { GitlabApiService } from './gitlab-api.service'

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

        // Try to get access token from database based on project namespace
        const namespace =
            project.namespace || project.path_with_namespace?.split('/')[0]
        const accessToken = await this.getAccessTokenForNamespace(namespace)
        // Get merge request files using GitLab API
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
                pr_file_name: file.new_path,
                pr_file_status: file.new_file
                    ? 'added'
                    : file.deleted_file
                      ? 'removed'
                      : 'modified',
                pr_file_additions: 0, // GitLab doesn't provide this in webhook
                pr_file_deletions: 0, // GitLab doesn't provide this in webhook
                pr_file_changes: 0, // GitLab doesn't provide this in webhook
                pr_file_content_before:
                    contentBefore || 'File not found in target branch',
                pr_file_content_after:
                    contentAfter || 'File not found in source branch',
                pr_file_diff: file.diff || 'No diff available',
                pr_file_blob_url: `${project.web_url}/-/blob/${mergeRequest.source_branch}/${file.new_path}`
            })
        }

        // Create the comprehensive structure matching GitHub format
        const comprehensiveAnalysis: StructuredPRData = {
            pull_request: {
                pr_id: mergeRequest.id.toString(),
                pr_user:
                    mergeRequest.author?.username ||
                    payload.user?.username ||
                    'unknown',
                owner: project.namespace,
                repo: project.name,
                prNumber: mergeRequest.iid.toString(),
                installationId: 'gitlab_integration', // GitLab doesn't have installation concept
                pr_repo_name: project.path_with_namespace,
                pr_number: mergeRequest.iid,
                pr_title: mergeRequest.title,
                pr_body: mergeRequest.description || '',
                pr_state: mergeRequest.state,
                pr_created_at: mergeRequest.created_at,
                pr_updated_at: mergeRequest.updated_at,
                pr_head_branch: mergeRequest.source_branch,
                pr_base_branch: mergeRequest.target_branch,
                pr_head_sha: mergeRequest.last_commit?.id || 'unknown',
                pr_base_sha: 'unknown', // Not provided in webhook
                pr_files_changed: files.length,
                pr_files: prFiles
            }
        }

        return comprehensiveAnalysis
    }

    private async getAccessTokenForNamespace(
        namespace: string
    ): Promise<string | null> {
        try {
            // Try to find a workspace record first
            const workspaceRecord = await this.dataService.workspaces.findOne({
                name: namespace,
                provider: 'gitlab'
            })

            if (workspaceRecord?._id) {
                // Find a user who has this workspace in their workspaces array
                const userData = await this.dataService.users.findOne(
                    { workspaces: workspaceRecord._id },
                    'accessToken refreshToken tokenExpiresAt'
                )

                if (!userData?.accessToken) {
                    console.warn(
                        'No access token found for user with namespace:',
                        namespace
                    )
                    return null
                }

                // Check if access token is expired or will expire soon (within 5 minutes)
                const now = new Date()
                const expiryBuffer = 5 * 60 * 1000 // 5 minutes in milliseconds
                const isTokenExpired =
                    userData.tokenExpiresAt &&
                    new Date(userData.tokenExpiresAt).getTime() <
                        now.getTime() + expiryBuffer

                if (isTokenExpired && userData.refreshToken) {
                    console.log(
                        'Access token expired, attempting to refresh...'
                    )
                    const newTokens =
                        await this.gitlabApiService.refreshAccessToken(
                            userData.refreshToken
                        )

                    if (newTokens) {
                        // Calculate expiration using expires_in from response or default
                        const tokenExpiresAt = new Date(
                            Date.now() + (newTokens.expires_in || 7200) * 1000
                        )

                        // Update user with new tokens
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
                        console.error('Failed to refresh access token')
                        return null
                    }
                }

                return userData.accessToken
            }

            return null
        } catch (error) {
            console.error('Error getting access token for namespace:', error)
            return null
        }
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
}
