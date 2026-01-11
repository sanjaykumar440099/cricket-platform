import { Injectable } from '@nestjs/common';
import { Match } from './entities/match.entity';

@Injectable()
export class MatchesService {
  private items: Match[] = [];

  findAll(): Match[] {
    return this.items;
  }

  create(data: Partial<Match>): Match {
    const m: Match = { id: String(this.items.length + 1), home: data.home || '', away: data.away || '', startAt: data.startAt || new Date() } as Match;
    this.items.push(m);
    return m;
  }
}
