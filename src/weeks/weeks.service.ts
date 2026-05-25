import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WeekQueryDto } from './dto/week-query.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const LAST_WEEK_NUMBER = 42;
const PREGNANCY_DURATION_DAYS = 280;

type WeekCalculation = {
  weekNumber: number;
  daysToBirth: number;
};

@Injectable()
export class WeeksService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicDashboard(query: WeekQueryDto) {
    const calculation = this.calculateWeek(query);
    return this.getDashboard(calculation);
  }

  async getPrivateDashboard(userId: number, query: WeekQueryDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { dueDate: true },
    });

    const calculation = this.calculateWeek({
      ...query,
      dueDate: profile?.dueDate
        ? this.toDateOnlyString(profile.dueDate)
        : query.dueDate,
    });

    return this.getDashboard(calculation);
  }

  async getBabyDevelopment(weekNumber: number) {
    this.assertWeekNumber(weekNumber);

    const babyState = await this.prisma.babyState.findUnique({
      where: { weekNumber },
      select: {
        weekNumber: true,
        babyDevelopment: true,
        babyActivity: true,
        interestingFact: true,
        image: true,
      },
    });

    if (!babyState) {
      throw new NotFoundException('Baby development info not found');
    }

    return babyState;
  }

  async getMomBody(weekNumber: number) {
    this.assertWeekNumber(weekNumber);

    const momState = await this.prisma.momState.findUnique({
      where: { weekNumber },
      select: {
        weekNumber: true,
        feelings: true,
        comfortTips: true,
      },
    });

    if (!momState) {
      throw new NotFoundException('Mom body info not found');
    }

    return momState;
  }

  private async getDashboard(calculation: WeekCalculation) {
    const babyState = await this.prisma.babyState.findUnique({
      where: { weekNumber: calculation.weekNumber },
      select: {
        weekNumber: true,
        analogy: true,
        babySize: true,
        babyWeight: true,
        image: true,
        babyActivity: true,
        momDailyTips: true,
      },
    });

    if (!babyState) {
      throw new NotFoundException('Week info not found');
    }

    const momDailyTips = Array.isArray(babyState.momDailyTips)
      ? babyState.momDailyTips
      : [];

    return {
      weekNumber: calculation.weekNumber,
      daysToBirth: calculation.daysToBirth,
      baby: {
        analogy: babyState.analogy,
        babySize: babyState.babySize,
        babyWeight: babyState.babyWeight,
        image: babyState.image,
        activity: babyState.babyActivity,
      },
      momTip: momDailyTips[0] ?? null,
    };
  }

  private calculateWeek(query: WeekQueryDto): WeekCalculation {
    if (query.dueDate) {
      const dueDate = this.parseDateOnly(query.dueDate);
      const daysToBirth = Math.ceil(
        (dueDate.getTime() - this.todayUtc().getTime()) / DAY_MS,
      );
      const pregnancyDay = PREGNANCY_DURATION_DAYS - daysToBirth;
      const weekNumber = this.clampWeek(Math.ceil(pregnancyDay / 7));

      return { weekNumber, daysToBirth };
    }

    if (query.weekNumber) {
      this.assertWeekNumber(query.weekNumber);
      return {
        weekNumber: query.weekNumber,
        daysToBirth: (LAST_WEEK_NUMBER - query.weekNumber) * 7,
      };
    }

    throw new BadRequestException('Due date or week number is required');
  }

  private parseDateOnly(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new BadRequestException('Invalid due date');
    }

    return date;
  }

  private toDateOnlyString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private todayUtc(): Date {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }

  private clampWeek(weekNumber: number): number {
    return Math.min(Math.max(weekNumber, 1), LAST_WEEK_NUMBER);
  }

  private assertWeekNumber(weekNumber: number): void {
    if (weekNumber < 1 || weekNumber > LAST_WEEK_NUMBER) {
      throw new BadRequestException('Week number must be between 1 and 42');
    }
  }
}
