import {
  Controller,
  Get,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { PlayersService } from './players.service';

@Roles(UserRole.ADMIN)
@Controller('admin/teams/:teamId/players')
export class TeamPlayersController {
  constructor(private readonly players: PlayersService) {}

  @Get()
  findAll(@Param('teamId') teamId: string) {
    return this.players.findByTeam(teamId);
  }

  @Post()
  create(
    @Param('teamId') teamId: string,
    @Body() dto: { name: string; role?: string },
  ) {
    return this.players.createForTeam(teamId, dto);
  }
}
