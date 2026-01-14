import { PlayoffStage } from '../playoff.rules';

export class CreatePlayoffDto {
  tournamentId!: string;
  stage!: PlayoffStage;
  teamAId!: string;
  teamBId!: string;
}
