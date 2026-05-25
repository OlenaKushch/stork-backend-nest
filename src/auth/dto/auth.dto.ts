import {
  IsEmail,
  IsIn,
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
const DAY_MS = 24 * 60 * 60 * 1000;

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

@ValidatorConstraint({ name: 'DueDateRange', async: false })
class DueDateRangeConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    const dueDate = parseDateOnly(value);
    if (!dueDate) {
      return false;
    }

    const today = todayUtcDateOnly();
    const minDate = new Date(today.getTime() + 7 * DAY_MS);
    const maxDate = new Date(today.getTime() + 40 * 7 * DAY_MS);

    return dueDate >= minDate && dueDate <= maxDate;
  }

  defaultMessage(): string {
    return 'Due date must be between current date + 1 week and current date + 40 weeks';
  }
}

export type RegisterGender = 'boy' | 'girl';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  name: string;

  @IsEmail()
  @MaxLength(64)
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsIn(['boy', 'girl'], { message: 'Gender must be boy, girl or null' })
  gender?: RegisterGender | null;

  @IsOptional()
  @Matches(DATE_ONLY_PATTERN, { message: 'Due date format must be YYYY-MM-DD' })
  @Validate(DueDateRangeConstraint)
  dueDate?: string | null;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(64)
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  password: string;
}
