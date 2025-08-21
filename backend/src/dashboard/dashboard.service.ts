import { Injectable } from '@nestjs/common';
import {  PrAnalysisCardFilterDto } from './dto/create-dashboard.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly dataService: DatabaseService,
    ) {}

    async getPrAnalysisCard(user: any, prAnalysisCardFilterDto: PrAnalysisCardFilterDto) {
        const findUser = await this.dataService.users.findOne(
            { _id: user.sub, provider: user.provider },
            'currentWorkspace'
        );

        if (!findUser || !findUser.currentWorkspace) {
            return {
                open: 0,
                merged: 0,
                declined: 0,
                total: 0
            };
        }


        const findWorkspace = await this.dataService.workspaces.findOne(
            { _id: findUser.currentWorkspace },
            'slug'
        );

        if (!findWorkspace) {
            return {
                open: 0,
                merged: 0,
                declined: 0,
                total: 0
            };
        }

        const match: any = {
            owner: findWorkspace.slug
        };
        if (prAnalysisCardFilterDto.repo) {
            match.repo = prAnalysisCardFilterDto.repo;
        }

        const prAnalysis = await this.dataService.pullRequests.aggregate([
            { $match: match },
            { $group: { _id: '$prState', count: { $sum: 1 } } }
        ]);
            // Transform aggregation result to required format
        const result = {
            open: 0,
            merged: 0,
            declined: 0,
            total: 0
        };

        prAnalysis.forEach(item => {
            const state = item._id?.toLowerCase();
            if (state === 'open') {
                result.open = item.count;
            } else if (state === 'merged' || state === 'merge') {
                result.merged = item.count;
            } else if (state === 'declined' || state === 'decline') {
                result.declined = item.count;
            }
            result.total += item.count;
        });

        return result;
    }
}
