import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoringService } from './scoring.service';
import { BallEntity } from './entity/ball.entity';
import { ScoringController } from './scoring.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BallEntity]),
  ],
  providers: [ScoringService],
  controllers: [ScoringController],
  exports: [ScoringService], // 🔴 THIS MUST EXIST
})
export class ScoringModule {}
