import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardFilterDto, IssueAnalysisCardFilterDto, TimeAndMoneySaveCardFilterDto } from './dto/dashboardFilter.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller({
    path: 'api/dashboard',
    version: '1'
})
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}


  @UseGuards(AuthGuard('jwt-cookie'))
  @Get('pr-analysis-card')
  async getPrAnalysisCard(@Req() req, @Query() prAnalysisCardFilterDto: DashboardFilterDto) {
    return {
      message: 'PR analysis card data fetched successfully',
      result: await this.dashboardService.getPrAnalysisCard(req.user, prAnalysisCardFilterDto)
    };
  }

  @UseGuards(AuthGuard('jwt-cookie'))
  @Get('issue-analysis-card')
  async getIssueAnalysisCard(@Req() req, @Query() issueAnalysisCardFilterDto: IssueAnalysisCardFilterDto) {
    return {
      message: 'Issue analysis card data fetched successfully',
      result: await this.dashboardService.getIssueAnalysisCard(req.user, issueAnalysisCardFilterDto)
    };
  }


  @UseGuards(AuthGuard('jwt-cookie'))
  @Get('time-money-save-card')
  async timeAndMoneySaveCard(@Req() req, @Query() timeAndMoneySaveCardFilterDto: TimeAndMoneySaveCardFilterDto) {
    return {
      message: 'Time and Money save card data fetched successfully',
      result: await this.dashboardService.getTimeAndMoneySaveCard(req.user, timeAndMoneySaveCardFilterDto)
    };
  }
}
