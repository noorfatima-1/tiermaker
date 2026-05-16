import { IsString, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreateTierDto {
  @IsString()
  @MaxLength(10)
  name: string;

  @IsString()
  @MaxLength(50)
  label: string;

  @IsString()
  color: string;

  @IsInt()
  @Min(1)
  @Max(10)
  score: number;

  @IsInt()
  @Min(0)
  orderIndex: number;
}
