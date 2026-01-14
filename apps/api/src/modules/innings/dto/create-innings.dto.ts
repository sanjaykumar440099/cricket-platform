export class CreateInningsDto {
  matchId!: string;
  battingTeamId!: string;
  bowlingTeamId!: string;
  inningsNumber!: number;
  isSuperOver?: boolean;
}
