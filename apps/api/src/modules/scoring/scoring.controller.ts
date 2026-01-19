import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { BallEventDto } from './dto/ball-event.dto';

@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoring: ScoringService) { }

  @Post('ball')
  addBall(@Body() dto: BallEventDto) {
    return this.scoring.addBall(dto);
  }

  @Get('score/:matchId')
  getScore(@Param('matchId') matchId: string) {
    return this.scoring.getScore(matchId);
  }
}
