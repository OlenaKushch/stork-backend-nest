import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateOnly(value: string): Date | null {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function todayUtcDateOnly(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

@ValidatorConstraint({ name: 'TaskDateMinToday', async: false })
class TaskDateMinTodayConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    const date = parseDateOnly(value);
    return !!date && date >= todayUtcDateOnly();
  }

  defaultMessage(): string {
    return 'Date must be current date or later';
  }
}

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(96)
  name: string;

  @Matches(DATE_ONLY_PATTERN, { message: 'Date format must be YYYY-MM-DD' })
  @Validate(TaskDateMinTodayConstraint)
  date: string;

  @IsOptional()
  @IsBoolean()
  isDone?: boolean = false;
}

export class UpdateTaskStatusDto {
  @IsBoolean()
  isDone: boolean;
}

export function taskDateToDate(value: string): Date {
  return parseDateOnly(value) ?? new Date(value);
}
