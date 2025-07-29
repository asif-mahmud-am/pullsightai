import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import * as fs from 'fs'
import * as path from 'path'
import { PRFile, StructuredPRData } from 'src/common/interfaces/pr.interface'
import { DatabaseService } from 'src/database/database.service'

@Injectable()
export class GithubEventService {
    private octokit: Octokit
    private privateKey: string

    constructor(
        private readonly dataService: DatabaseService,
        private readonly configService: ConfigService
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

    // GitHub Pull Request Events
    async handleGitHubPullRequest(payload) {
        const { action, pull_request, repository, installation } = payload

        if (['opened', 'synchronize', 'edited'].includes(action)) {
            return await this.analyzeGitHubPullRequestChanges(
                pull_request,
                repository,
                installation?.id
            )
        } else {
            return false
        }

        switch (action) {
            case 'opened':
                await this.handleGitHubPRComment(
                    'created',
                    pull_request,
                    repository,
                    installation?.id
                )
                break
            case 'synchronize':
            case 'edited':
                await this.handleGitHubPRComment(
                    'updated',
                    pull_request,
                    repository,
                    installation?.id
                )
                break
            case 'closed':
                if (pull_request.merged) {
                    await this.handleGitHubPRComment(
                        'merged',
                        pull_request,
                        repository,
                        installation?.id
                    )
                } else {
                    await this.handleGitHubPRComment(
                        'closed',
                        pull_request,
                        repository,
                        installation?.id
                    )
                }
                break
            case 'reopened':
                await this.handleGitHubPRComment(
                    'reopened',
                    pull_request,
                    repository,
                    installation?.id
                )
                break
            default:
                console.log(`ℹ️  Unhandled GitHub PR action: ${action}`)
        }
    }

    // Handle GitHub PR comments
    async handleGitHubPRComment(
        action,
        pull_request,
        repository,
        installationId
    ) {
        try {
            const octokit = await this.initOctokitApp(installationId)

            try {
                console.log(
                    `💬 Adding ${action} comment to GitHub PR #${pull_request.number}...`
                )

                // Generate comment based on action
                const comment = await this.generateGitHubPRComment(
                    action,
                    pull_request,
                    repository
                )

                // Add comment to GitHub PR (works with both real and mock client)
                const result = await octokit.issues.createComment({
                    owner: repository.owner.login,
                    repo: repository.name,
                    issue_number: pull_request.number,
                    body: comment
                })

                if (result) {
                    console.log(
                        `✅ GitHub PR comment added successfully: ${result.data.html_url}`
                    )

                    // Show enhanced file change details for GitHub PRs
                    console.log('\n📁 Enhanced File Change Analysis:')
                    console.log('='.repeat(60))
                    console.log(
                        `🔍 PR #${pull_request.number}: ${pull_request.title}`
                    )
                    console.log(
                        `📊 Changes: ${pull_request.head.ref} → ${pull_request.base.ref}`
                    )
                    console.log(`👤 Author: ${pull_request.user.login}`)
                    console.log(
                        `🗓️  Created: ${new Date(pull_request.created_at).toLocaleString()}`
                    )
                    console.log(`🔗 URL: ${pull_request.html_url}`)

                    if (pull_request.body) {
                        console.log(
                            `📝 Description: ${pull_request.body.substring(0, 200)}...`
                        )
                    }

                    // Show what detailed analysis would include
                    console.log('\n🔬 Detailed Analysis Available:')
                    console.log('• File-by-file change breakdown')
                    console.log('• Line-by-line diff analysis')
                    console.log('• Commit history and messages')
                    console.log('• Code pattern analysis')
                    console.log('• Impact assessment')
                    console.log('='.repeat(60))

                    return result.data
                }
            } catch (error) {
                console.error('❌ Error adding GitHub PR comment:', error)
                return false
            }
        } catch (error) {
            console.error('❌ Error in handleGitHubPRComment:', error)
            return false
        }
    }

    // Analyze GitHub Pull Request changes
    async analyzeGitHubPullRequestChanges(
        pull_request,
        repository,
        installationId
    ) {
        const reviewResult = await this.addFileBasedReviewComments(
            repository.owner.login,
            repository.name,
            pull_request.number,
            installationId
        )

        const comprehensiveAnalysis = await this.createComprehensivePRAnalysis(
            repository.owner.login,
            repository.name,
            pull_request.number,
            installationId
        )
        return comprehensiveAnalysis
    }

    // Add one review comment per file instead of line-by-line comments
    async addFileBasedReviewComments(owner, repo, prNumber, installationId) {
        console.log(
            `\n🔍 Starting file-based automated review for PR #${prNumber} in ${owner}/${repo}...`
        )

        // First, fetch the PR files to get patch data
        const files = await this.fetchPRFiles(
            owner,
            repo,
            prNumber,
            installationId
        )
        if (!files || files.length === 0) {
            console.log('❌ No files found to review')
            return null
        }

        const reviewComments: any = []

        // Process each changed file and create one comment per file
        files.forEach((file: any, fileIndex) => {
            console.log(
                `\n📄 Processing file ${fileIndex + 1}: ${file.filename}`
            )

            if (!file.patch) {
                console.log(
                    `   ⚠️  No patch data available for ${file.filename}`
                )
                return
            }

            // Parse the patch to get summary information
            const commentPositions = this.parsePatchForLineNumbers(
                file.patch,
                file.filename
            )

            // Get first addition line position for commenting (GitHub requires a position)
            const firstAddition = commentPositions.find(
                (pos) => pos.type === 'addition'
            )

            if (!firstAddition) {
                console.log(
                    `   ⚠️  No addition lines found in ${file.filename} to comment on`
                )
                return
            }

            // Create a comprehensive file-level comment
            const addedLines = commentPositions.filter(
                (pos) => pos.type === 'addition'
            ).length
            const fileExtension = file.filename.split('.').pop().toLowerCase()

            let fileTypeEmoji = '📄'
            if (['js', 'ts', 'jsx', 'tsx'].includes(fileExtension))
                fileTypeEmoji = '🟨'
            else if (['py'].includes(fileExtension)) fileTypeEmoji = '🐍'
            else if (['java'].includes(fileExtension)) fileTypeEmoji = '☕'
            else if (['css', 'scss', 'sass'].includes(fileExtension))
                fileTypeEmoji = '🎨'
            else if (['html', 'htm'].includes(fileExtension))
                fileTypeEmoji = '🌐'
            else if (['json'].includes(fileExtension)) fileTypeEmoji = '📋'
            else if (['md', 'markdown'].includes(fileExtension))
                fileTypeEmoji = '📝'

            const commentBody =
                `${fileTypeEmoji} **File Review: \`${file.filename}\`**\n\n` +
                '🔍 **I will review this file** - Automated analysis by Pullsight-AI\n\n' +
                '📊 **File Statistics:**\n' +
                `- **Status**: ${file.status}\n` +
                `- **Changes**: +${file.additions} -${file.deletions}\n` +
                `- **Lines Modified**: ${addedLines} additions\n\n` +
                '🎯 **Review Focus:**\n' +
                '- Code quality and standards compliance\n' +
                '- Potential bugs or security issues\n' +
                '- Performance implications\n' +
                '- Documentation and readability\n\n' +
                '⚡ **Next Steps:**\n' +
                'This file has been flagged for detailed review. Please ensure all changes follow project standards and best practices.'

            reviewComments.push({
                path: file.filename,
                position: firstAddition.position,
                body: commentBody
            })

            console.log(
                `   💬 Added file review comment for ${file.filename} (+${file.additions} -${file.deletions})`
            )
        })

        if (reviewComments.length === 0) {
            console.log('⚠️  No files found to comment on')
            return null
        }

        console.log(
            `\n📝 Creating review with ${reviewComments.length} file-based comments...`
        )

        // Create the review with all file comments
        const review = await this.addPRReviewComments(
            owner,
            repo,
            prNumber,
            reviewComments,
            installationId
        )

        return review
    }

    // Fetch PR files and changes
    async fetchPRFiles(owner, repo, prNumber, installationId) {
        const octokit = await this.initOctokitApp(installationId)
        console.log(
            `🔍 Fetching files for PR #${prNumber} in ${owner}/${repo}...`
        )

        const { data: files } = await octokit.pulls.listFiles({
            owner,
            repo,
            pull_number: prNumber
        })

        console.log(`📁 Found ${files.length} changed files:`)

        files.forEach((file, index) => {
            console.log(`\n📄 File ${index + 1}: ${file.filename}`)
            console.log(`   Status: ${file.status}`)
            console.log(`   Changes: +${file.additions} -${file.deletions}`)
            console.log(`   Blob URL: ${file.blob_url}`)

            if (file.patch) {
                console.log(`\n🔧 Patch for ${file.filename}:`)
                console.log('─'.repeat(50))
                console.log(file.patch)
                console.log('─'.repeat(50))
            }
        })

        return files
    }

    // Fetch PR diff
    async fetchPRDiff(owner, repo, prNumber, installationId) {
        const octokit = await this.initOctokitApp(installationId)

        if (!octokit) {
            console.log(
                '⚠️  GitHub client not available. Cannot fetch PR diff.'
            )
            return null
        }

        try {
            console.log(
                `🔍 Fetching diff for PR #${prNumber} in ${owner}/${repo}...`
            )

            const { data: diff } = await octokit.pulls.get({
                owner,
                repo,
                pull_number: prNumber,
                mediaType: {
                    format: 'diff'
                }
            })

            console.log(`\n📋 Full Diff for PR #${prNumber}:`)
            console.log('='.repeat(80))
            console.log(diff)
            console.log('='.repeat(80))

            return diff
        } catch (error) {
            console.error('❌ Error fetching PR diff:', error)
            return null
        }
    }

    // Fetch PR commits
    async fetchPRCommits(owner, repo, prNumber, installationId) {
        const octokit = await this.initOctokitApp(installationId)

        try {
            console.log(
                `🔍 Fetching commits for PR #${prNumber} in ${owner}/${repo}...`
            )

            const { data: commits } = await octokit.pulls.listCommits({
                owner,
                repo,
                pull_number: prNumber
            })

            console.log(`\n📦 Found ${commits.length} commits:`)

            commits.forEach((commit: any, index) => {
                console.log(`\n🔸 Commit ${index + 1}:`)
                console.log(`   SHA: ${commit.sha}`)
                console.log(
                    `   Author: ${commit.commit.author.name} <${commit.commit.author.email}>`
                )
                console.log(`   Date: ${commit.commit.author.date}`)
                console.log(`   Message: ${commit.commit.message}`)
                console.log(`   URL: ${commit.html_url}`)
            })

            return commits
        } catch (error) {
            console.error('❌ Error fetching PR commits:', error)
            return null
        }
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

    // Parse patch data to find line numbers for comments
    parsePatchForLineNumbers(patch, filename) {
        if (!patch) return []
        const lines = patch.split('\n')
        const commentPositions: any = []
        let currentLine = 0
        let inHunk = false

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            // Parse hunk header (e.g., @@ -13,7 +13,7 @@)
            if (line.startsWith('@@')) {
                const match = line.match(/@@ -\d+,?\d* \+(\d+),?\d* @@/)
                if (match) {
                    currentLine = parseInt(match[1]) - 1 // GitHub uses 0-based line numbers for comments
                    inHunk = true
                }
                continue
            }

            if (!inHunk) continue

            // Track line changes
            if (line.startsWith('+') && !line.startsWith('+++')) {
                // This is an added line - we can comment on it
                commentPositions.push({
                    filename: filename,
                    line: currentLine + 1, // Convert back to 1-based for display
                    position: i, // Position in the patch for GitHub API
                    type: 'addition',
                    content: line.substring(1) // Remove the '+' prefix
                })
                currentLine++
            } else if (line.startsWith('-') && !line.startsWith('---')) {
                // This is a deleted line - we can't comment on deleted lines directly
                // But we can note it for context
            } else if (line.startsWith(' ')) {
                // Unchanged line
                currentLine++
            }
        }

        return commentPositions
    }

    // Add review comments to specific lines in PR files
    async addPRReviewComments(
        owner,
        repo,
        prNumber,
        comments: any[],
        installationId
    ) {
        const octokit = await this.initOctokitApp(installationId)

        // Create a review with multiple line comments
        const reviewData: any = {
            owner,
            repo,
            pull_number: prNumber,
            body: '🤖 **Automated Code Review by Pullsight-AI**',
            event: 'COMMENT',
            comments: comments
        }

        const { data: review } = await octokit.pulls.createReview(reviewData)
        return review
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

    // Generate GitHub PR comment
    async generateGitHubPRComment(action, pull_request, repository) {
        const { user, title, number, created_at, updated_at } = pull_request
        const authorName = user.login || 'Unknown'

        switch (action) {
            case 'created':
                return `## 🎉 Welcome to Pullsight-AI!

Hello @${authorName}! 👋

Thank you for submitting **PR #${number}: ${title}**.

**Pullsight-AI** has received your pull request and will begin the review process. Here's what happens next:

### 📋 Review Process
- ✅ **Received** - Your PR has been successfully received
- 🔍 **Analysis** - Code changes are being analyzed  
- 📊 **Assessment** - Quality and impact evaluation in progress
- 💬 **Feedback** - Detailed review comments will be provided

### 📊 PR Information
- **Repository**: ${repository.full_name}
- **Source Branch**: \`${pull_request.head.ref}\`
- **Target Branch**: \`${pull_request.base.ref}\`
- **Created**: ${new Date(created_at).toLocaleString()}

### 🚀 Next Steps
1. **Automated Analysis** will scan your code changes
2. **Quality Assessment** will evaluate code patterns and best practices  
3. **Detailed Feedback** will be provided as review comments
4. **Suggestions** for improvements will be highlighted

Stay tuned for detailed feedback! 🤖

---
*🔍 Powered by Pullsight-AI | Automated Code Review Assistant*`

            case 'updated':
                return `## 🔄 PR Updated - Re-analyzing Changes

Hello @${authorName}! 👋

Your pull request **#${number}: ${title}** has been updated.

### 📊 Update Information  
- **Last Updated**: ${new Date(updated_at).toLocaleString()}
- **Source Branch**: \`${pull_request.head.ref}\`
- **Target Branch**: \`${pull_request.base.ref}\`

### 🔍 What's Happening
- **Re-analysis** of updated code changes in progress
- **New changes** will be evaluated for quality and impact
- **Updated feedback** will be provided shortly

**Pullsight-AI** is re-evaluating your changes to provide the most current and relevant feedback.

---
*🔄 Powered by Pullsight-AI | Automated Code Review Assistant*`

            case 'merged':
                return `## ✅ Congratulations! PR Merged Successfully

Hello @${authorName}! 🎉

Your pull request **#${number}: ${title}** has been successfully merged!

### 🎊 Merge Summary
- **Merged At**: ${new Date().toLocaleString()}
- **Source Branch**: \`${pull_request.head.ref}\` → \`${pull_request.base.ref}\`
- **Repository**: ${repository.full_name}

### 🚀 Impact
Your code changes are now part of the main codebase and will benefit the entire project. Great work!

Thank you for your contribution to **${repository.full_name}**! 🙏

---
*✅ Powered by Pullsight-AI | Automated Code Review Assistant*`

            case 'closed':
                return `## 🔒 PR Closed

Hello @${authorName},

Your pull request **#${number}: ${title}** has been closed.

### 📊 Summary
- **Closed At**: ${new Date().toLocaleString()}
- **Source Branch**: \`${pull_request.head.ref}\`
- **Target Branch**: \`${pull_request.base.ref}\`

If you'd like to continue working on these changes, you can always reopen this PR or create a new one.

Thank you for your contribution! 🙏

---
*🔒 Powered by Pullsight-AI | Automated Code Review Assistant*`

            case 'reopened':
                return `## 🔄 PR Reopened - Welcome Back!

Hello @${authorName}! 👋

Your pull request **#${number}: ${title}** has been reopened.

### 🔍 What's Next
- **Fresh Analysis** will be performed on your code changes
- **Updated Review** will be provided based on current standards
- **New Feedback** will address any recent changes

**Pullsight-AI** will re-evaluate your changes and provide updated feedback shortly.

---
*🔄 Powered by Pullsight-AI | Automated Code Review Assistant*`

            default:
                return `## 📋 PR ${action.charAt(0).toUpperCase() + action.slice(1)}

Hello @${authorName}! 👋

Your pull request **#${number}: ${title}** has been ${action}.

**Pullsight-AI** is monitoring this PR for any updates.

---
*🤖 Powered by Pullsight-AI | Automated Code Review Assistant*`
        }
    }

    // Comprehensive PR analysis
    // async analyzePRComprehensive(owner, repo, prNumber, installationId) {
    //     console.log(
    //         `\n🎯 Starting comprehensive analysis for PR #${prNumber} in ${owner}/${repo}...`
    //     )

    //     const [files, diff, commits] = await Promise.all([
    //         this.fetchPRFiles(owner, repo, prNumber, installationId),
    //         this.fetchPRDiff(owner, repo, prNumber, installationId),
    //         this.fetchPRCommits(owner, repo, prNumber, installationId)
    //     ])

    //     return {
    //         files,
    //         diff,
    //         commits,
    //         summary: {
    //             totalFiles: files?.length || 0,
    //             totalCommits: commits?.length || 0,
    //             hasDiff: !!diff
    //         }
    //     }
    // }
}
