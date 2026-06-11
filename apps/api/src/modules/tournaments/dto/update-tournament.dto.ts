import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTournamentDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsIn(['T20', 'ODI', 'TEST'])
  format?: 'T20' | 'ODI' | 'TEST';
}
