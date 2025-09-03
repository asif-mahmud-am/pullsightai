import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { DATA_RETRIEVED } from 'src/common/utils/response-message.util'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { PaymentsService } from './payments.service'

@Controller({
    path: 'api/payments',
    version: '1'
})
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post()
    create(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.create(createPaymentDto)
    }

    @Get()
    async findOne(@Query('transactionId') transactionId: string) {
        return {
            message: DATA_RETRIEVED,
            result: await this.paymentsService.findOne(transactionId)
        }
    }
}
