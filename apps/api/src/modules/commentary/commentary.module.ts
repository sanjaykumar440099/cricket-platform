import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentaryEntryEntity } from './entities/commentary-entry.entity';
import { CommentaryService } from './commentary.service';
import { CommentaryController } from './commentary.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { MatchEntity } from '../matches/entities/match.entity';
import { InningsEntity } from '../innings/entities/innings.entity';
import { BallEntity } from '../matches/entities/ball.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentaryEntryEntity,
      MatchEntity,
      InningsEntity,
      BallEntity,
    ]),
    SubscriptionsModule,
  ],
  providers: [CommentaryService],
  controllers: [CommentaryController],
  exports: [CommentaryService],
})
export class CommentaryModule {}
