import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  shortName?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
