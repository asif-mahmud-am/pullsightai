import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import {
    IssueAnalysisCardFilterDto,
    IssueCardFilterDto,
    PrAnalysisCardFilterDto,
    TimeAndMoneySaveCardFilterDto
} from './dto/dashboardFilter.dto'

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
                graphChart: [],
                opened: 0,
                merged: 0,
                declined: 0,
                total: 0
            }
        }

        const findWorkspace = await this.dataService.workspaces.findOne(
            { _id: findUser.currentWorkspace },
            'slug'
        )

        if (!findWorkspace) {
            return {
                graphChart: [],
                opened: 0,
                merged: 0,
                declined: 0,
                total: 0
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
        const graphChart = await this.getTimeSeriesData(
            match,
            fromDate,
            toDate,
            breakdown
        )

        return {
            graphChart,
            ...totals
        }
    }

    async getIssueAnalysisCard(
        user: any,
        issueAnalysisCardFilterDto: IssueAnalysisCardFilterDto
    ) {
        const findUser = await this.dataService.users.findOne(
            { _id: user.sub, provider: user.provider },
            'currentWorkspace'
        )
        if (!findUser || !findUser.currentWorkspace) {
            return {
                pieChart: [],
                completeRate: 0,
                total: 0
            }
        }

        const findWorkspace = await this.dataService.workspaces.findOne(
            { _id: findUser.currentWorkspace },
            'slug'
        )

        if (!findWorkspace) {
            return {
                pieChart: [],
                completeRate: 0,
                total: 0
            }
        }

        const pullRequestAnalysisIds =
            await this.dataService.pullRequestAnalysis.find(
                { workspaceSlug: findWorkspace.slug },
                '_id'
            )

        if (!pullRequestAnalysisIds || pullRequestAnalysisIds.length === 0) {
            return {
                pieChart: [],
                completeRate: 0,
                total: 0
            }
        }

        // Set default date range if not provided (last 30 days)
        const toDate = issueAnalysisCardFilterDto.to
            ? new Date(issueAnalysisCardFilterDto.to)
            : new Date()
        const fromDate = issueAnalysisCardFilterDto.from
            ? new Date(issueAnalysisCardFilterDto.from)
            : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

        // Fix 3: Use $in to match multiple IDs
        const match = {
            pullRequestAnalysisId: {
                $in: pullRequestAnalysisIds.map((item) => item._id)
            },
            createdAt: {
                $gte: fromDate,
                $lte: toDate
            }
        }

        // if (issueAnalysisCardFilterDto.repo) {
        //     match.repo = issueAnalysisCardFilterDto.repo
        // }
        // // Get overall totals
        // const prAnalysisReviewSeveritys =
        //     await this.dataService.pullRequestAnalysisComments.aggregate([
        //         { $match: match },
        //         { $group: { _id: '$severity', count: { $sum: 1 } } }
        //     ])
        let prAnalysisReviewSeveritys
        if (issueAnalysisCardFilterDto.repo) {
            prAnalysisReviewSeveritys =
                await this.dataService.pullRequestAnalysisComments.aggregate([
                    {
                        $lookup: {
                            from: 'pullrequestanalyses',
                            let: { analysisId: '$pullRequestAnalysisId' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: [
                                                        '$_id',
                                                        '$$analysisId'
                                                    ]
                                                },
                                                {
                                                    $eq: [
                                                        '$repositorySlug',
                                                        issueAnalysisCardFilterDto.repo
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'analysis'
                        }
                    },
                    { $match: { analysis: { $ne: [] } } },
                    { $match: match },
                    { $group: { _id: '$severity', count: { $sum: 1 } } }
                ])
        } else {
            prAnalysisReviewSeveritys =
                await this.dataService.pullRequestAnalysisComments.aggregate([
                    { $match: match },
                    { $group: { _id: '$severity', count: { $sum: 1 } } }
                ])
        }

        // Transform aggregation result to required format
        const totals = {
            major: 0,
            minor: 0,
            info: 0,
            critical: 0,
            blocker: 0,
            total: 0
        }

        prAnalysisReviewSeveritys.forEach((item) => {
            const state = item._id?.toLowerCase()
            if (state === 'Major' || state === 'major') {
                totals.major = item.count
            } else if (state === 'Minor' || state === 'minor') {
                totals.minor = item.count
            } else if (state === 'Info' || state === 'info') {
                totals.info = item.count
            } else if (state === 'Critical' || state === 'critical') {
                totals.critical = item.count
            } else if (state === 'Blocker' || state === 'blocker') {
                totals.blocker = item.count
            }
            totals.total += item.count
        })

        return {
            ...totals
        }
    }

    async getTimeAndMoneySaveCard(
        user: any,
        timeAndMoneySaveCardFilterDto: TimeAndMoneySaveCardFilterDto
    ) {
        const findUser = await this.dataService.users.findOne(
            { _id: user.sub, provider: user.provider },
            'currentWorkspace'
        )

        if (!findUser || !findUser.currentWorkspace) {
            return {
                graphChart: [],
                totalTimeSaved: 0,
                totalMoneySaved: 0,
                hourlyRate: 50,
                averageTimePerPR: 0
            }
        }

        const findWorkspace = await this.dataService.workspaces.findOne(
            { _id: findUser.currentWorkspace },
            'slug workSpaceSetting prFiles'
        )

        if (!findWorkspace) {
            return {
                graphChart: [],
                totalTimeSaved: 0,
                totalMoneySaved: 0,
                hourlyRate: 50,
                averageTimePerPR: 0
            }
        }

        // Get hourly rate from workspace prFiles (default to 50 if not set)
        const hourlyRate = findWorkspace.workspaceSetting?.hourlyRate || 50

        // Set default date range if not provided (last 30 days)
        const toDate = timeAndMoneySaveCardFilterDto.to
            ? new Date(timeAndMoneySaveCardFilterDto.to)
            : new Date()
        const fromDate = timeAndMoneySaveCardFilterDto.from
            ? new Date(timeAndMoneySaveCardFilterDto.from)
            : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

        // Build match criteria for pull request analysis
        const analysisMatch: any = {
            workspaceSlug: findWorkspace.slug,
            createdAt: {
                $gte: fromDate,
                $lte: toDate
            }
        }

        if (timeAndMoneySaveCardFilterDto.repo) {
            analysisMatch.repositorySlug = timeAndMoneySaveCardFilterDto.repo
        }

        // Get all PR analyses with populated pull request data
        const prAnalyses = await this.dataService.pullRequestAnalysis
            .find(analysisMatch)
            .populate({
                path: 'pullRequest',
                populate: {
                    path: 'prFiles'
                }
            })
            .exec()

        let totalTimeSaved = 0
        let totalLinesReviewed = 0
        const timeSeriesData: Map<string, number> = new Map()

        for (const analysis of prAnalyses) {
            if (analysis.pullRequest) {
                const pullRequest = analysis.pullRequest as any

                // Use total line counts from PR schema
                const prTotalLineAddition = pullRequest.prTotalLineAddition || 0
                const prTotalLineDeletion = pullRequest.prTotalLineDeletion || 0

                const timeInSecondToReviewPrLine = 30
                const totalPrReviewTimeInSeconds =
                    (prTotalLineAddition + prTotalLineDeletion) *
                    timeInSecondToReviewPrLine
                const totalPrReviewTimeInHour =
                    totalPrReviewTimeInSeconds / 3600

                totalTimeSaved += totalPrReviewTimeInHour
                totalLinesReviewed += prTotalLineAddition + prTotalLineDeletion

                // Group by time period for chart data
                const breakdown =
                    timeAndMoneySaveCardFilterDto.breakdown || 'day'
                const dateKey = this.formatDateByBreakdown(
                    (analysis as any).createdAt,
                    breakdown
                )

                timeSeriesData.set(
                    dateKey,
                    (timeSeriesData.get(dateKey) || 0) + totalPrReviewTimeInHour
                )
            }
        }

        // Calculate money saved
        const totalMoneySaved = totalTimeSaved * hourlyRate
        const averageTimePerPR =
            prAnalyses.length > 0 ? totalTimeSaved / prAnalyses.length : 0

        // Generate time series chart data
        const breakdown = timeAndMoneySaveCardFilterDto.breakdown || 'day'
        const graphChart = this.generateTimeSeriesChart(
            timeSeriesData,
            fromDate,
            toDate,
            breakdown
        )

        return {
            graphChart,
            totalTimeSaved: Math.round(totalTimeSaved * 100) / 100, // Hours, rounded to 2 decimal places
            totalMoneySaved: Math.round(totalMoneySaved * 100) / 100, // Currency, rounded to 2 decimal places
            averageTimePerPR: Math.round(averageTimePerPR * 100) / 100, // Hours, rounded to 2 decimal places
            totalLinesReviewed,
            totalPRsAnalyzed: prAnalyses.length
        }
    }

    async issueCard(user: any, issueCardFilterDto: IssueCardFilterDto) {
        const findUser = await this.dataService.users.findOne(
            { _id: user.sub, provider: user.provider },
            'currentWorkspace'
        )

        if (!findUser || !findUser.currentWorkspace) {
            return {}
        }

        const findWorkspace = await this.dataService.workspaces.findOne(
            { _id: findUser.currentWorkspace },
            'slug'
        )

        if (!findWorkspace) {
            return {}
        }

        // Build query for pullRequestAnalysis with repo filter
        const analysisQuery: any = { workspaceSlug: findWorkspace.slug }
        if (issueCardFilterDto.repo) {
            analysisQuery.repositorySlug = issueCardFilterDto.repo
        }

        const pullRequestAnalysisIds =
            await this.dataService.pullRequestAnalysis.find(
                analysisQuery,
                '_id'
            )

        if (!pullRequestAnalysisIds || pullRequestAnalysisIds.length === 0) {
            return {}
        }

        // Set default date range if not provided (last 30 days)
        const toDate = issueCardFilterDto.to
            ? new Date(issueCardFilterDto.to)
            : new Date()
        const fromDate = issueCardFilterDto.from
            ? new Date(issueCardFilterDto.from)
            : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

        // Build the base query for filtering by pullRequestAnalysisIds from workspace and date range
        const baseQuery: any = {
            pullRequestAnalysisId: {
                $in: pullRequestAnalysisIds.map((item) => item._id)
            },
            createdAt: {
                $gte: fromDate,
                $lte: toDate
            }
        }

        const findPullRequestComments =
            await this.dataService.pullRequestAnalysisComments
                .find(baseQuery)
                .populate({
                    path: 'pullRequestAnalysisId',
                    populate: {
                        path: 'pullRequest',
                        match: {
                            ...(issueCardFilterDto.prUser && {
                                prUser: issueCardFilterDto.prUser
                            }),
                            ...(issueCardFilterDto.prState && {
                                prState: issueCardFilterDto.prState
                            })
                        }
                    }
                })
                .exec()

        // Filter out comments where pullRequest doesn't match the criteria
        const filteredComments = findPullRequestComments.filter((comment) => {
            const analysis = comment.pullRequestAnalysisId as any
            return analysis?.pullRequest !== null
        })

        return filteredComments
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
                                {
                                    $in: [
                                        '$prState',
                                        ['open', 'opened', 'OPEN']
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    merged: {
                        $sum: {
                            $cond: [
                                {
                                    $in: [
                                        '$prState',
                                        ['merged', 'merge', 'closed', 'MERGED']
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    declined: {
                        $sum: {
                            $cond: [
                                {
                                    $in: [
                                        '$prState',
                                        ['declined', 'decline', 'DECLINED']
                                    ]
                                },
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
                    date:
                        breakdown === 'year'
                            ? {
                                  $dateFromParts: {
                                      year: '$_id.year',
                                      month: 1,
                                      day: 1
                                  }
                              }
                            : breakdown === 'month'
                              ? {
                                    $dateFromParts: {
                                        year: '$_id.year',
                                        month: '$_id.month',
                                        day: 1
                                    }
                                }
                              : {
                                    $dateFromParts: {
                                        year: '$_id.year',
                                        month: '$_id.month',
                                        day: '$_id.day'
                                    }
                                },
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
            date: string
            total: number
            opened: number
            merged: number
            declined: number
        }> = []

        const current = new Date(fromDate)
        const end = new Date(toDate)

        while (current <= end) {
            const dateStr = this.formatDateByBreakdown(current, breakdown)
            const existingData = prTimeSeriesData.find(
                (item) =>
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

    private generateTimeSeriesChart(
        timeSeriesData: Map<string, number>,
        fromDate: Date,
        toDate: Date,
        breakdown: 'day' | 'month' | 'year'
    ): Array<{ date: string; timeSaved: number }> {
        const result: Array<{ date: string; timeSaved: number }> = []
        const current = new Date(fromDate)
        const end = new Date(toDate)

        while (current <= end) {
            const dateStr = this.formatDateByBreakdown(current, breakdown)
            const timeSaved = timeSeriesData.get(dateStr) || 0

            result.push({
                date: dateStr,
                timeSaved: Math.round((timeSaved / 60) * 100) / 100 // Convert to hours and round
            })

            this.incrementDate(current, breakdown)
        }

        return result
    }

    private countChangedLines(diff: string): number {
        return (
            diff
                .split('\n')
                .filter((line) => line.startsWith('+') || line.startsWith('-'))
                // ignore diff headers like '--- a/...' or '+++ b/...'
                .filter(
                    (line) => !line.startsWith('+++') && !line.startsWith('---')
                ).length
        )
    }
}
