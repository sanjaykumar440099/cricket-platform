import { Controller, Get, Param } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { HttpUser } from '../auth/decorators/http-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('matches/:matchId')
  exportMatch(
    @Param('matchId') matchId: string,
    @HttpUser() user: JwtPayload,
  ) {
    return this.exportsService.exportMatch(matchId, user.userId);
  }
}
