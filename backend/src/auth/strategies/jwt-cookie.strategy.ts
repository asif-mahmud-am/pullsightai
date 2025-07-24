// jwt-cookie.strategy.ts
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy } from 'passport-jwt'

const cookieExtractor = (req: Request): string | null => {
    return req.cookies?.accessToken || null
}

@Injectable()
export class JwtCookieStrategy extends PassportStrategy(
    Strategy,
    'jwt-cookie'
) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: cookieExtractor,
            secretOrKey: configService.get('JWT_SECRET')
        })
    }

    async validate(payload: any) {
        return payload
    }
}
