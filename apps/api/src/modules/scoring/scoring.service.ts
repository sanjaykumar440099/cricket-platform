import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BallEntity } from './entity/ball.entity';
import { BallEventDto } from './dto/ball-event.dto';
import { ScoringEngine } from './scoring.engine';
import { mapBallEntityToDto } from './scoring.mapper';
import { CacheService } from '../cache/cache.service';
import { CacheKeys } from '../cache/cache.keys';

@Injectable()
export class ScoringService {
  private readonly engine = new ScoringEngine();

  constructor(
    @InjectRepository(BallEntity)
    private readonly ballRepo: Repository<BallEntity>,
    private readonly cache: CacheService,
  ) {}

  async addBall(event: BallEventDto) {
    // 1. Persist ball
    const ball = this.ballRepo.create(event);
    await this.ballRepo.save(ball);

    // 2. Recalculate score
    const score = await this.getScore(event.matchId);

    // 3. Write Redis resume snapshot (CRITICAL)
    await this.cache.setJSON(
      CacheKeys.matchResume(event.matchId),
      {
        matchId: event.matchId,
        score,
        lastBall: ball,
        updatedAt: Date.now(),
      },
    );

    // 4. Return score to caller (gateway emits)
    return {
      ball,
      score,
    };
  }

  async getScore(matchId: string) {
    const balls = await this.ballRepo.find({
      where: { matchId },
      order: { createdAt: 'ASC' },
    });

    const ballDtos = balls.map(mapBallEntityToDto);
    return this.engine.calculateScore(ballDtos);
  }
}
