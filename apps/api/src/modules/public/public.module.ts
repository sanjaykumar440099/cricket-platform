import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsTableEntity } from '../tournaments/entities/points-table.entity';
import { TournamentEntity } from '../tournaments/entities/tournament.entity';
import { MatchEntity } from '../matches/entities/match.entity';
import { BallEntity } from '../matches/entities/ball.entity';
import { Team } from '../teams/entities/team.entity';
import { InningsEntity } from '../innings/entities/innings.entity';
import { ScoreSnapshotEntity } from '../scores/entities/score-snapshot.entity';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { PublicMatchController } from './controllers/public-match.controller';
import { PublicMatchService } from './services/public-match.service';
import { CacheModule } from '../cache/cache.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointsTableEntity,
      TournamentEntity,
      MatchEntity,
      BallEntity,
      Team,
      InningsEntity,
      ScoreSnapshotEntity,
    ]),
     CacheModule,
  ],
  providers: [PublicService, PublicMatchService],
  controllers: [PublicController, PublicMatchController],
})
export class PublicModule {}
