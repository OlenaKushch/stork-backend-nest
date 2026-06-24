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

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  emotionIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  emotions?: string[];
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
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  emotionIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  emotions?: string[];
}

export type NormalizedDiaryInput = {
  title: string;
  content: string;
  emotionIds?: number[];
};

export function parseEmotionIds(
  emotionIds?: number[],
  emotions?: string[],
): number[] | undefined {
  if (emotionIds !== undefined) {
    return emotionIds;
  }

  if (emotions !== undefined) {
    if (emotions.length === 0) {
      return [];
    }

    const parsed = emotions.map((value) => Number(value));

    if (parsed.some((value) => !Number.isInteger(value) || value < 1)) {
      return undefined;
    }

    return parsed;
  }

  return undefined;
}

export function normalizeCreateDiaryInput(
  dto: CreateDiaryEntryDto,
): NormalizedDiaryInput {
  const content = dto.content?.trim() || dto.description?.trim();

  if (!content) {
    throw new Error('Content is required');
  }

  return {
    title: dto.title.trim(),
    content,
    emotionIds: parseEmotionIds(dto.emotionIds, dto.emotions),
  };
}

export function normalizeUpdateDiaryInput(
  dto: UpdateDiaryEntryDto,
): Partial<NormalizedDiaryInput> {
  const content = dto.content?.trim() || dto.description?.trim();
  const emotionIds =
    dto.emotionIds !== undefined || dto.emotions !== undefined
      ? parseEmotionIds(dto.emotionIds, dto.emotions)
      : undefined;

  return {
    ...(dto.title !== undefined && { title: dto.title.trim() }),
    ...(content !== undefined && { content }),
    ...(emotionIds !== undefined && { emotionIds }),
  };
}
