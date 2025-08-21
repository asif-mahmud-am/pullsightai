import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto, PrAnalysisCardFilterDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller({
    path: 'dashboard',
    version: '1'
})
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}


  @UseGuards(AuthGuard('jwt-cookie'))
  @Get('pr-analysis-card')
  async getPrAnalysisCard(@Req() req, @Body() prAnalysisCardFilterDto: PrAnalysisCardFilterDto) {
    return {
      message: 'PR analysis card data fetched successfully',
      result: await this.dashboardService.getPrAnalysisCard(req.user, prAnalysisCardFilterDto)
    };
  }

}
