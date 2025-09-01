import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
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
