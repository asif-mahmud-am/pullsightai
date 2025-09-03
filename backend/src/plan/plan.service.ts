import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { Service, ServiceBookingRef } from 'src/database/enums/transaction.enum'
import { PaymentsService } from 'src/payments/payments.service'
import { StripeService } from 'src/payments/stripe/stripe.service'
import { PurchasePlanDto } from 'src/plan/dto/purchase-plan.dto'
import { CreatePlanDto } from './dto/create-plan.dto'
import { UpdatePlanDto } from './dto/update-plan.dto'

@Injectable()
export class PlanService {
    constructor(
        private readonly dataService: DatabaseService,
        private readonly paymentsService: PaymentsService,
        private readonly stripeService: StripeService
    ) {}

    async purchase(purchasePlanDto: PurchasePlanDto, user: any) {
        const userData: any = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate({
                path: 'currentWorkspace',
                populate: {
                    path: 'currentPlan'
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
        const planData = await this.dataService.plans.findOne({
            _id: purchasePlanDto.planId
        })
        if (planData == null) {
            throw new NotFoundException('Plan not found')
        }
        let totalToken = planData.tokenLimitPerDev * purchasePlanDto.noOfSeat
        let remainingToken = totalToken
        if (userData?.currentWorkspace?.currentPlan) {
            remainingToken =
                totalToken -
                (userData?.currentWorkspace?.currentPlan?.totalToken -
                    userData?.currentWorkspace?.currentPlan?.remainingToken)
        }
        const purchasedPlan = await this.dataService.purchasedPlans.create({
            workspace: userData?.currentWorkspace?._id,
            plan: purchasePlanDto.planId,
            amount: 0,
            totalToken: totalToken,
            remainingToken: remainingToken,
            numOfSeat: purchasePlanDto.noOfSeat,
            billingCycle: planData.billingCycle,
            periodStart: new Date(),
            periodEnd:
                planData.billingCycle == 'monthly'
                    ? new Date(new Date().setMonth(new Date().getMonth() + 1))
                    : new Date(
                          new Date().setFullYear(new Date().getFullYear() + 1)
                      )
        })
        if (userData?.currentWorkspace?.currentPlan?.subscriptionId) {
            return await this.paymentsService.updateSubscription({
                serviceId: planData?._id as any,
                service: Service.PLAN,
                serviceBookingId: purchasedPlan._id as any,
                serviceBookingRef: ServiceBookingRef.PURCHASED_PLAN,
                gateway: purchasePlanDto.gateway,
                workspace: userData?.currentWorkspace?._id as any,
                customerId: userData.stripeCustomerId,
                price: planData.pricePerDev,
                noOfSeat: purchasePlanDto.noOfSeat,
                productId: planData.stripeProductId as any,
                subscriptionId:
                    userData?.currentWorkspace?.currentPlan?.subscriptionId
            })
        }
        return await this.paymentsService.create({
            serviceId: planData?._id as any,
            service: Service.PLAN,
            serviceBookingId: purchasedPlan._id as any,
            serviceBookingRef: ServiceBookingRef.PURCHASED_PLAN,
            gateway: purchasePlanDto.gateway,
            workspace: userData?.currentWorkspace?._id as any,
            customerId: userData.stripeCustomerId,
            price: planData.pricePerDev,
            noOfSeat: purchasePlanDto.noOfSeat,
            productId: planData.stripeProductId as any
        })
    }

    async create(createPlanDto: CreatePlanDto) {
        return await this.dataService.plans.create(createPlanDto)
    }

    async findAll() {
        return await this.dataService.plans.find()
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
