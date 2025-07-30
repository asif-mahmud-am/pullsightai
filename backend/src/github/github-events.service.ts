import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import * as fs from 'fs'
import * as path from 'path'
import { PRFile, StructuredPRData } from 'src/common/interfaces/pr.interface'
import { PostReviewDto } from 'src/github/dto/post-review.dto'
import { PostSummeryDto } from 'src/github/dto/post-summery.dto'

@Injectable()
export class GithubEventService {
    private octokit: Octokit
    private privateKey: string

    constructor(private readonly configService: ConfigService) {
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
                pr_file_name: file.filename,
                pr_file_status: file.status,
                pr_file_additions: file.additions,
                pr_file_deletions: file.deletions,
                pr_file_changes: file.changes,
                pr_file_content_before:
                    contentBefore || 'File not found in base branch',
                pr_file_content_after:
                    contentAfter || 'File not found in head branch',
                pr_file_diff: file.patch || 'No diff available',
                pr_file_blob_url: file.blob_url
            })
        }

        // Create the comprehensive structure
        const comprehensiveAnalysis: StructuredPRData = {
            pull_request: {
                pr_id: prData.id.toString(),
                pr_user: prData.user.login,
                owner: owner,
                repo: repo,
                prNumber: prNumber.toString(),
                installationId: installationId?.toString() || 'not_provided',
                pr_repo_name: `${owner}/${repo}`,
                pr_number: prNumber,
                pr_title: prData.title,
                pr_body: prData.body || '',
                pr_state: prData.state,
                pr_created_at: prData.created_at,
                pr_updated_at: prData.updated_at,
                pr_head_branch: prData.head.ref,
                pr_base_branch: prData.base.ref,
                pr_head_sha: prData.head.sha,
                pr_base_sha: prData.base.sha,
                pr_files_changed: files.length,
                pr_files: prFiles
            }
        }
        return comprehensiveAnalysis
    }

    // Add review comments to specific lines in PR files
    async addPRReviewComments(postReviewDto: PostReviewDto) {
        const octokit = await this.initOctokitApp(postReviewDto.installationId)

        // Create a review with multiple line comments
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
