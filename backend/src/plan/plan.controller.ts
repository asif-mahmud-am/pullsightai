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
import { PurchasePlanDto } from 'src/plan/dto/purchase-plan.dto'
import { CreatePlanDto } from './dto/create-plan.dto'
import { UpdatePlanDto } from './dto/update-plan.dto'
import { PlanService } from './plan.service'

@Controller({
    path: 'plan',
    version: '1'
})
@UseGuards(AuthGuard('jwt-cookie'))
export class PlanController {
    constructor(private readonly planService: PlanService) {}

    @Get('current-active-plan')
    async currentActivePlan(@Req() req) {
        return {
            message: 'Current active plan retrieved successfully',
            result: await this.planService.currentActivePlan(req.user)
        }
    }

    @Post('cancel-plan')
    async cancelPlan(@Req() req) {
        return {
            message: 'Cancel plan request successful',
            result: await this.planService.cancelPlan(req.user)
        }
    }

    @Post('purchase')
    async purchase(@Body() purchasePlanDto: PurchasePlanDto, @Req() req) {
        return {
            message: 'Plan purchased request successful',
            result: await this.planService.purchase(purchasePlanDto, req.user)
        }
    }

    @Post()
    async create(@Body() createPlanDto: CreatePlanDto) {
        return {
            message: 'Plan created successfully',
            result: await this.planService.create(createPlanDto)
        }
    }

    @Get()
    async findAll() {
        return {
            message: 'Plans retrieved successfully',
            result: await this.planService.findAll()
        }
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updatePlanDto: UpdatePlanDto
    ) {
        return {
            message: 'Plan updated successfully',
            result: await this.planService.update(id, updatePlanDto)
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return {
            message: 'Plan deleted successfully',
            result: await this.planService.remove(id)
        }
    }
}
