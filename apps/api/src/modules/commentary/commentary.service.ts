import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CommentaryEntryEntity } from './entities/commentary-entry.entity';
import { BallEvent } from '../scoring/domain/ball.event';
import { InningsState } from '../scoring/domain/innings.state';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { MatchEntity } from '../matches/entities/match.entity';
import { InningsEntity } from '../innings/entities/innings.entity';
import { BallEntity } from '../matches/entities/ball.entity';

@Injectable()
export class CommentaryService {
  constructor(
    @InjectRepository(CommentaryEntryEntity)
    private readonly commentaryRepo: Repository<CommentaryEntryEntity>,
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(InningsEntity)
    private readonly inningsRepo: Repository<InningsEntity>,
    @InjectRepository(BallEntity)
    private readonly ballRepo: Repository<BallEntity>,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async createForBall(params: {
    actorUserId?: string;
    matchId: string;
    inningsId: string;
    overNumber: number;
    ballNumber: number;
    event: BallEvent;
    state: InningsState;
  }) {
    const style = params.actorUserId
      ? await this.subscriptionsService.getCommentaryStyle(
          params.actorUserId,
        )
      : 'basic';
    const text = this.buildBallCommentary(
      style,
      params.event,
      params.state,
      params.overNumber,
      params.ballNumber,
    );

    return this.commentaryRepo.save(
      this.commentaryRepo.create({
        matchId: params.matchId,
        inningsId: params.inningsId,
        overNumber: params.overNumber,
        ballNumber: params.ballNumber,
        style,
        entryType: 'ball',
        context: this.resolveContext(params.event),
        text,
      }),
    );
  }

  async listByMatch(matchId: string, limit: number = 25) {
    return this.commentaryRepo.find({
      where: { matchId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async generateSummary(matchId: string, userId: string) {
    const entitlements =
      await this.subscriptionsService.assertCanAccessAiSummary(userId);
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const innings = await this.inningsRepo.find({
      where: { matchId },
      order: { inningsNumber: 'ASC' },
    });
    const inningIds = innings.map(item => item.id);
    const balls =
      inningIds.length > 0
        ? await this.ballRepo.find({
            where: { inningsId: In(inningIds) },
            order: { createdAt: 'ASC' },
          })
        : [];
    const recentCommentary = await this.listByMatch(matchId, 6);

    const fours = balls.filter(ball => ball.runsOffBat === 4).length;
    const sixes = balls.filter(ball => ball.runsOffBat === 6).length;
    const wickets = balls.filter(ball => ball.isWicket).length;
    const extras = balls.reduce((sum, ball) => sum + ball.extras, 0);
    const totalRuns = balls.reduce(
      (sum, ball) => sum + ball.runsOffBat + ball.extras,
      0,
    );

    const summaryText =
      entitlements.commentaryStyle === 'advanced'
        ? `Premium AI summary: Match ${matchId} is ${match.status} with ${totalRuns} runs on the board, ${wickets} wickets down, ${fours} fours, ${sixes} sixes, and ${extras} extra runs. Recent momentum: ${recentCommentary
            .map(item => item.text)
            .slice(0, 3)
            .join(' ')}`
        : `AI summary: ${totalRuns} runs, ${wickets} wickets, ${fours} fours, ${sixes} sixes, ${extras} extras. Recent highlights: ${recentCommentary
            .map(item => item.text)
            .slice(0, 2)
            .join(' ')}`;

    const entry = await this.commentaryRepo.save(
      this.commentaryRepo.create({
        matchId,
        inningsId: innings[innings.length - 1]?.id ?? null,
        overNumber: balls[balls.length - 1]?.overNumber ?? null,
        ballNumber: balls[balls.length - 1]?.ballNumber ?? null,
        style: entitlements.commentaryStyle,
        entryType: 'summary',
        context: 'summary',
        text: summaryText,
      }),
    );

    return {
      summary: summaryText,
      entry,
      stats: {
        totalRuns,
        wickets,
        fours,
        sixes,
        extras,
        totalBalls: balls.length,
      },
      plan: entitlements.plan,
    };
  }

  private buildBallCommentary(
    style: 'basic' | 'enhanced' | 'advanced',
    event: BallEvent,
    state: InningsState,
    overNumber: number,
    ballNumber: number,
  ) {
    const score = `${state.totalRuns}/${state.wickets}`;
    const overLabel = `${overNumber}.${ballNumber}`;

    if (event.isWicket) {
      if (style === 'advanced') {
        return `Wicket at ${overLabel}. The pressure builds as the batting side slips to ${score}, and the bowling unit takes control of the phase.`;
      }

      if (style === 'enhanced') {
        return `Wicket! ${overLabel} and the score is now ${score}. Big moment in the innings.`;
      }

      return `Wicket! ${overLabel}, score ${score}.`;
    }

    if (event.runsOffBat === 6) {
      return style === 'basic'
        ? `Six! ${overLabel}, score ${score}.`
        : `Six over long-on at ${overLabel}. That lifts the score to ${score}.`;
    }

    if (event.runsOffBat === 4) {
      return style === 'basic'
        ? `Four! ${overLabel}, score ${score}.`
        : `Cracked away for four at ${overLabel}. The batting side moves to ${score}.`;
    }

    if (event.extraType) {
      return style === 'advanced'
        ? `${event.extraType} at ${overLabel}. Extra runs keep the board moving to ${score}, and the over remains under pressure for the fielding side.`
        : `${event.extraType} at ${overLabel}. Score ${score}.`;
    }

    if (style === 'advanced') {
      return `${event.runsOffBat} run(s) from ${overLabel}. The innings progresses to ${score} with measured tempo.`;
    }

    if (style === 'enhanced') {
      return `${event.runsOffBat} run(s) at ${overLabel}. Score now ${score}.`;
    }

    return `${event.runsOffBat} run(s). ${overLabel}, score ${score}.`;
  }

  private resolveContext(event: BallEvent) {
    if (event.isWicket) {
      return 'wicket';
    }
    if (event.runsOffBat === 6) {
      return 'six';
    }
    if (event.runsOffBat === 4) {
      return 'boundary';
    }
    if (event.extraType) {
      return event.extraType;
    }
    return 'ball';
  }
}
