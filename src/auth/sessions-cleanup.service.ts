import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

// Скільки тримаємо невідкликану сесію в БД. Беремо із запасом понад звичайний
// строк життя токена (7 днів), щоб збільшення JWT_EXPIRES_IN не вилогінювало
// активних користувачів. Прострочені токени все одно відхиляються passport-jwt.
const SESSION_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class SessionsCleanupService {
  private readonly logger = new Logger(SessionsCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async removeStaleSessions(): Promise<void> {
    const cutoff = new Date(Date.now() - SESSION_RETENTION_MS);

    const { count } = await this.prisma.authSession.deleteMany({
      where: {
        OR: [
          // Відкликані сесії: їхні токени вже відхиляються — це чисте сміття.
          { revokedAt: { not: null } },
          // Старі сесії: відповідний JWT давно прострочений.
          { createdAt: { lt: cutoff } },
        ],
      },
    });

    if (count > 0) {
      this.logger.log(`Removed ${count} stale auth session(s).`);
    }
  }
}
