import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TournamentEntity } from '../tournaments/entities/tournament.entity';
import { TeamsService } from './teams.service';
import { TournamentTeamsController } from './tournament-teams.controller';
import { TeamsController } from './teams.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, TournamentEntity]),
  ],
  providers: [TeamsService],
  controllers: [TournamentTeamsController, TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
