import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from 'src/common/http/http.service'
import { PRFile, StructuredPRData } from 'src/common/interfaces/pr.interface'
import { DatabaseService } from 'src/database/database.service'
import { BitbucketApiService } from './bitbucket-api.service'
import { PostReviewDto } from './dto/post-review.dto'
import { PostSummeryDto } from './dto/post-summery.dto'

@Injectable()
export class BitbucketEventsService {
    private readonly baseUrl = 'https://api.bitbucket.org/2.0'
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly dataService: DatabaseService,
        private readonly bitbucketApiService: BitbucketApiService
    ) {}

    async handleBitbucketPullRequest(payload: any): Promise<StructuredPRData> {
        const pullRequest = payload.pullrequest
        const repository = payload.repository

        if (!pullRequest || !repository) {
            throw new Error('Invalid Bitbucket pull request payload')
        }

        // Try to get access token from database based on repository owner
        const workspace =
            repository.workspace?.slug || repository.full_name?.split('/')[0]
        const accessToken = await this.getAccessTokenForWorkspace(workspace)

        // Get pull request files using Bitbucket API
        const files = await this.fetchPRFiles(
            workspace,
            repository.name,
            pullRequest.id,
            accessToken
        )

        const prFiles: PRFile[] = []

        const fullDiff = await this.bitbucketApiService.fetchPRDiff(
            workspace,
            repository.name,
            pullRequest.id,
            accessToken
        )
        // Process each file to get before/after content
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const contentBefore = await this.fetchFileContent(
                workspace,
                repository.name,
                file.old?.path || file.new?.path,
                pullRequest.destination?.branch?.name,
                accessToken
            )
            const contentAfter = await this.fetchFileContent(
                workspace,
                repository.name,
                file.new?.path || file.old?.path,
                pullRequest.source?.branch?.name,
                accessToken
            )

            prFiles.push({
                prFileName: file.new?.path || file.old?.path,
                prFileStatus: file.status,
                prFileAdditions: file.lines_added || 0,
                prFileDeletions: file.lines_removed || 0,
                prFileChanges:
                    (file.lines_added || 0) + (file.lines_removed || 0),
                prFileContentBefore:
                    contentBefore || 'File not found in destination branch',
                prFileContentAfter:
                    contentAfter || 'File not found in source branch',
                prFileDiff: this.bitbucketApiService.extractFileDiff(
                    fullDiff,
                    file.new?.path || file.old?.path
                ),
                prFileBlobUrl:
                    file.new?.links?.self?.href ||
                    file.old?.links?.self?.href ||
                    ''
            })
        }

        const comprehensiveAnalysis: StructuredPRData = {
            pullRequest: {
                provider: 'bitbucket',
                prId: pullRequest.id.toString(),
                prUser: pullRequest.author?.username || 'unknown',
                owner: repository.owner?.username || 'unknown',
                repo: repository.name,
                prNumber: pullRequest.id.toString(),
                installationId: 'bitbucket_integration', // Bitbucket doesn't have installation concept
                prRepoName: repository.full_name,
                prTitle: pullRequest.title,
                prBody: pullRequest.description || '',
                prState: pullRequest.state,
                prCreatedAt: pullRequest.created_on,
                prUpdatedAt: pullRequest.updated_on,
                prHeadBranch: pullRequest.source?.branch?.name || 'unknown',
                prBaseBranch:
                    pullRequest.destination?.branch?.name || 'unknown',
                prHeadSha: pullRequest.source?.commit?.hash || 'unknown',
                prBaseSha: pullRequest.destination?.commit?.hash || 'unknown',
                prFilesChanged: files.length,
                prFiles: prFiles
            }
        }
        return comprehensiveAnalysis
    }

    private async getAccessTokenForWorkspace(
        workspace: string
    ): Promise<string> {
        const workspaceRecord = await this.dataService.workspaces.findOne({
            slug: workspace,
            provider: 'bitbucket'
        })

        if (workspaceRecord?._id) {
            let userData = await this.dataService.users.findOne(
                { workspaces: workspaceRecord._id },
                'accessToken refreshToken tokenExpiresAt'
            )

            if (!userData?.accessToken) {
                throw new BadRequestException(
                    'No user found with access token for the provided Bitbucket workspace'
                )
            }

            const now = new Date()
            const expiryBuffer = 5 * 60 * 1000 // 5 minutes in milliseconds
            const isTokenExpired =
                userData.tokenExpiresAt &&
                new Date(userData.tokenExpiresAt).getTime() <
                    now.getTime() + expiryBuffer

            if (isTokenExpired && userData.refreshToken) {
                console.log('Access token expired, attempting to refresh...')
                const newTokens =
                    await this.bitbucketApiService.refreshAccessToken(
                        userData.refreshToken
                    )

                if (newTokens) {
                    const tokenExpiresAt = new Date(
                        Date.now() + (newTokens.expires_in || 3600) * 1000
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
                    throw new BadRequestException(
                        'Failed to refresh access token'
                    )
                }
            }

            return userData.accessToken
        } else {
            throw new BadRequestException(
                'No workspace found for the provided Bitbucket slug'
            )
        }
    }

    private async fetchPRFiles(
        workspace: string,
        repository: string,
        pullRequestId: number,
        accessToken?: string | null
    ): Promise<any[]> {
        try {
            if (!accessToken) {
                console.warn('No access token provided for Bitbucket API call')
                return []
            }

            const bitbucketApiUrl =
                this.configService.get('BITBUCKET_API_URL') ||
                'https://api.bitbucket.org/2.0'
            const apiUrl = `${bitbucketApiUrl}/repositories/${workspace}/${repository}/pullrequests/${pullRequestId}/diffstat`

            const response = await this.httpService.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json'
                }
            })

            return response.values || []
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            })
            return []
        }
    }

    private async fetchFileContent(
        workspace: string,
        repository: string,
        filePath: string,
        branch: string,
        accessToken?: string | null
    ): Promise<string | null> {
        try {
            if (!accessToken || !filePath) {
                console.warn(
                    'No access token or file path provided for Bitbucket file content API call'
                )
                return null
            }

            const bitbucketApiUrl =
                this.configService.get('BITBUCKET_API_URL') ||
                'https://api.bitbucket.org/2.0'

            // URL encode the branch name and file path to handle special characters like '/'
            const encodedBranch = encodeURIComponent(branch)
            const encodedFilePath = encodeURIComponent(filePath)

            const apiUrl = `${bitbucketApiUrl}/repositories/${workspace}/${repository}/src/${encodedBranch}/${encodedFilePath}`

            const response = await this.httpService.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error) {
            console.error('File content error details:', {
                workspace,
                repository,
                filePath,
                branch,
                message: error.message,
                status: error.response?.status
            })
            return null
        }
    }

    async addPRReviewComments(postReviewDto: PostReviewDto): Promise<any> {
        const accessToken = await this.getAccessTokenForWorkspace(
            postReviewDto.workspace
        )

        const bitbucketApiUrl = this.baseUrl
        const results: any[] = []
        for (const comment of postReviewDto.comments) {
            const commentData = {
                content: {
                    raw: comment.body
                },
                inline: {
                    to: comment.position,
                    path: comment.path
                }
            }

            const apiUrl = `${bitbucketApiUrl}/repositories/${postReviewDto.owner}/${postReviewDto.repo}/pullrequests/${postReviewDto.prNumber}/comments`

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

    async addPRSummery(postSummeryDto: PostSummeryDto): Promise<any> {
        const accessToken = await this.getAccessTokenForWorkspace(
            postSummeryDto.workspace
        )
        const commentData = {
            content: {
                raw: postSummeryDto.body
            }
        }

        const apiUrl = `${this.baseUrl}/repositories/${postSummeryDto.owner}/${postSummeryDto.repo}/pullrequests/${postSummeryDto.prNumber}/comments`

        const response = this.httpService.post(apiUrl, commentData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        return response
    }
}
