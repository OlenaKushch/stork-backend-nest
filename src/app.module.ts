import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { WeeksModule } from './weeks/weeks.module';
import { DiariesModule } from './diaries/diaries.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { JourneyModule } from './journey/journey.module';
import { EmotionsModule } from './emotions/emotions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Базове вікно для rate limiting: 60 секунд. Сам ліміт вмикаємо точково
    // через ThrottlerGuard + @Throttle лише на чутливих auth-роутах.
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    // Вмикає cron-задачі (зокрема прибирання застарілих auth-сесій).
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    TasksModule,
    WeeksModule,
    DiariesModule,
    DashboardModule,
    JourneyModule,
    EmotionsModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
