import { Controller, Post, Body } from '@nestjs/common';
import { DlsService } from './dls.service';
import { ApplyDlsDto } from './dto/apply-dls.dto';

@Controller('dls')
export class DlsController {
  constructor(private readonly dlsService: DlsService) {}

  @Post('apply')
  apply(@Body() dto: ApplyDlsDto) {
    const revisedTarget = this.dlsService.calculateRevisedTarget({
      firstInningsScore: dto.firstInningsScore,
      oversAvailable: 50,
      oversRemaining: dto.oversRemaining,
      wicketsLost: dto.wicketsLost,
    });

    return {
      revisedTarget,
    };
  }
}
