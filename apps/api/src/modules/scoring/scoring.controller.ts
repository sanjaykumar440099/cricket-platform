import { Controller, Post, Body } from '@nestjs/common';
import { ScoringService } from './scoring.service';

@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoring: ScoringService) {}

  @Post('event')
  handleEvent(@Body() event: any) {
    return this.scoring.processEvent(event);
  }
}
