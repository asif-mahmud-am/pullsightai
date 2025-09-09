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
import { WorkspaceOwnerGuard } from 'src/auth/guards/workspace-owner.guard'
import { PurchasePlanDto } from 'src/pack/dto/purchase-plan.dto'
import { CreatePackDto } from './dto/create-pack.dto'
import { UpdatePackDto } from './dto/update-pack.dto'
import { PackService } from './pack.service'

@Controller({
    path: 'pack',
    version: '1'
})
@UseGuards(AuthGuard('jwt-cookie'), WorkspaceOwnerGuard)
export class PackController {
    constructor(private readonly packService: PackService) {}

    @Get('current-active-plan')
    async currentActivePlan(@Req() req) {
        return {
            message: 'Current active plan retrieved successfully',
            result: await this.packService.currentActivePlan(req.user)
        }
    }

    @Post('purchase')
    async purchase(@Body() purchasePlanDto: PurchasePlanDto, @Req() req) {
        return {
            message: 'Plan purchased request successful',
            result: await this.packService.purchase(purchasePlanDto, req.user)
        }
    }

    @Post()
    async create(@Body() createPackDto: CreatePackDto) {
        return {
            message: 'Pack created successfully',
            result: await this.packService.create(createPackDto)
        }
    }

    @Get()
    async findAll() {
        return {
            message: 'Packs retrieved successfully',
            result: await this.packService.findAll()
        }
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updatePackDto: UpdatePackDto
    ) {
        return {
            message: 'Pack updated successfully',
            result: await this.packService.update(id, updatePackDto)
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return {
            message: 'Pack deleted successfully',
            result: await this.packService.remove(id)
        }
    }
}
