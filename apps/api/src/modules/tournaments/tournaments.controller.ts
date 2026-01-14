import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { PointsTableService } from './points-table.service';

@Controller('tournaments')
export class TournamentsController {
  constructor(
    private readonly tournamentsService: TournamentsService,
    private readonly pointsTableService: PointsTableService,
  ) {}

  @Post()
  create(@Body() dto: any) {
    return this.tournamentsService.create(dto);
  }

  @Get()
  list() {
    return this.tournamentsService.list();
  }

  @Get(':id/points-table')
  getTable(@Param('id') id: string) {
    return this.pointsTableService.getTable(id);
  }
}
