import { Injectable } from '@nestjs/common';
import { MatchGateway } from './gateways/match.gateway';

@Injectable()
export class LiveService {
  constructor(private readonly gateway: MatchGateway) {}

  emitScore(matchId: string, data: any) {
    this.gateway.emitScoreUpdate(matchId, data);
  }
}
