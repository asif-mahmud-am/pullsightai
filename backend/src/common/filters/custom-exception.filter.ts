import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { isArray } from 'class-validator'
import { MongoServerError } from 'mongodb'
import mongoose from 'mongoose'
import { ERROR } from 'src/common/utils/response-message.util'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: any, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost
        const ctx = host.switchToHttp()
        let responseBody: { [key: string]: any } = {}

        console.log('exception========', exception)

        if (exception instanceof mongoose.Error.ValidationError) {
            responseBody = {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Validation error',
                error: Object.values(exception.errors)[0].message
            }
        } else if (
            exception instanceof MongoServerError &&
            exception.code === 11000
        ) {
            responseBody = {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Duplicate field value error',
                error: `${Object.keys(exception.keyValue).join(', ')} already exists!`
            }
        } else if (exception instanceof HttpException) {
            const exceptionData = Object.assign({}, exception.getResponse())
            responseBody = {
                statusCode: exception.getStatus(),
                message: exceptionData['error'] || exceptionData['message'],
                error: isArray(exceptionData['message'])
                    ? exceptionData['message'][0]
                    : exceptionData['message']
            }
        } else {
            responseBody = {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: exception.toString(),
                message: ERROR
            }
        }
        responseBody = {
            success: false,
            ...responseBody,
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            method: httpAdapter.getRequestMethod(ctx.getRequest()),
            timestamp: new Date().toISOString()
        }

        httpAdapter.reply(
            ctx.getResponse(),
            responseBody,
            responseBody.statusCode
        )
    }
}
