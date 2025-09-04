import { Injectable, NotFoundException } from '@nestjs/common'
import { getTimePeriod } from 'src/common/helpers/coversion.helper'
import { DatabaseService } from 'src/database/database.service'
import { PaymentStatus } from 'src/database/enums/status.enum'
import { Service, ServiceBookingRef } from 'src/database/enums/transaction.enum'
import { Status } from 'src/database/schemas/purchasedPlan.schema'
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
        const period = getTimePeriod(planData.billingCycle)
        const purchasedPlan = await this.dataService.purchasedPlans.create({
            workspace: userData?.currentWorkspace?._id,
            plan: purchasePlanDto.planId,
            amount: 0,
            totalToken: totalToken,
            remainingToken: remainingToken,
            numOfSeat: purchasePlanDto.noOfSeat,
            billingCycle: planData.billingCycle,
            periodStart: period.periodStart,
            periodEnd: period.periodEnd,
            title: planData.title,
            pricePerDev: planData.pricePerDev,
            tokenLimitPerDev: planData.tokenLimitPerDev,
            isFree: planData.isFree,
            isDefault: planData.isDefault
        })
        if (!planData.isFree) {
            return await this.purchasePaidPlan(
                userData,
                planData,
                purchasePlanDto,
                purchasedPlan
            )
        }
        purchasedPlan.paymentStatus = PaymentStatus.PAID
        purchasedPlan.status = Status.ACTIVE
        purchasedPlan.save()
        return await this.purchaseFreePlan(userData, purchasedPlan)
    }

    async purchaseFreePlan(userData: any, purchasedPlan: any) {
        if (userData?.currentWorkspace?.currentPlan?.subscriptionId) {
            return await this.stripeService.cancelSubscription(
                userData?.currentWorkspace?.currentPlan?.subscriptionId
            )
        }
        await this.dataService.workspaces.updateOne(
            { _id: userData?.currentWorkspace?._id },
            { currentPlan: purchasedPlan._id }
        )
    }

    async purchasePaidPlan(
        userData: any,
        planData: any,
        purchasePlanDto: PurchasePlanDto,
        purchasedPlan: any
    ) {
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

    async currentActivePlan(user: any) {
        const userData: any = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate({
                path: 'currentWorkspace'
            })
        return await this.dataService.purchasedPlans
            .findOne({ _id: userData?.currentWorkspace?.currentPlan })
            .populate({ path: 'plan' })
    }

    async cancelPlan(user: any) {
        const userData: any = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate({
                path: 'currentWorkspace'
            })
        const purchasedPlan = await this.dataService.purchasedPlans.findOne({
            _id: userData?.currentWorkspace?.currentPlan
        })
        if (purchasedPlan == null) {
            throw new NotFoundException('No active plan found')
        }
        if (purchasedPlan.subscriptionId)
            await this.stripeService.cancelSubscription(
                purchasedPlan.subscriptionId
            )
        purchasedPlan.status = Status.ACTIVE
        purchasedPlan.subscriptionId = ''
        await purchasedPlan.save()
        return await this.dataService.workspaces.updateOne(
            { _id: userData?.currentWorkspace?._id },
            { currentPlan: null }
        )
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
