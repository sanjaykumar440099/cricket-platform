import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoringService } from './scoring.service';
import { BallEntity } from './entity/ball.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BallEntity]),
  ],
  providers: [ScoringService],
  exports: [ScoringService], // 🔴 THIS MUST EXIST
})
export class ScoringModule {}
