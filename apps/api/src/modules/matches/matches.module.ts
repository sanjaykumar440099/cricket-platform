import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './entities/match.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { TournamentsModule } from '../tournaments/tournaments.module';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity]), TournamentsModule],
  providers: [MatchesService],
  controllers: [MatchesController],
})
export class MatchesModule {}
