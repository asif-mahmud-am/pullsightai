import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtInvitationGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest()
        const token = request.query.token

        if (!token) {
            throw new UnauthorizedException('Token is required')
        }

        try {
            const decoded = this.jwtService.verify(token)
            request.user = decoded
            return true
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token')
        }
    }
}
