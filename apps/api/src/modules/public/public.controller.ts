import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get('leaderboard/:tournamentId')
  leaderboard(@Param('tournamentId') id: string) {
    return this.service.getLeaderboard(id);
  }

  @Get('team/:tournamentId/:teamId')
  teamStats(
    @Param('tournamentId') tId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.service.getTeamStats(tId, teamId);
  }

  @Get('match/:matchId')
  matchSummary(@Param('matchId') matchId: string) {
    return this.service.getMatchSummary(matchId);
  }

  @Get('player/:playerId')
  playerStats(@Param('playerId') playerId: string) {
    return this.service.getPlayerStats(playerId);
  }
}
