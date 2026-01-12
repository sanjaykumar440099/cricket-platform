import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './entities/match.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity])],
  providers: [MatchesService],
  controllers: [MatchesController],
})
export class MatchesModule {}
