import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommentaryService } from './commentary.service';
import { Public } from '../auth/decorators/public.decorator';
import { HttpUser } from '../auth/decorators/http-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@Controller('commentary')
export class CommentaryController {
  constructor(private readonly commentaryService: CommentaryService) {}

  @Public()
  @Get('matches/:matchId')
  listByMatch(
    @Param('matchId') matchId: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentaryService.listByMatch(
      matchId,
      limit ? Number(limit) : 25,
    );
  }

  @Post('matches/:matchId/summary')
  generateSummary(
    @Param('matchId') matchId: string,
    @HttpUser() user: JwtPayload,
  ) {
    return this.commentaryService.generateSummary(
      matchId,
      user.userId,
    );
  }
}
