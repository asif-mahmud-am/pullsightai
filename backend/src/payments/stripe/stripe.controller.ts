import { Body, Controller, Post, Req } from '@nestjs/common'
import { StripeService } from './stripe.service'

// https://5f88cd3428aa.ngrok-free.app/v1/stripe/webhook
@Controller({ version: '1', path: 'stripe' })
export class StripeController {
    constructor(private readonly stripeService: StripeService) {}

    @Post('webhook')
    async handleWebhook(@Body() body: any, @Req() req: any) {
        const sig = req.headers['stripe-signature']
        return {
            message: 'Webhook received',
            result: await this.stripeService.handleWebhook(sig, body)
        }
    }

    // @Get('payment-callback')
    // async paymentCallback(@Query('session_id') sessionId: string) {
    //     return await this.stripeService.paymentCallback(sessionId)
    // }
}
