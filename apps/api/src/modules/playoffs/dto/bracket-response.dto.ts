import { PlayoffStage } from '../playoff.rules';

export interface BracketMatchDto {
  matchId: string;
  stage: PlayoffStage;
  teamAId: string | null;
  teamBId: string | null;
  winnerTeamId: string | null;
  isCompleted: boolean;
}

export interface BracketStageDto {
  stage: PlayoffStage;
  matches: BracketMatchDto[];
}

export interface BracketResponseDto {
  tournamentId: string;
  stages: BracketStageDto[];
}
