import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { Team } from '../teams/entities/team.entity';
import { PlayersService } from './players.service';
import { TeamPlayersController } from './team-players.controller';
import { PlayersController } from './players.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, Team]),
  ],
  providers: [PlayersService],
  controllers: [
    TeamPlayersController,
    PlayersController,
  ],
})
export class PlayersModule {}
