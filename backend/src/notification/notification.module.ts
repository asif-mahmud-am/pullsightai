import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { JwtInvitationGuard } from './guards/jwt-invitation.guard'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: '7d' // Token expires in 7 days
                }
            })
        })
    ],
    controllers: [NotificationController],
    providers: [NotificationService, JwtInvitationGuard],
    exports: [NotificationService]
})
export class NotificationModule {}
