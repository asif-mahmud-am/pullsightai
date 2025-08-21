import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { PrAnalysisCardFilterDto } from './dto/create-dashboard.dto'

@Injectable()
export class DashboardService {
    constructor(private readonly dataService: DatabaseService) {}

    async getPrAnalysisCard(
        user: any,
        prAnalysisCardFilterDto: PrAnalysisCardFilterDto
    ) {
        const findUser = await this.dataService.users.findOne(
            { _id: user.sub, provider: user.provider },
            'currentWorkspace'
        )

        if (!findUser || !findUser.currentWorkspace) {
            return {
                data: {
                    graphChart: [],
                    opened: 0,
                    merged: 0,
                    declined: 0,
                    total: 0
                }
            }
        }

        const findWorkspace = await this.dataService.workspaces.findOne(
            { _id: findUser.currentWorkspace },
            'slug'
        )

        if (!findWorkspace) {
            return {
                data: {
                    graphChart: [],
                    opened: 0,
                    merged: 0,
                    declined: 0,
                    total: 0
                }
            }
        }

        // Set default date range if not provided (last 30 days)
        const toDate = prAnalysisCardFilterDto.to 
            ? new Date(prAnalysisCardFilterDto.to) 
            : new Date()
        const fromDate = prAnalysisCardFilterDto.from 
            ? new Date(prAnalysisCardFilterDto.from) 
            : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

        const match: any = {
            owner: findWorkspace.slug,
            createdAt: {
                $gte: fromDate,
                $lte: toDate
            }
        }

        if (prAnalysisCardFilterDto.repo) {
            match.repo = prAnalysisCardFilterDto.repo
        }

        // Get overall totals
        const prAnalysis = await this.dataService.pullRequests.aggregate([
            { $match: match },
            { $group: { _id: '$prState', count: { $sum: 1 } } }
        ])

        // Transform aggregation result to required format
        const totals = {
            opened: 0,
            merged: 0,
            declined: 0,
            total: 0
        }

        prAnalysis.forEach((item) => {
            const state = item._id?.toLowerCase()
            if (state === 'open' || state === 'opened') {
                totals.opened = item.count
            } else if (
                state === 'merged' ||
                state === 'merge' ||
                state === 'closed'
            ) {
                totals.merged = item.count
            } else if (state === 'declined' || state === 'decline') {
                totals.declined = item.count
            }
            totals.total += item.count
        })

        // Get time series data based on breakdown
        const breakdown = prAnalysisCardFilterDto.breakdown || 'day'
        const graphChart = await this.getTimeSeriesData(match, fromDate, toDate, breakdown)

        return {
            data: {
                graphChart,
                ...totals
            }
        }
    }

    private async getTimeSeriesData(
        match: any, 
        fromDate: Date, 
        toDate: Date, 
        breakdown: 'day' | 'month' | 'year'
    ) {
        let groupBy: any
        let dateFormat: string
        let incrementUnit: 'day' | 'month' | 'year'

        switch (breakdown) {
            case 'year':
                groupBy = {
                    year: { $year: '$createdAt' }
                }
                dateFormat = 'YYYY'
                incrementUnit = 'year'
                break
            case 'month':
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                }
                dateFormat = 'YYYY-MM'
                incrementUnit = 'month'
                break
            case 'day':
            default:
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                }
                dateFormat = 'YYYY-MM-DD'
                incrementUnit = 'day'
                break
        }

        // Aggregate PRs by time period
        const prTimeSeriesData = await this.dataService.pullRequests.aggregate([
            { $match: match },
            {
                $group: {
                    _id: groupBy,
                    total: { $sum: 1 },
                    opened: {
                        $sum: {
                            $cond: [
                                { $in: ['$prState', ['open', 'opened', 'OPEN']] },
                                1,
                                0
                            ]
                        }
                    },
                    merged: {
                        $sum: {
                            $cond: [
                                { $in: ['$prState', ['merged', 'merge', 'closed', 'MERGED']] },
                                1,
                                0
                            ]
                        }
                    },
                    declined: {
                        $sum: {
                            $cond: [
                                { $in: ['$prState', ['declined', 'decline', 'DECLINED']] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: breakdown === 'year' 
                        ? { $dateFromParts: { year: '$_id.year', month: 1, day: 1 } }
                        : breakdown === 'month'
                        ? { $dateFromParts: { year: '$_id.year', month: '$_id.month', day: 1 } }
                        : { $dateFromParts: { year: '$_id.year', month: '$_id.month', day: '$_id.day' } },
                    total: 1,
                    opened: 1,
                    merged: 1,
                    declined: 1
                }
            },
            { $sort: { date: 1 } }
        ])

        // Fill missing time periods with zero values
        const result: Array<{
            date: string;
            total: number;
            opened: number;
            merged: number;
            declined: number;
        }> = []
        
        const current = new Date(fromDate)
        const end = new Date(toDate)

        while (current <= end) {
            const dateStr = this.formatDateByBreakdown(current, breakdown)
            const existingData = prTimeSeriesData.find(item => 
                this.formatDateByBreakdown(item.date, breakdown) === dateStr
            )

            result.push({
                date: dateStr,
                total: existingData?.total || 0,
                opened: existingData?.opened || 0,
                merged: existingData?.merged || 0,
                declined: existingData?.declined || 0
            })

            this.incrementDate(current, incrementUnit)
        }

        return result
    }

    private formatDateByBreakdown(date: Date, breakdown: string): string {
        switch (breakdown) {
            case 'year':
                return date.getFullYear().toString()
            case 'month':
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            case 'day':
            default:
                return date.toISOString().split('T')[0]
        }
    }

    private incrementDate(date: Date, unit: 'day' | 'month' | 'year'): void {
        switch (unit) {
            case 'year':
                date.setFullYear(date.getFullYear() + 1)
                break
            case 'month':
                date.setMonth(date.getMonth() + 1)
                break
            case 'day':
            default:
                date.setDate(date.getDate() + 1)
                break
        }
    }
}
