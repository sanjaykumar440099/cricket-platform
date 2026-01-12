import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreSnapshotEntity } from './entities/score-snapshot.entity';
import { ScoreSnapshotService } from './score-snapshot.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreSnapshotEntity])],
  providers: [ScoreSnapshotService],
  exports: [ScoreSnapshotService],
})
export class ScoresModule {}
