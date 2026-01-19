import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';

import { BallsService } from './balls.service';
import { CreateBallDto } from './dto/create-ball.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@Controller('balls')
@UseGuards(JwtAuthGuard)
export class BallsController {
  constructor(
    private readonly ballsService: BallsService,
  ) {}

  @Post()
  async addBall(
    @Body() dto: CreateBallDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.ballsService.addBall(dto, req.user);
  }
}
