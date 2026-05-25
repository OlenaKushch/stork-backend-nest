import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WeeksController } from './weeks.controller';
import { WeeksService } from './weeks.service';

@Module({
  imports: [PrismaModule],
  controllers: [WeeksController],
  providers: [WeeksService],
})
export class WeeksModule {}
