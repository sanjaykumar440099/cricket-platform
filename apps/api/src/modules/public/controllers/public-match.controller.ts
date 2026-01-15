import { Controller, Get, Param } from '@nestjs/common';
import { PublicMatchService } from '../services/public-match.service';

@Controller('public/matches')
export class PublicMatchController {
  constructor(private readonly service: PublicMatchService) {}

  @Get(':matchId/live')
  async getLiveMatch(@Param('matchId') matchId: string) {
    return this.service.getLiveMatch(matchId);
  }

  @Get(':matchId/spectators')
  async getSpectators(@Param('matchId') matchId: string) {
    return this.service.getSpectatorCount(matchId);
  }

  @Get('live')
  async getLiveMatches() {
    return this.service.getLiveMatches();
  }
}
