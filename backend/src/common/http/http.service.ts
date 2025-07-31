import { HttpService as NestHttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { AxiosRequestConfig } from 'axios'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class HttpService {
    constructor(private readonly http: NestHttpService) {}

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const res$ = this.http.get<T>(url, config)
        const res = await lastValueFrom(res$)
        return res.data
    }

    async post<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const res$ = this.http.post<T>(url, data, config)
        const res = await lastValueFrom(res$)
        return res.data
    }

    async put<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const res$ = this.http.put<T>(url, data, config)
        const res = await lastValueFrom(res$)
        return res.data
    }

    async delete<T = any>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const res$ = this.http.delete<T>(url, config)
        const res = await lastValueFrom(res$)
        return res.data
    }
}
