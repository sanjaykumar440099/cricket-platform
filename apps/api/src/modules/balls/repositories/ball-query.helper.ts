import { BallEntity } from "src/modules/matches/entities/ball.entity";

export class BallQueryHelper {
  static oversByBowler(balls: BallEntity[], bowlerId: string): number {
    const overs = new Set<string>();

    balls
      .filter(b => b.bowlerId === bowlerId)
      .forEach(b => overs.add(`${b.overNumber}`));

    return overs.size;
  }

  static lastOverBowler(balls: BallEntity[]): string | null {
    if (balls.length === 0) return null;
    return balls[balls.length - 1].bowlerId;
  }

  static dismissedPlayers(balls: BallEntity[]): Set<string> {
    return new Set(
      balls
        .filter(b => b.isWicket && b.dismissedPlayerId)
        .map(b => b.dismissedPlayerId!),
    );
  }
}
