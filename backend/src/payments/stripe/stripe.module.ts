import { Global, Module } from '@nestjs/common'
import { StripeController } from './stripe.controller'
import { StripeService } from './stripe.service'

@Global()
@Module({
    controllers: [StripeController],
    providers: [StripeService],
    exports: [StripeService]
})
export class StripeModule {}
