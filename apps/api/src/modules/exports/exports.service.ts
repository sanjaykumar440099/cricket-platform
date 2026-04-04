import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MatchEntity } from '../matches/entities/match.entity';
import { InningsEntity } from '../innings/entities/innings.entity';
import { BallEntity } from '../matches/entities/ball.entity';
import { CommentaryEntryEntity } from '../commentary/entities/commentary-entry.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(InningsEntity)
    private readonly inningsRepo: Repository<InningsEntity>,
    @InjectRepository(BallEntity)
    private readonly ballRepo: Repository<BallEntity>,
    @InjectRepository(CommentaryEntryEntity)
    private readonly commentaryRepo: Repository<CommentaryEntryEntity>,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async exportMatch(matchId: string, userId: string) {
    const entitlements =
      await this.subscriptionsService.assertCanExport(userId);
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
    const commentary = await this.commentaryRepo.find({
      where: { matchId },
      order: { createdAt: 'ASC' },
    });

    return {
      exportedAt: new Date().toISOString(),
      plan: entitlements.plan,
      match,
      innings: innings.map(inning => ({
        ...inning,
        balls: balls.filter(ball => ball.inningsId === inning.id),
      })),
      commentary,
    };
  }
}
