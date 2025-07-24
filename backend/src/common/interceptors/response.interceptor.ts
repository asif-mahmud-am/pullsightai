import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Injectable,
    NestInterceptor
} from '@nestjs/common'
import { EMPTY, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
    statusCode: number
    message: string
    data: T
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<Response<T>> {
        const ctx = context.switchToHttp()
        const response = ctx.getResponse()
        console.log('response======', response)
        console.log(
            'response.headersSent',
            response.headersSent,
            response.statusCode
        )
        if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
            return EMPTY
        }
        response.status(HttpStatus.OK)
        return next.handle().pipe(
            map((data) => {
                if (data?.redirect) {
                    response.status(HttpStatus.FOUND)
                    response.cookie('accessToken', data.token, {
                        httpOnly: true,
                        sameSite: 'lax',
                        maxAge: 7 * 24 * 60 * 60 * 1000 // 7days
                    })
                    return response.redirect(data.url)
                }
                return {
                    success: true,
                    statusCode: HttpStatus.OK,
                    message: data.message || 'Request successful',
                    data: data.result
                }
            })
        )
    }
}
