import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BallEntity } from '../matches/entities/ball.entity';
import { CreateBallDto } from './dto/create-ball.dto';

import { ScoringEngine } from '../scoring/scoring.engine';
import { InningsState } from '../scoring/domain/innings.state';
import { BallEvent } from '../scoring/domain/ball.event';

import { LiveService } from '../live/live.service';
import { ScoreSnapshotService } from '../scores/score-snapshot.service';

import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ScoringValidator } from '../scoring/validators/scoring.validator';
import { AdvancedScoringValidator } from '../scoring/validators/advanced-scoring.validator';
import { FieldingValidator } from '../scoring/validators/fielding.validator';
import { SuperOverValidator } from '../scoring/validators/super-over.validator';

import { InningsEntity } from '../innings/entities/innings.entity';
import { MatchEntity } from '../matches/entities/match.entity';
import { ODI_POWERPLAYS } from '../scoring/domain/powerplay.config';
import { ScoreSnapshotEntity } from '../scores/entities/score-snapshot.entity';

import { CacheKeys } from '../cache/cache.keys';
import { LiveEvent } from '../live/types/live-event.type';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class BallsService {
  constructor(
    @InjectRepository(BallEntity)
    private readonly ballRepo: Repository<BallEntity>,

    @InjectRepository(InningsEntity)
    private readonly inningsRepo: Repository<InningsEntity>,

    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,

    private readonly liveService: LiveService,
    private readonly snapshotService: ScoreSnapshotService,
    private readonly redisService: RedisService,
  ) { }

  async addBall(dto: CreateBallDto, user: JwtPayload) {
    if (!['admin', 'scorer'].includes(user.role)) {
      throw new ForbiddenException('Only scorers can add balls');
    }

    const innings = await this.inningsRepo.findOne({
      where: { id: dto.inningsId },
    });
    if (!innings) {
      throw new BadRequestException('Invalid innings');
    }

    const match = await this.matchRepo.findOne({
      where: { id: innings.matchId },
    });
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const lockKey = CacheKeys.matchLock(match.id);
    const token = await this.redisService.acquireLock(lockKey);
    if (!token) {
      throw new BadRequestException('Scoring lock is currently held. Try again.');
    }

    try {
      const snapshot = await this.snapshotService.getSnapshot(dto.inningsId);

      const ballsInOver = snapshot?.ballsInOver ?? 0;
      const isFreeHit = snapshot?.isFreeHit ?? false;
      const lastEventId = snapshot?.lastEventId ?? 0;
      const eventId = lastEventId + 1;

      SuperOverValidator.validate(innings, snapshot);

      const balls = await this.ballRepo.find({
        where: { inningsId: dto.inningsId },
        order: { createdAt: 'ASC' },
      });

      ScoringValidator.validateBall(
        dto,
        innings,
        ballsInOver,
        match.oversLimit,
      );

      AdvancedScoringValidator.validate(
        dto,
        innings,
        balls,
        match.oversLimit,
        isFreeHit,
      );

      let state = this.buildStateFromSnapshot(dto, snapshot);

      FieldingValidator.validate(dto, state);

      const ball = await this.ballRepo.save(
        this.ballRepo.create({
          inningsId: dto.inningsId,
          overNumber: dto.overNumber,
          ballNumber: dto.ballNumber,
          strikerId: dto.strikerId,
          nonStrikerId: dto.nonStrikerId,
          bowlerId: dto.bowlerId,
          runsOffBat: dto.runsOffBat,
          extras: dto.extras,
          extraType: dto.extraType ?? undefined,
          isWicket: dto.isWicket,
          dismissedPlayerId: dto.dismissedPlayerId,
        }),
      );

      const ballEvent: BallEvent = {
        over: ball.overNumber,
        ball: ball.ballNumber,
        runsOffBat: ball.runsOffBat,
        extras: ball.extras,
        extraType: ball.extraType ?? null,
        isWicket: ball.isWicket,
        dismissedPlayerId: ball.dismissedPlayerId,
        strikerId: ball.strikerId,
        nonStrikerId: ball.nonStrikerId,
        bowlerId: ball.bowlerId,
      };

      state = ScoringEngine.applyBall(state, ballEvent);

      await this.snapshotService.upsertSnapshot(dto.inningsId, state, eventId);

      const liveEvent: LiveEvent = {
        eventId,
        payload: {
          state,
          lastBall: dto,
        },
        timestamp: Date.now(),
      };

      const existingEvents =
        (await this.redisService.get<LiveEvent[]>(
          CacheKeys.liveEvents(match.id),
        )) || [];

      await this.redisService.set(
        CacheKeys.liveEvents(match.id),
        [...existingEvents, liveEvent].slice(-50),
      );

      if (
        innings.isSuperOver &&
        (state.completedOvers * 6 + state.ballsInOver >= 6 ||
          state.wickets >= 2)
      ) {
        await this.inningsRepo.update(
          { id: innings.id },
          { isCompleted: true },
        );
      }

      await this.liveService.saveLiveState(match.id, {
        state,
        lastEventId: eventId,
      });

      await this.redisService.publish(
        CacheKeys.scoreUpdate(match.id),
        {
          matchId: match.id,
          eventId,
          inningsId: dto.inningsId,
          state,
          lastBall: dto,
        },
      );

      const score = ScoringEngine.calculateScore(state);

      return { score, state };
    } finally {
      await this.redisService.releaseLock(lockKey, token);
    }
  }

  private buildStateFromSnapshot(
    dto: CreateBallDto,
    snapshot: ScoreSnapshotEntity | null,
  ): InningsState {
    const firstPP = ODI_POWERPLAYS[0];

    if (!snapshot) {
      return {
        battingTeamId: '',
        bowlingTeamId: '',
        totalRuns: 0,
        wickets: 0,
        completedOvers: 0,
        ballsInOver: 0,
        strikerId: dto.strikerId,
        nonStrikerId: dto.nonStrikerId,
        currentBowlerId: dto.bowlerId,
        isCompleted: false,
        isFreeHit: false,
        powerplayPhase: firstPP.name,
        maxFieldersOutside: firstPP.maxFieldersOutside,
        isPowerplay: true,
      };
    }

    return {
      battingTeamId: '',
      bowlingTeamId: '',
      totalRuns: snapshot.totalRuns,
      wickets: snapshot.wickets,
      completedOvers: snapshot.completedOvers,
      ballsInOver: snapshot.ballsInOver,
      strikerId: dto.strikerId,
      nonStrikerId: dto.nonStrikerId,
      currentBowlerId: dto.bowlerId,
      isCompleted: false,
      isFreeHit: snapshot.isFreeHit,
      powerplayPhase: snapshot.powerplayPhase,
      maxFieldersOutside: snapshot.maxFieldersOutside,
      isPowerplay: snapshot.completedOvers < 6,
    };
  }
}
