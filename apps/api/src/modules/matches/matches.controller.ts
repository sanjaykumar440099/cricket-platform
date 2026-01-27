import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { HttpUser } from '../auth/decorators/http-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // -------------------------
  // ADMIN — Schedule Match
  // -------------------------
  @Roles(UserRole.ADMIN)
  @Post('schedule')
  schedule(@Body() dto: CreateMatchDto) {
    return this.matchesService.scheduleMatch(dto);
  }

  // -------------------------
  // ADMIN — Create Match (optional)
  // -------------------------
  @Roles(UserRole.ADMIN)
  @Post()
  createMatch(
    @Body() dto: CreateMatchDto,
    @HttpUser() user: JwtPayload,
  ) {
    return this.matchesService.createMatch(dto, user);
  }

  // -------------------------
  // ADMIN / SCORER — Start Match
  // -------------------------
  @Roles(UserRole.ADMIN, UserRole.SCORER)
  @Post(':id/start')
  startMatch(
    @Param('id') id: string,
    @HttpUser() user: JwtPayload,
  ) {
    return this.matchesService.startMatch(id, user);
  }

  // -------------------------
  // READ — Get Match
  // -------------------------
  @Get(':id')
  getMatch(@Param('id') id: string) {
    return this.matchesService.getMatch(id);
  }

  @Get()
  listMatches() {
    return this.matchesService.listMatches();
  }

  // -------------------------
  // ADMIN — Complete Match
  // -------------------------
  @Roles(UserRole.ADMIN)
  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @Body() body: {
      winnerTeamId?: string;
      isTie?: boolean;
      isNoResult?: boolean;
    },
    @HttpUser() user: JwtPayload,
  ) {
    return this.matchesService.completeMatch(id, body, user);
  }
}
