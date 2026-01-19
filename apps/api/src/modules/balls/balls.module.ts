import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BallEntity } from '../matches/entities/ball.entity';
import { InningsEntity } from '../innings/entities/innings.entity';
import { MatchEntity } from '../matches/entities/match.entity';

import { BallsService } from './balls.service';
import { BallsController } from './balls.controller';
import { ScoresModule } from '../scores/scores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BallEntity,
      InningsEntity,
      MatchEntity,
    ]),
    ScoresModule,
  ],
  providers: [BallsService],
  controllers: [BallsController],
  exports: [BallsService], // ✅ REQUIRED
})
export class BallsModule { }
