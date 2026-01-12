import { Injectable, ForbiddenException } from '@nestjs/common';
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
import { InningsEntity } from '../innings/entities/innings.entity';
import { MatchEntity } from '../matches/entities/match.entity';
import { AdvancedScoringValidator } from '../scoring/validators/advanced-scoring.validator';

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
    ) { }

    async addBall(dto: CreateBallDto, user: JwtPayload) {
        /** 0️⃣ Role check */
        if (!['admin', 'scorer'].includes(user.role)) {
            throw new ForbiddenException('Only scorers can add balls');
        }

        /** 1️⃣ Load innings */
        const innings = await this.inningsRepo.findOne({
            where: { id: dto.inningsId },
        });
        if (!innings) {
            throw new ForbiddenException('Invalid innings');
        }

        /** 2️⃣ Load match */
        const match = await this.matchRepo.findOne({
            where: { id: innings.matchId },
        });
        if (!match) {
            throw new ForbiddenException('Match not found');
        }

        /** 3️⃣ Load snapshot (FAST PATH) */

        const snapshot = await this.snapshotService.getSnapshot(dto.inningsId);
        const isFreeHit = snapshot?.isFreeHit ?? false;
        const ballsInOver = snapshot ? snapshot.ballsInOver : 0;

        // Load all previous balls (READ ONLY)
        const balls = await this.ballRepo.find({
            where: { inningsId: dto.inningsId },
            order: { createdAt: 'ASC' },
        });

        /** 4️⃣ 🔐 VALIDATE BALL (CRITICAL) */
        ScoringValidator.validateBall(
            dto,
            innings,
            ballsInOver,
            match.oversLimit,
        );

        // Advanced cricket rules
        AdvancedScoringValidator.validate(
            dto,
            innings,
            balls,
            match.oversLimit,
            isFreeHit
        );

        /** 5️⃣ Persist ball (IMMUTABLE EVENT) */
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

        /** 6️⃣ Load state from snapshot */
        let state = await this.loadStateFromSnapshot(dto);

        /** 7️⃣ Apply ONLY the new ball */
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

        /** 8️⃣ Update snapshot */
        await this.snapshotService.upsertSnapshot(dto.inningsId, state);

        /** 9️⃣ Calculate derived score */
        const score = ScoringEngine.calculateScore(state);

        /** 🔟 Emit live WebSocket update */
        this.liveService.emitScore(dto.inningsId, {
            inningsId: dto.inningsId,
            score,
            state,
            lastBall: dto,
        });

        /** 11️⃣ Return response */
        return { score, state };
    }


    /** 🔁 Snapshot → InningsState */
    private async loadStateFromSnapshot(dto: CreateBallDto): Promise<InningsState> {
        const snapshot = await this.snapshotService.getSnapshot(dto.inningsId);

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
            isPowerplay: snapshot.completedOvers < 6,
        };

    }
}
