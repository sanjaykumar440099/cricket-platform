export class GeneratePlayoffsDto {
  tournamentId!: string;

  /** Number of teams to qualify (usually 4) */
  topTeams!: number;

  /** Format */
  format!: 'STANDARD' | 'IPL';
}
