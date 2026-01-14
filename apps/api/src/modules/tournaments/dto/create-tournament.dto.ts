export class CreateTournamentDto {
  name!: string;
  format!: 'T20' | 'ODI' | 'TEST';
}
