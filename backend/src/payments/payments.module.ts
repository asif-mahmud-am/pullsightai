import { Global, Module } from '@nestjs/common'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { StripeModule } from './stripe/stripe.module'

@Global()
@Module({
    controllers: [PaymentsController],
    providers: [PaymentsService],
    imports: [StripeModule],
    exports: [PaymentsService]
})
export class PaymentsModule {}
