import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn(['T20', 'ODI', 'TEST'])
  format!: 'T20' | 'ODI' | 'TEST';
}
