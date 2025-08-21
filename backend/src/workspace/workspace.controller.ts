import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { MakeSubscriptionDto } from 'src/workspace/dto/make-subscription.dto'
import { UpdateRepositoryDto } from 'src/workspace/dto/update-repository.dto'
import { WorkspaceService } from './workspace.service'

@Controller({
    path: 'workspace',
    version: '1'
})
export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) {}

    @UseGuards(AuthGuard('jwt-cookie'))
    @Post('subscription')
    async makeSubscription(
        @Body() makeSubscriptionDto: MakeSubscriptionDto,
        @Req() req: any
    ) {
        return {
            message: 'Subscription created successfully',
            result: await this.workspaceService.makeSubscription(
                makeSubscriptionDto,
                req.user
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('repositories')
    async findAllRepositories(@Req() req: any, @Query() query: any) {
        return {
            message: 'Repositories fetched successfully',
            result: await this.workspaceService.findAllRepositories(
                req.user,
                query
            )
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Patch('repositories/:id')
    async updateRepository(
        @Param('id') id: string,
        @Body() body: UpdateRepositoryDto
    ) {
        return {
            message: 'Repository updated successfully',
            result: await this.workspaceService.updateRepository(id, body)
        }
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('pr-list')
    async findPRs(@Req() req: any, @Query() query: any) {
        return {
            message: 'Pull requests fetched successfully',
            result: await this.workspaceService.findPRs(req.user, query)
        }
    }
}
