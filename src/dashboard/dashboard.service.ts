import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const LAST_WEEK_NUMBER = 42;
const PREGNANCY_DURATION_DAYS = 280;

type CurrentUser = { id: number; email: string } | null;
type DashboardTask = {
  id: number;
  name: string;
  date: Date;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(user: CurrentUser, query: DashboardQueryDto) {
    const profile = user
      ? await this.prisma.profile.findUnique({
          where: { userId: user.id },
          select: {
            name: true,
            dueDate: true,
            avatarUrl: true,
            user: { select: { email: true } },
          },
        })
      : null;

    const pregnancy = this.calculatePregnancyState(
      profile?.dueDate ? this.toDateOnlyString(profile.dueDate) : query.dueDate,
      query.weekNumber,
    );

    const [babyState, tasks] = await Promise.all([
      this.prisma.babyState.findUnique({
        where: { weekNumber: pregnancy.weekNumber },
        select: {
          analogy: true,
          babySize: true,
          babyWeight: true,
          image: true,
          babyActivity: true,
          momDailyTips: true,
        },
      }),
      user
        ? this.prisma.task.findMany({
            where: { userId: user.id },
            orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
            select: {
              id: true,
              name: true,
              date: true,
              isDone: true,
              createdAt: true,
              updatedAt: true,
            },
          })
        : Promise.resolve([] as DashboardTask[]),
    ]);

    if (!babyState) {
      throw new NotFoundException('Dashboard week info not found');
    }

    const name = profile?.name ?? null;

    return {
      user: user
        ? {
            name,
            email: profile?.user.email ?? user.email,
            avatarUrl: profile?.avatarUrl ?? null,
          }
        : null,
      greeting: {
        name,
        text: name ? `Вітаю, ${name}!` : 'Вітаю!',
      },
      status: {
        weekNumber: pregnancy.weekNumber,
        pregnancyTerm: `${pregnancy.weekNumber} тиждень`,
        daysToBirth: pregnancy.daysToBirth,
        countdownText: `Залишилось ${pregnancy.daysToBirth} днів до зустрічі`,
      },
      babyToday: {
        image: babyState.image,
        analogy: babyState.analogy,
        babySize: babyState.babySize,
        babyWeight: babyState.babyWeight,
        sizeText: babyState.analogy
          ? `Ваш малюк зараз розміром з ${babyState.analogy}`
          : null,
        achievement: babyState.babyActivity,
      },
      momTip: {
        text: this.pickMomTip(babyState.momDailyTips),
      },
      tasksReminder: {
        tasks,
        hasActiveTasks: tasks.some((task) => !task.isDone),
      },
      feelingCheck: {
        question: 'Як ви себе почуваєте?',
        recommendation:
          'Рекомендація на сьогодні: Занотуйте незвичні відчуття у тілі.',
      },
    };
  }

  private calculatePregnancyState(dueDate?: string, weekNumber?: number) {
    if (dueDate) {
      const due = this.parseDateOnly(dueDate);
      const daysToBirth = Math.max(
        0,
        Math.ceil((due.getTime() - this.todayUtc().getTime()) / DAY_MS),
      );
      const pregnancyDay = PREGNANCY_DURATION_DAYS - daysToBirth;
      const calculatedWeek = Math.ceil(pregnancyDay / 7);

      return {
        weekNumber: this.clampWeek(calculatedWeek),
        daysToBirth,
      };
    }

    const fallbackWeek = this.clampWeek(weekNumber ?? 1);

    return {
      weekNumber: fallbackWeek,
      daysToBirth: (LAST_WEEK_NUMBER - fallbackWeek) * 7,
    };
  }

  private pickMomTip(value: unknown): string | null {
    if (!Array.isArray(value) || value.length === 0) {
      return null;
    }

    const dayIndex = Math.floor(this.todayUtc().getTime() / DAY_MS);
    return String(value[dayIndex % value.length]);
  }

  private parseDateOnly(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

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
}
