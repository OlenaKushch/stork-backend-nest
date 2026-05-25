import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JourneyController } from './journey.controller';
import { JourneyService } from './journey.service';

@Module({
  imports: [PrismaModule],
  controllers: [JourneyController],
  providers: [JourneyService],
})
export class JourneyModule {}
