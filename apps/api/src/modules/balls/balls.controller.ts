import { Controller, Post, Body } from '@nestjs/common';
import { BallsService } from './balls.service';
import { CreateBallDto } from './dto/create-ball.dto';

@Controller('balls')
export class BallsController {
  constructor(private readonly ballsService: BallsService) {}

  @Post()
  async addBall(@Body() dto: CreateBallDto) {
    return this.ballsService.addBall(dto);
  }
}
