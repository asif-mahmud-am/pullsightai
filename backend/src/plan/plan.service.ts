import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreatePlanDto } from './dto/create-plan.dto'
import { UpdatePlanDto } from './dto/update-plan.dto'

@Injectable()
export class PlanService {
    constructor(private readonly dataService: DatabaseService) {}
    async create(createPlanDto: CreatePlanDto) {
        return await this.dataService.plans.create(createPlanDto)
    }

    async findAll() {
        return await this.dataService.plans.find()
    }

    findOne(id: number) {
        return `This action returns a #${id} plan`
    }

    async update(id: string, updatePlanDto: UpdatePlanDto) {
        return await this.dataService.plans.updateOne(
            { _id: id },
            updatePlanDto
        )
    }

    async remove(id: string) {
        return await this.dataService.plans.deleteOne({ _id: id })
    }
}
