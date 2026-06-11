import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';

@Roles(UserRole.ADMIN)
@Controller('admin/tournaments/:tournamentId/teams')
export class TournamentTeamsController {
  constructor(private readonly teams: TeamsService) {}

  @Post()
  create(
    @Param('tournamentId') tournamentId: string,
    @Body() dto: CreateTeamDto,
  ) {
    return this.teams.createForTournament(tournamentId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SCORER)
  @Get()
  findAll(
    @Param('tournamentId') tournamentId: string,
  ) {
    return this.teams.findByTournament(tournamentId);
  }
}
