import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDiaryEntryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(96)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  emotionIds?: number[];
}

export class UpdateDiaryEntryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(96)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  emotionIds?: number[];
}
