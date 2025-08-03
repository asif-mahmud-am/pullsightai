import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UpdateOnboardingStepDto } from 'src/auth/dto/update-onboarding-step.dto'
import { DatabaseService } from 'src/database/database.service'

@Injectable()
export class AuthService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly jwtService: JwtService
    ) {}

    async findOrCreateUser(
        profile: any,
        provider: string,
        accessToken: string,
        refreshToken: string
    ) {
        let user = await this.dataService.users.findOne({
            provider,
            providerId: profile.id
        })

        // Use provider-specific default expiry times since tokens are not JWTs
        const defaultExpiry = {
            gitlab: 7200, // 2 hours
            bitbucket: 3600, // 1 hour
            github: 28800 // 8 hours (GitHub App tokens)
        }
        const expiry = defaultExpiry[provider] || 7200 // Default to 2 hours
        const tokenExpiresAt = new Date(Date.now() + expiry * 1000)
        if (!user) {
            user = await this.dataService.users.create({
                provider,
                providerId: profile.id,
                username: profile.username,
                displayName: profile.displayName,
                email: profile.emails?.[0]?.value,
                avatarUrl: profile.photos?.[0]?.value,
                accessToken,
                refreshToken,
                tokenExpiresAt,
                raw: profile._raw
            })
        } else {
            user.accessToken = accessToken
            user.refreshToken = refreshToken
            user.tokenExpiresAt = tokenExpiresAt
            await user.save()
        }
        return user
    }

    generateJwt(user: any) {
        const payload = {
            sub: user._id,
            email: user.email,
            provider: user.provider
        }
        return this.jwtService.sign(payload, { expiresIn: '7d' })
    }

    async getProfile(user: any) {
        return await this.dataService.users
            .findOne(
                {
                    _id: user.sub
                },
                'providerId provider username displayName email avatarUrl onboardingStep'
            )
            .populate('currentWorkspace')
    }

    async updateProfile(user: any, updateProfileDto: UpdateOnboardingStepDto) {
        return await this.dataService.users.findByIdAndUpdate(
            {
                _id: user.sub
            },
            { ...updateProfileDto },
            { new: true, fields: 'onboardingStep currentWorkspace' }
        )
    }
}
