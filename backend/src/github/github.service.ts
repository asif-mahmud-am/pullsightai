import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import * as fs from 'fs'
import * as path from 'path'
import { DatabaseService } from 'src/database/database.service'
import { Workspace } from 'src/database/schemas/workspace.schema'

export interface Organization {
    name: string
    id: number
    nodeId: string
    url: string
    reposUrl: string
    avatarUrl: string
    createdAt: string
    updatedAt: string
    type: string
}

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
@Injectable()
export class GithubService {
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

    async getUserOrganizations(user: any): Promise<Workspace[]> {
        await this.initOctokit(user)
        const userRepoData = await this.octokit.rest.users.getAuthenticated()
        const response = await this.octokit.rest.orgs.listForAuthenticatedUser()
        console.log('User Repo Data:', response.data)
        const organizations: Workspace[] = []
        organizations.push({
            name: userRepoData.data.login,
            id: userRepoData.data.id.toString(),
            nodeId: userRepoData.data.node_id,
            url: userRepoData.data.url,
            reposUrl: userRepoData.data.repos_url,
            avatarUrl: userRepoData.data.avatar_url,
            type: userRepoData.data.type
        })
        for (const org of response.data) {
            const details = await this.octokit.rest.orgs.get({
                org: org.login
            })
            organizations.push({
                id: details.data.id.toString(),
                name: details.data.login,
                nodeId: details.data.node_id,
                url: details.data.url,
                reposUrl: details.data.repos_url,
                avatarUrl: details.data.avatar_url,
                type: details.data.type
            })
        }
        return organizations
    }

    async initOctokit(user: any) {
        const userData = await this.dataService.users.findOne(
            { _id: user.sub },
            'accessToken'
        )
        if (!userData || !userData.accessToken) {
            throw new Error('User not found or access token missing')
        }
        this.octokit = new Octokit({
            auth: userData.accessToken
        })
        return this.octokit
    }

    async getInstallationAccessToken(installationId: number): Promise<string> {
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
        return installationAuth.token
    }

    async listInstallationRepositories(installationId: number) {
        const token = await this.getInstallationAccessToken(installationId)
        const octokit = new Octokit({ auth: token })

        const { data } =
            await octokit.rest.apps.listReposAccessibleToInstallation()
        if (data.repositories.length === 1) {
            const org = data.repositories[0].owner
            await this.dataService.workspaces.create({
                id: org.id.toString(),
                name: org.login,
                nodeId: org.node_id,
                url: org.url,
                reposUrl: org.repos_url,
                avatarUrl: org.avatar_url,
                type: org.type
            })
        }
        return data.repositories[0].owner.login
    }

    async listOrgRepositories(name: string, installationId: number) {
        const token = await this.getInstallationAccessToken(installationId)
        const octokit = new Octokit({ auth: token })

        const { data } = await octokit.rest.repos.listForOrg({
            org: name,
            type: 'all'
        })

        const repositories: Repository[] = data.map(
            (repo) =>
                ({
                    id: repo.id,
                    nodeId: repo.node_id,
                    name: repo.name,
                    fullName: repo.full_name,
                    private: repo.private,
                    author: {
                        name: repo.owner.login,
                        avatarUrl: repo.owner.avatar_url
                    },
                    pushedAt: repo.pushed_at,
                    openIssues: repo.open_issues_count
                }) as Repository
        )
        return repositories
    }
}
