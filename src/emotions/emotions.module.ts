import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmotionsController } from './emotions.controller';
import { EmotionsService } from './emotions.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmotionsController],
  providers: [EmotionsService],
})
export class EmotionsModule {}
