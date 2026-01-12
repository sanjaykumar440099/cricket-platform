import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ScoreSnapshotEntity } from './entities/score-snapshot.entity';
import { InningsState } from '../scoring/domain/innings.state';

@Injectable()
export class ScoreSnapshotService {
  constructor(
    @InjectRepository(ScoreSnapshotEntity)
    private readonly repo: Repository<ScoreSnapshotEntity>,
  ) { }

  async upsertSnapshot(
    inningsId: string,
    state: InningsState,
  ): Promise<ScoreSnapshotEntity> {
    const snapshot = await this.repo.findOne({
      where: { inningsId },
    });

    if (!snapshot) {
      return this.repo.save({
        inningsId,
        totalRuns: state.totalRuns,
        wickets: state.wickets,
        completedOvers: state.completedOvers,
        ballsInOver: state.ballsInOver,
        isFreeHit: state.isFreeHit,
        isPowerplay: state.isPowerplay,
      });
    }

    snapshot.totalRuns = state.totalRuns;
    snapshot.wickets = state.wickets;
    snapshot.completedOvers = state.completedOvers;
    snapshot.ballsInOver = state.ballsInOver;
    snapshot.isFreeHit = state.isFreeHit;
    snapshot.isPowerplay = state.isPowerplay;

    return this.repo.save(snapshot);
  }


  async getSnapshot(inningsId: string) {
    return this.repo.findOne({ where: { inningsId } });
  }
}
