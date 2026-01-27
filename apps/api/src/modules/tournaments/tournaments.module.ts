import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TournamentEntity } from './entities/tournament.entity';
import { PointsTableEntity } from './entities/points-table.entity';
import { TournamentsService } from './tournaments.service';
import { PointsTableService } from './points-table.service';
import { TournamentsController } from './tournaments.controller';

// 👇 ADD THESE IMPORTS
import { InningsEntity } from '../innings/entities/innings.entity';
import { BallEntity } from '../matches/entities/ball.entity';
import { Team } from '../teams/entities/team.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TournamentEntity,
      PointsTableEntity,
      InningsEntity,   
      BallEntity,
      Team   
    ]),
  ],
  providers: [TournamentsService, PointsTableService],
  controllers: [TournamentsController],
  exports: [PointsTableService],
})
export class TournamentsModule {}
