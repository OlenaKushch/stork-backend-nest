import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DAY_MS = 24 * 60 * 60 * 1000;
const LAST_WEEK_NUMBER = 42;
const PREGNANCY_DURATION_DAYS = 280;

@Injectable()
export class JourneyService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeeks(userId: number) {
    const currentWeekNumber = await this.getCurrentWeekNumber(userId);

    return {
      currentWeekNumber,
      weeks: Array.from({ length: LAST_WEEK_NUMBER }, (_value, index) => {
        const weekNumber = index + 1;

        return {
          weekNumber,
          isCurrent: weekNumber === currentWeekNumber,
          isActive: weekNumber <= currentWeekNumber,
        };
      }),
    };
  }

  async getWeekDetails(userId: number, weekNumber: number) {
    await this.ensureWeekIsAvailable(userId, weekNumber);

    const [baby, mom, tasks] = await Promise.all([
      this.getBabyDevelopmentData(weekNumber),
      this.getMomBodyData(weekNumber),
      this.getTasks(userId),
    ]);

    return {
      weekNumber,
      baby,
      mom,
      tasksReminder: {
        tasks,
        hasActiveTasks: tasks.some((task) => !task.isDone),
      },
    };
  }

  async getBabyDevelopment(userId: number, weekNumber: number) {
    await this.ensureWeekIsAvailable(userId, weekNumber);
    return this.getBabyDevelopmentData(weekNumber);
  }

  async getMomBody(userId: number, weekNumber: number) {
    await this.ensureWeekIsAvailable(userId, weekNumber);
    return this.getMomBodyData(weekNumber);
  }

  private async getBabyDevelopmentData(weekNumber: number) {
    const babyState = await this.prisma.babyState.findUnique({
      where: { weekNumber },
      select: {
        weekNumber: true,
        image: true,
        analogy: true,
        babySize: true,
        babyWeight: true,
        babyActivity: true,
        babyDevelopment: true,
        interestingFact: true,
      },
    });

    if (!babyState) {
      throw new NotFoundException('Baby development info not found');
    }

    return babyState;
  }

  private async getMomBodyData(weekNumber: number) {
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

  private getTasks(userId: number) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        date: true,
        isDone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  private async ensureWeekIsAvailable(
    userId: number,
    weekNumber: number,
  ): Promise<void> {
    this.assertWeekNumber(weekNumber);

    const currentWeekNumber = await this.getCurrentWeekNumber(userId);
    if (weekNumber > currentWeekNumber) {
      throw new ForbiddenException('Future weeks are not available yet');
    }
  }

  private async getCurrentWeekNumber(userId: number): Promise<number> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { dueDate: true },
    });

    if (!profile?.dueDate) {
      return 1;
    }

    const daysToBirth = Math.max(
      0,
      Math.ceil((profile.dueDate.getTime() - this.todayUtc().getTime()) / DAY_MS),
    );
    const pregnancyDay = PREGNANCY_DURATION_DAYS - daysToBirth;

    return this.clampWeek(Math.ceil(pregnancyDay / 7));
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
