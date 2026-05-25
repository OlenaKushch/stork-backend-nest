import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DiariesController } from './diaries.controller';
import { DiariesService } from './diaries.service';

@Module({
  imports: [PrismaModule],
  controllers: [DiariesController],
  providers: [DiariesService],
})
export class DiariesModule {}
