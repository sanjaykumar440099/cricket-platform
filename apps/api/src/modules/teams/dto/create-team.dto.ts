import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  shortName?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
