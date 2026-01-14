import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PlayoffsService } from './playoffs.service';
import { CreatePlayoffDto } from './dto/create-playoff.dto';
import { AdvanceTeamDto } from './dto/advance-team.dto';
import { GeneratePlayoffsDto } from './dto/generate-playoffs.dto';

@Controller('playoffs')
export class PlayoffsController {
  constructor(private readonly playoffsService: PlayoffsService) { }

  @Post()
  create(@Body() dto: CreatePlayoffDto) {
    return this.playoffsService.createPlayoff(dto);
  }

  @Post('complete')
  complete(@Body() dto: AdvanceTeamDto) {
    return this.playoffsService.completePlayoff(
      dto.playoffMatchId,
      dto.winnerTeamId,
    );
  }

  @Get(':tournamentId')
  list(@Param('tournamentId') tournamentId: string) {
    return this.playoffsService.listByTournament(tournamentId);
  }

  @Post('generate')
  generate(@Body() dto: GeneratePlayoffsDto) {
    return this.playoffsService.generatePlayoffs(dto);
  }

  @Get('bracket/:tournamentId')
  getBracket(@Param('tournamentId') tournamentId: string) {
    return this.playoffsService.getBracket(tournamentId);
  }
}
