import { IsString, IsOptional, IsEnum, IsInt, Min, MaxLength } from 'class-validator';

export class CreatePlaygroundDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsEnum(['PUBLIC', 'PRIVATE'])
  @IsOptional()
  visibility?: 'PUBLIC' | 'PRIVATE';

  @IsInt()
  @Min(1)
  @IsOptional()
  maxParticipants?: number;
}
