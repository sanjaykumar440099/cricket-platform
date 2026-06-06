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
import { ScoreProjector } from '../scoring/score.projector';
import { CacheService } from '../cache/cache.service';
import { CommentaryService } from '../commentary/commentary.service';
import { setMatchState } from '../cache/match.cache';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class BallsService {
  constructor(
    @InjectRepository(BallEntity)
    private readonly ballRepo: Repository<BallEntity>,

    @InjectRepository(InningsEntity)
    private readonly inningsRepo: Repository<InningsEntity>,

    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,

    private readonly snapshotService: ScoreSnapshotService,
    private readonly cache: CacheService,
    private readonly liveService: LiveService,
    private readonly commentaryService: CommentaryService,
  ) { }

  async addBall(dto: CreateBallDto, user: JwtPayload) {
    /* 0️⃣ Role check */
    if (![UserRole.ADMIN, UserRole.SCORER].includes(user.role)) {
      throw new ForbiddenException('Only scorers can add balls');
    }

    /* 1️⃣ Load innings */
    const innings = await this.inningsRepo.findOne({
      where: { id: dto.inningsId },
    });
    if (!innings) {
      throw new BadRequestException('Invalid innings');
    }

    /* 2️⃣ Load match */
    const match = await this.matchRepo.findOne({
      where: { id: innings.matchId },
    });
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    /* 3️⃣ Load snapshot */
    const snapshot = await this.snapshotService.getSnapshot(dto.inningsId);

    const ballsInOver = snapshot?.ballsInOver ?? 0;
    const isFreeHit = snapshot?.isFreeHit ?? false;
    const lastEventId = snapshot?.lastEventId ?? 0;
    const eventId = lastEventId + 1;

    SuperOverValidator.validate(innings, snapshot);

    /* 4️⃣ Load historical balls */
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

    /* 5️⃣ Persist ball */
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

    /* 6️⃣ Apply engine */
    const event: BallEvent = {
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

    state = ScoringEngine.applyBall(state, event);

    /* 7️⃣ Persist snapshot */
    await this.snapshotService.upsertSnapshot(dto.inningsId, state, eventId);

    /* 8️⃣ Store live events (CacheService ONLY) */
    /* 9️⃣ Auto-end super over */
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

    const score = ScoreProjector.fromState(state);
    const commentary = await this.commentaryService.createForBall({
      actorUserId: user.userId,
      matchId: match.id,
      inningsId: innings.id,
      overNumber: ball.overNumber,
      ballNumber: ball.ballNumber,
      event,
      state,
    });

    const resumePayload = {
      matchId: match.id,
      score,
      state,
      commentary,
      lastBall: dto,
      lastEventId: eventId,
      updatedAt: Date.now(),
    };

    const liveEvent: LiveEvent = {
      eventId,
      matchId: match.id,
      payload: {
        score,
        state,
        commentary,
        lastBall: dto,
      },
      timestamp: Date.now(),
    };

    const existingEvents =
      (await this.cache.getJSON<LiveEvent[]>(
        CacheKeys.liveEvents(match.id),
      )) || [];

    await this.cache.setJSON(
      CacheKeys.liveEvents(match.id),
      [...existingEvents, liveEvent].slice(-50),
    );
    await this.cache.setJSON(
      CacheKeys.liveScore(match.id),
      {
        state,
        score,
        lastEventId: eventId,
        updatedAt: Date.now(),
      },
    );
    await this.cache.setJSON(
      CacheKeys.matchResume(match.id),
      resumePayload,
    );
    await setMatchState(match.id, resumePayload);

    this.liveService.emitScoreUpdate(match.id, {
      ...liveEvent,
      ...liveEvent.payload,
    });

    return {
      score,
      state,
      commentary,
      lastBall: dto,
      lastEventId: eventId,
      event: liveEvent,
    };
  }


  /* 🔁 Snapshot → InningsState */
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
