import {
    BadGatewayException,
    BadRequestException,
    forwardRef,
    Inject,
    Injectable
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from 'src/database/database.service'
import { PaymentStatus } from 'src/database/enums/status.enum'
import {
    Gateway,
    Service,
    ServiceBookingRef
} from 'src/database/enums/transaction.enum'
import { Status } from 'src/database/schemas/purchasedPlan.schema'
import { StripeService } from 'src/payments/stripe/stripe.service'
import { CreatePaymentDto, PaymentCallbackDto } from './dto/create-payment.dto'

@Injectable()
export class PaymentsService {
    constructor(
        @Inject(forwardRef(() => StripeService))
        private stripeService: StripeService,
        private readonly dataServices: DatabaseService,
        private configService: ConfigService
    ) {}

    async create(createPaymentDto: CreatePaymentDto) {
        if (createPaymentDto.gateway == Gateway.STRIPE) {
            const responseData =
                await this.stripeService.createCheckoutSession(createPaymentDto)
            await this.dataServices.transactions.create({
                ...createPaymentDto,
                transactionId: responseData.transactionId,
                paymentStatus: responseData.paymentStatus,
                storeAmount: responseData.storeAmount,
                amount: responseData.amount
            })
            return {
                url: responseData.url,
                transactionId: responseData.transactionId
                // paymentStatus: responseData.paymentStatus,
                // response: responseData.response
            }
        } else {
            throw new BadGatewayException('Payment gateway not supported')
        }
    }

    async createOneTimePayment(createPaymentDto: CreatePaymentDto) {
        if (createPaymentDto.gateway == Gateway.STRIPE) {
            const responseData =
                await this.stripeService.createOneTimeCheckout(createPaymentDto)
            await this.dataServices.transactions.create({
                ...createPaymentDto,
                transactionId: responseData.transactionId,
                paymentStatus: responseData.paymentStatus,
                storeAmount: responseData.storeAmount,
                amount: responseData.amount
            })
            return {
                url: responseData.url,
                transactionId: responseData.transactionId
            }
        } else {
            throw new BadGatewayException('Payment gateway not supported')
        }
    }

    async updateSubscription(createPaymentDto: CreatePaymentDto) {
        if (createPaymentDto.gateway == Gateway.STRIPE) {
            const updateSubscriptionInvoice =
                await this.stripeService.updateSubscriptions(createPaymentDto)
            const transaction = await this.dataServices.transactions.create({
                ...createPaymentDto,
                transactionId: updateSubscriptionInvoice.transactionId,
                paymentStatus: updateSubscriptionInvoice.paymentStatus,
                storeAmount: updateSubscriptionInvoice.storeAmount,
                amount: updateSubscriptionInvoice.amount
            })
            if (transaction.service == Service.PLAN) {
                await this.purchasePlanComplete(transaction)
            } else if (transaction.service == Service.PACK) {
                await this.purchasePackComplete(transaction)
            }
        } else {
            throw new BadGatewayException('Payment gateway not supported')
        }
    }

    async generateRecurringPayment(transaction: any) {
        const currentPlan: any = await this.dataServices.purchasedPlans
            .findOne({
                subscriptionId: transaction.subscriptionId
            })
            .sort({ createdAt: -1 })
        if (!currentPlan) {
            throw new BadGatewayException('Current plan not found')
        }
        currentPlan.status = Status.RENEWED
        await currentPlan.save()
        const newPurchasePlan = await this.dataServices.purchasedPlans.create({
            workspace: currentPlan.workspace,
            plan: currentPlan.plan,
            amount: transaction.amount,
            totalToken: currentPlan.totalToken,
            remainingToken: currentPlan.totalToken,
            numOfSeat: currentPlan.numOfSeat,
            billingCycle: currentPlan.billingCycle,
            paymentStatus: PaymentStatus.PAID,
            subscriptionId: transaction.subscriptionId,
            status: Status.ACTIVE,
            title: currentPlan.title,
            pricePerDev: currentPlan.pricePerDev,
            tokenLimitPerDev: currentPlan.tokenLimitPerDev,
            isFree: currentPlan.isFree,
            isDefault: currentPlan.isDefault,
            periodStart: new Date(),
            periodEnd:
                currentPlan.billingCycle == 'monthly'
                    ? new Date(new Date().setMonth(new Date().getMonth() + 1))
                    : new Date(
                          new Date().setFullYear(new Date().getFullYear() + 1)
                      )
        })
        const newTransaction = await this.dataServices.transactions.create({
            serviceId: currentPlan.plan,
            service: Service.PLAN,
            serviceBookingId: newPurchasePlan._id,
            serviceBookingRef: ServiceBookingRef.PURCHASED_PLAN,
            workspace: currentPlan.workspace,
            currency: transaction.currency,
            gateway: transaction.gateway,
            transactionId: transaction.transactionId,
            paymentStatus: transaction.paymentStatus,
            amount: transaction.amount,
            storeAmount: transaction.storeAmount,
            subscriptionId: transaction.subscriptionId,
            response: transaction.response
        })
        await this.dataServices.workspaces.findOneAndUpdate(
            {
                _id: currentPlan.workspace
            },
            {
                currentPlan: newPurchasePlan._id
            },
            {
                new: true
            }
        )
        return newPurchasePlan
    }

    async paymentCallback(paymentCallbackDto: PaymentCallbackDto) {
        const transaction = await this.dataServices.transactions.findOne({
            transactionId: paymentCallbackDto.transactionId
        })
        if (!transaction) {
            throw new BadGatewayException('Transaction not found')
        }

        const updatedTransaction =
            await this.dataServices.transactions.findOneAndUpdate(
                { transactionId: paymentCallbackDto.transactionId },
                paymentCallbackDto,
                { new: true }
            )

        if (transaction.service == Service.PLAN) {
            await this.purchasePlanComplete(updatedTransaction)
        } else if (transaction.service == Service.PACK) {
            await this.purchasePackComplete(updatedTransaction)
        }

        return {
            url:
                this.configService.get<string>('CLIENT_BASE_URL') +
                '/payment/invoice?transactionId=' +
                paymentCallbackDto.transactionId +
                '&status=' +
                paymentCallbackDto.paymentStatus
        }
    }

    async purchasePlanComplete(transaction: any) {
        const purchasedPlans =
            await this.dataServices.purchasedPlans.findByIdAndUpdate(
                {
                    _id: transaction.serviceBookingId
                },
                {
                    status: Status.ACTIVE,
                    paymentStatus: PaymentStatus.PAID,
                    subscriptionId: transaction.subscriptionId,
                    amount: transaction.amount
                },
                { new: true }
            )
        if (!purchasedPlans) {
            throw new BadGatewayException('Purchased plan not found')
        }
        const workspace: any = await this.dataServices.workspaces
            .findOne({
                _id: purchasedPlans?.workspace
            })
            .populate('currentPlan')
        if (workspace?.currentPlan) {
            await this.dataServices.purchasedPlans.findByIdAndUpdate(
                {
                    _id: workspace?.currentPlan?._id
                },
                {
                    status:
                        workspace.currentPlan.pricePerDev *
                            workspace.currentPlan.numOfSeat >
                        purchasedPlans.pricePerDev * purchasedPlans.numOfSeat
                            ? Status.DOWNGRADED
                            : Status.UPGRADED
                }
            )
        }
        workspace.currentPlan = purchasedPlans._id
        return await workspace.save()
    }

    async purchasePackComplete(transaction: any) {
        const purchasedPack =
            await this.dataServices.purchasedPacks.findByIdAndUpdate(
                {
                    _id: transaction.serviceBookingId
                },
                {
                    isActive: true,
                    paymentStatus: PaymentStatus.PAID,
                    amount: transaction.amount
                },
                { new: true }
            )
        const workspace = await this.dataServices.workspaces.findOneAndUpdate(
            {
                _id: purchasedPack?.workspace
            },
            {
                currentPack: purchasedPack?._id
            },
            {
                new: true
            }
        )
        return workspace
    }

    async findAll(user: any, query: any) {
        const userData = await this.dataServices.users.findOne({
            _id: user.sub
        })
        if (!userData?.currentWorkspace) {
            throw new BadRequestException('User or workspace not found')
        }
        return await this.dataServices.transactions.paginate(
            {
                workspace: userData.currentWorkspace
            },
            {
                sort: { createdAt: -1 },
                populate: 'serviceBookingId',
                select: '-response',
                limit: query.limit ? parseInt(query.limit) : 10,
                page: query.page ? parseInt(query.page) : 1
            }
        )
    }

    async findOne(transactionId: string) {
        const transaction = await this.dataServices.transactions
            .findOne({
                transactionId: transactionId
            })
            .populate('serviceBookingId')
            .select('-response')
        if (!transaction) {
            throw new BadGatewayException('Transaction not found')
        }
        return transaction
    }
}
