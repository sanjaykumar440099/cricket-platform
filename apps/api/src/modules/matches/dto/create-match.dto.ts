export class CreateMatchDto {
  teamAId!: string;
  teamBId!: string;
  oversLimit!: number;
  tournamentId?: string;
  startTime?: Date;
}
