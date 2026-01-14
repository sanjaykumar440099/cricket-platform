import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayoffMatchEntity } from './entities/playoff-match.entity';
import { PlayoffsService } from './playoffs.service';
import { PlayoffsController } from './playoffs.controller';
import { TournamentsModule } from '../tournaments/tournaments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayoffMatchEntity]), TournamentsModule
  ],
  providers: [PlayoffsService],
  controllers: [PlayoffsController],
})
export class PlayoffsModule {}
