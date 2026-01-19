export class BallEventDto {
    matchId!: string;
    innings!: number;

    over!: number;
    ball!: number;

    runs!: number;        // 0–6
    extraRuns?: number; // wides, no-balls
    extraType?: 'wide' | 'no-ball' | 'bye' | 'leg-bye';

    isWicket!: boolean;
}
