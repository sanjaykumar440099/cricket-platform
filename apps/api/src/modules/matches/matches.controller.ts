import { Controller, Get, Post, Body } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly svc: MatchesService) {}

  @Get()
  list() {
    return this.svc.findAll();
  }

  @Post()
  create(@Body() dto: any) {
    return this.svc.create(dto);
  }
}
