import { Injectable, BadRequestException } from '@nestjs/common';
import { DLS_RESOURCE_TABLE } from './dls-tables/dls-resource.table';

@Injectable()
export class DlsService {
  calculateRevisedTarget(params: {
    firstInningsScore: number;
    oversAvailable: number;
    oversRemaining: number;
    wicketsLost: number;
  }): number {
    const { firstInningsScore, oversRemaining, wicketsLost } = params;

    const oversKey = this.closestOversKey(oversRemaining);
    const resourceRow = DLS_RESOURCE_TABLE[oversKey];

    if (!resourceRow) {
      throw new BadRequestException('No DLS data for overs');
    }

    const resourcePercent = resourceRow[wicketsLost];

    const revisedTarget =
      Math.floor((firstInningsScore * resourcePercent) / 100) + 1;

    return revisedTarget;
  }

  private closestOversKey(overs: number): number {
    const keys = Object.keys(DLS_RESOURCE_TABLE)
      .map(Number)
      .sort((a, b) => b - a);

    return keys.find(k => overs >= k) ?? keys[keys.length - 1];
  }
}
