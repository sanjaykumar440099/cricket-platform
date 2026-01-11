import { Injectable } from '@nestjs/common';
import { ScoringEngine } from './scoring.engine';

@Injectable()
export class ScoringService {
  private engine = new ScoringEngine();

  processEvent(evt: any) {
    return this.engine.applyEvent(evt);
  }
}
