export class CreateMatchDto {
  teamAId!: string;
  teamBId!: string;
  oversLimit!: number;
  startTime?: Date;
}
