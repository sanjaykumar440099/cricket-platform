import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
