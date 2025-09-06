import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { Service, ServiceBookingRef } from 'src/database/enums/transaction.enum'
import { PurchasePlanDto } from 'src/pack/dto/purchase-plan.dto'
import { PaymentsService } from 'src/payments/payments.service'
import { StripeService } from 'src/payments/stripe/stripe.service'
import { CreatePackDto } from './dto/create-pack.dto'
import { UpdatePackDto } from './dto/update-pack.dto'

@Injectable()
export class PackService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly paymentsService: PaymentsService,
        private readonly stripeService: StripeService
    ) {}

    async currentActivePlan(user: any) {
        const userData: any = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate({
                path: 'currentWorkspace'
            })
        return await this.dataService.purchasedPacks
            .findOne({ _id: userData?.currentWorkspace?.currentPack })
            .populate({ path: 'pack' })
    }

    async purchase(purchasePlanDto: PurchasePlanDto, user: any) {
        const userData: any = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate({
                path: 'currentWorkspace',
                populate: {
                    path: 'currentPack'
                }
            })

        if (userData == null) {
            throw new NotFoundException('User not found')
        }

        if (!userData.stripeCustomerId) {
            userData.stripeCustomerId =
                await this.stripeService.getCustomerId(userData)
            await userData.save()
        }

        const packData = await this.dataService.packs.findOne({
            _id: purchasePlanDto.packId
        })
        if (packData == null) {
            throw new NotFoundException('Pack not found')
        }
        const purchasedPack = await this.dataService.purchasedPacks.create({
            workspace: userData?.currentWorkspace?._id,
            pack: purchasePlanDto.packId,
            amount: packData.price,
            totalToken: packData.token,
            title: packData.title
        })

        return await this.paymentsService.createOneTimePayment({
            serviceId: packData?._id as any,
            service: Service.PACK,
            serviceBookingId: purchasedPack._id as any,
            serviceBookingRef: ServiceBookingRef.PURCHASED_PACK,
            gateway: purchasePlanDto.gateway,
            workspace: userData?.currentWorkspace?._id as any,
            customerId: userData.stripeCustomerId,
            price: packData.price,
            noOfSeat: 1,
            productTitle: packData.title
        })
    }

    async create(createPackDto: CreatePackDto) {
        return await this.dataService.packs.create(createPackDto)
    }

    async findAll() {
        return await this.dataService.packs.find().sort({ priority: -1 })
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
