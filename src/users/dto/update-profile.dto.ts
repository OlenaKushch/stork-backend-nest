import { Gender } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Child gender must be MALE, FEMALE or UNKNOWN' })
  childGender?: Gender;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date. Format: YYYY-MM-DD' })
  dueDate?: string;
}
