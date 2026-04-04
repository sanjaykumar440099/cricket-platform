import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { MatchEntity } from '../matches/entities/match.entity';
import { InningsEntity } from '../innings/entities/innings.entity';
import { BallEntity } from '../matches/entities/ball.entity';
import { CommentaryEntryEntity } from '../commentary/entities/commentary-entry.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MatchEntity,
      InningsEntity,
      BallEntity,
      CommentaryEntryEntity,
    ]),
    SubscriptionsModule,
  ],
  providers: [ExportsService],
  controllers: [ExportsController],
})
export class ExportsModule {}
