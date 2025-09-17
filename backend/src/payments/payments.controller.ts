import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { DATA_RETRIEVED } from 'src/common/utils/response-message.util'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { PaymentsService } from './payments.service'

@Controller({
    path: 'payments',
    version: '1'
})
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post()
    create(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.create(createPaymentDto)
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('transactions')
    async findAll(@Req() req, @Query() query: any) {
        return {
            message: DATA_RETRIEVED,
            result: await this.paymentsService.findAll(req.user, query)
        }
    }

    @Get()
    async findOne(@Query('transactionId') transactionId: string) {
        return {
            message: DATA_RETRIEVED,
            result: await this.paymentsService.findOne(transactionId)
        }
    }
}
