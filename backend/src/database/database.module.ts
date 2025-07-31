import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { DatabaseService } from 'src/database/database.service'
import { UserSchema } from 'src/database/schemas/user.schema'
import { WorkspaceSchema } from 'src/database/schemas/workspace.schema'

@Global()
@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get('MONGODB_URI')
            })
        }),
        MongooseModule.forFeature([
            { name: 'User', schema: UserSchema },
            { name: 'Workspace', schema: WorkspaceSchema }
        ])
    ],
    controllers: [],
    providers: [DatabaseService],
    exports: [DatabaseService]
})
export class DatabaseModule {}
