import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './entities/match.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { Team } from '../teams/entities/team.entity';
import { TournamentEntity } from '../tournaments/entities/tournament.entity';
@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity, Team, TournamentEntity]), TournamentsModule],
  providers: [MatchesService],
  controllers: [MatchesController],
})
export class MatchesModule {}
