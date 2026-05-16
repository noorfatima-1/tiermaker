import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}
