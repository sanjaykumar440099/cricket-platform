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
  lastEventId: number,
) {
  await this.repo.save({
    inningsId,
    totalRuns: state.totalRuns,
    wickets: state.wickets,
    completedOvers: state.completedOvers,
    ballsInOver: state.ballsInOver,
    isFreeHit: state.isFreeHit,
    powerplayPhase: state.powerplayPhase,
    maxFieldersOutside: state.maxFieldersOutside,
    lastEventId,
  });
}



  async getSnapshot(inningsId: string) {
    return this.repo.findOne({ where: { inningsId } });
  }
}
