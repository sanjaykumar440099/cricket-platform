import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsTableEntity } from '../tournaments/entities/points-table.entity';
import { MatchEntity } from '../matches/entities/match.entity';
import { BallEntity } from '../matches/entities/ball.entity';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { PublicMatchController } from './controllers/public-match.controller';
import { PublicMatchService } from './services/public-match.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointsTableEntity,
      MatchEntity,
      BallEntity,
    ]),
  ],
  providers: [PublicService, PublicMatchService],
  controllers: [PublicController, PublicMatchController],
})
export class PublicModule {}