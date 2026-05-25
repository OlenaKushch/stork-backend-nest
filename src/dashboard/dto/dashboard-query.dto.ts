import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class DashboardQueryDto {
  @IsOptional()
  @Matches(DATE_ONLY_PATTERN, { message: 'Due date format must be YYYY-MM-DD' })
  @IsDateString({}, { message: 'Invalid due date' })
  dueDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(42)
  weekNumber?: number;
}
