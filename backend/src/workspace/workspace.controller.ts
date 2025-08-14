import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { MakeSubscriptionDto } from 'src/workspace/dto/make-subscription.dto'
import { UpdateWorkspaceDto } from './dto/update-workspace.dto'
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

    @Get()
    findAll() {
        return this.workspaceService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.workspaceService.findOne(+id)
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateWorkspaceDto: UpdateWorkspaceDto
    ) {
        return this.workspaceService.update(+id, updateWorkspaceDto)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.workspaceService.remove(+id)
    }
}
