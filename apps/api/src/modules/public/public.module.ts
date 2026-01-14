import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsTableEntity } from '../tournaments/entities/points-table.entity';
import { MatchEntity } from '../matches/entities/match.entity';
import { BallEntity } from '../matches/entities/ball.entity';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointsTableEntity,
      MatchEntity,
      BallEntity,
    ]),
  ],
  providers: [PublicService],
  controllers: [PublicController],
})
export class PublicModule {}