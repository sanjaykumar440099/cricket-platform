import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { WsUser } from '../live/decorators/ws-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) { }

  @Post()
  createMatch(@Body() dto: CreateMatchDto, @WsUser() user: JwtPayload) {
    return this.matchesService.createMatch(dto, user);
  }

  @Post(':id/start')
  startMatch(@Param('id') id: string, @WsUser() user: JwtPayload) {
    return this.matchesService.startMatch(id, user);
  }

  @Get(':id')
  getMatch(@Param('id') id: string) {
    return this.matchesService.getMatch(id);
  }

  @Get()
  listMatches() {
    return this.matchesService.listMatches();
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @Body() body: {
      winnerTeamId?: string;
      isTie?: boolean;
      isNoResult?: boolean;
    },
    @WsUser() user: JwtPayload,
  ) {
    return this.matchesService.completeMatch(id, body, user);
  }
}
