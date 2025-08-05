import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import * as fs from 'fs'
import * as path from 'path'
import { PRFile, StructuredPRData } from 'src/common/interfaces/pr.interface'
import { DatabaseService } from 'src/database/database.service'
import { PostReviewDto } from 'src/github/dto/post-review.dto'
import { PostSummeryDto } from 'src/github/dto/post-summery.dto'

@Injectable()
export class GithubEventService {
    private octokit: Octokit
    private privateKey: string

    constructor(
        private readonly configService: ConfigService,
        private readonly dataService: DatabaseService
    ) {
        const pemPath = path.resolve(
            this.configService.get<string>('GITHUB_PRIVATE_KEY_PATH') || ''
        )
        this.privateKey = fs.readFileSync(pemPath, 'utf8')
    }

    async initOctokitApp(installationId: number) {
        const auth = createAppAuth({
            appId: Number(this.configService.get<string>('GITHUB_APP_ID')),
            privateKey: this.privateKey,
            clientId: this.configService.get<string>('GITHUB_CLIENT_ID'),
            clientSecret: this.configService.get<string>('GITHUB_CLIENT_SECRET')
        })
        const installationAuth = await auth({
            type: 'installation',
            installationId
        })
        return new Octokit({ auth: installationAuth.token })
    }

    async appAuthenticationJWT() {
        const auth = createAppAuth({
            appId: Number(this.configService.get<string>('GITHUB_APP_ID')),
            privateKey: this.privateKey,
            clientId: this.configService.get<string>('GITHUB_CLIENT_ID'),
            clientSecret: this.configService.get<string>('GITHUB_CLIENT_SECRET')
        })
        const { token } = await auth({ type: 'app' })
        return new Octokit({ auth: token })
    }

    // GitHub Pull Request Events
    async handleGitHubPullRequest(payload) {
        const { action, pull_request, repository, installation } = payload
        if (['opened', 'synchronize', 'edited'].includes(action)) {
            return await this.createComprehensivePRAnalysis(
                repository.owner.login,
                repository.name,
                pull_request.number,
                installation?.id
            )
        } else {
            return false
        }
    }

    async removeInstallationIdFromWorkspace(installationId: number) {
        return this.dataService.workspaces.updateOne(
            { installationId },
            { $set: { installationId: null } }
        )
    }

    async handleGitHubInstallation(payload) {
        const { action, installation } = payload
        switch (action) {
            case 'deleted':
                return await this.removeInstallationIdFromWorkspace(
                    installation.id
                )
        }
    }

    async addPRSummery(postSummeryDto: PostSummeryDto) {
        const octokit = await this.initOctokitApp(postSummeryDto.installationId)
        await octokit.issues.createComment({
            owner: postSummeryDto.owner,
            repo: postSummeryDto.repo,
            issue_number: postSummeryDto.prNumber,
            body: postSummeryDto.body
        })
        return {}
    }

    // Fetch PR files and changes
    async fetchPRFiles(owner, repo, prNumber, installationId) {
        const octokit = await this.initOctokitApp(installationId)
        const { data: files } = await octokit.pulls.listFiles({
            owner,
            repo,
            pull_number: prNumber
        })
        return files
    }

    // Create comprehensive PR analysis with full file contents
    async createComprehensivePRAnalysis(
        owner: string,
        repo: string,
        prNumber: number,
        installationId: number
    ): Promise<StructuredPRData> {
        const octokit = await this.initOctokitApp(installationId)

        const { data: prData } = await octokit.pulls.get({
            owner,
            repo,
            pull_number: prNumber
        })

        // Get changed files
        const files = await this.fetchPRFiles(
            owner,
            repo,
            prNumber,
            installationId
        )

        const prFiles: PRFile[] = []

        // Process each file to get before/after content
        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            const contentBefore = await this.fetchFileContent(
                owner,
                repo,
                file.filename,
                prData.base.sha,
                installationId
            )

            // Get file content after PR (head branch)
            const contentAfter = await this.fetchFileContent(
                owner,
                repo,
                file.filename,
                prData.head.sha,
                installationId
            )

            prFiles.push({
                prFileName: file.filename,
                prFileStatus: file.status,
                prFileAdditions: file.additions,
                prFileDeletions: file.deletions,
                prFileChanges: file.changes,
                prFileContentBefore:
                    contentBefore || 'File not found in base branch',
                prFileContentAfter:
                    contentAfter || 'File not found in head branch',
                prFileDiff: file.patch || 'No diff available',
                prFileBlobUrl: file.blob_url
            })
        }

        // Create the comprehensive structure
        const comprehensiveAnalysis: StructuredPRData = {
            pullRequest: {
                prId: prData.id.toString(),
                prUser: prData.user.login,
                owner: owner,
                repo: repo,
                prNumber: prNumber.toString(),
                installationId: installationId?.toString() || 'not_provided',
                prRepoName: `${owner}/${repo}`,
                prTitle: prData.title,
                prBody: prData.body || '',
                prState: prData.state,
                prCreatedAt: prData.created_at,
                prUpdatedAt: prData.updated_at,
                prHeadBranch: prData.head.ref,
                prBaseBranch: prData.base.ref,
                prHeadSha: prData.head.sha,
                prBaseSha: prData.base.sha,
                prFilesChanged: files.length,
                prFiles: prFiles
            }
        }
        return comprehensiveAnalysis
    }

    // Add review comments to specific lines in PR files
    async addPRReviewComments(postReviewDto: PostReviewDto) {
        const octokit = await this.initOctokitApp(postReviewDto.installationId)
        const reviewData: any = {
            owner: postReviewDto.owner,
            repo: postReviewDto.repo,
            pull_number: postReviewDto.prNumber,
            body: '🤖 **Automated Code Review by Pullsight-AI**',
            event: 'COMMENT',
            comments: postReviewDto.comments
        }

        await octokit.pulls.createReview(reviewData)
        return {}
    }

    // Fetch full file content from GitHub repository
    async fetchFileContent(owner, repo, filePath, sha, installationId) {
        const octokit = await this.initOctokitApp(installationId)
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: filePath,
            ref: sha
        })

        // Decode base64 content
        if (data['content']) {
            return Buffer.from(data['content'], 'base64').toString('utf8')
        }
        return null
    }
}
