import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreatePackDto } from './dto/create-pack.dto'
import { UpdatePackDto } from './dto/update-pack.dto'

@Injectable()
export class PackService {
    constructor(private readonly dataService: DatabaseService) {}
    async create(createPackDto: CreatePackDto) {
        return await this.dataService.packs.create(createPackDto)
    }

    async findAll() {
        return await this.dataService.packs.find()
    }

    async update(id: string, updatePackDto: UpdatePackDto) {
        return await this.dataService.packs.updateOne(
            { _id: id },
            updatePackDto
        )
    }

    async remove(id: string) {
        return await this.dataService.packs.deleteOne({ _id: id })
    }
}
