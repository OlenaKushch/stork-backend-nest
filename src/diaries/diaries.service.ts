import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiaryEntryDto, UpdateDiaryEntryDto } from './dto/diary-entry.dto';

@Injectable()
export class DiariesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateDiaryEntryDto) {
    await this.ensureEmotionIdsExist(dto.emotionIds);

    const entry = await this.prisma.diaryEntry.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content,
        emotions: this.buildEmotionCreateData(dto.emotionIds),
      },
      select: this.entrySelect(),
    });

    return this.formatEntry(entry);
  }

  async findAll(userId: number) {
    const entries = await this.prisma.diaryEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: this.entrySelect(),
    });

    return entries.map((entry) => this.formatEntry(entry));
  }

  async findOne(userId: number, entryId: number) {
    const entry = await this.prisma.diaryEntry.findFirst({
      where: { id: entryId, userId },
      select: this.entrySelect(),
    });

    if (!entry) {
      throw new NotFoundException('Diary entry not found');
    }

    return this.formatEntry(entry);
  }

  async update(userId: number, entryId: number, dto: UpdateDiaryEntryDto) {
    await this.ensureEntryBelongsToUser(userId, entryId);
    await this.ensureEmotionIdsExist(dto.emotionIds);

    const entry = await this.prisma.$transaction(async (tx) => {
      if (dto.emotionIds !== undefined) {
        await tx.diaryEntryEmotion.deleteMany({
          where: { diaryEntryId: entryId },
        });

        if (dto.emotionIds.length > 0) {
          await tx.diaryEntryEmotion.createMany({
            data: dto.emotionIds.map((emotionId) => ({
              diaryEntryId: entryId,
              emotionId,
            })),
          });
        }
      }

      return tx.diaryEntry.update({
        where: { id: entryId },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.content !== undefined && { content: dto.content }),
        },
        select: this.entrySelect(),
      });
    });

    return this.formatEntry(entry);
  }

  async remove(userId: number, entryId: number) {
    await this.ensureEntryBelongsToUser(userId, entryId);

    await this.prisma.diaryEntry.delete({
      where: { id: entryId },
    });

    return { message: 'Diary entry deleted successfully' };
  }

  private async ensureEntryBelongsToUser(
    userId: number,
    entryId: number,
  ): Promise<void> {
    const entry = await this.prisma.diaryEntry.findFirst({
      where: { id: entryId, userId },
      select: { id: true },
    });

    if (!entry) {
      throw new NotFoundException('Diary entry not found');
    }
  }

  private async ensureEmotionIdsExist(emotionIds?: number[]): Promise<void> {
    if (!emotionIds || emotionIds.length === 0) {
      return;
    }

    const count = await this.prisma.emotion.count({
      where: { id: { in: emotionIds } },
    });

    if (count !== emotionIds.length) {
      throw new BadRequestException('One or more emotions do not exist');
    }
  }

  private buildEmotionCreateData(
    emotionIds?: number[],
  ): Prisma.DiaryEntryEmotionCreateNestedManyWithoutDiaryEntryInput | undefined {
    if (!emotionIds || emotionIds.length === 0) {
      return undefined;
    }

    return {
      create: emotionIds.map((emotionId) => ({
        emotion: { connect: { id: emotionId } },
      })),
    };
  }

  private entrySelect() {
    return {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      emotions: {
        select: {
          emotion: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    };
  }

  private formatEntry(entry: Prisma.DiaryEntryGetPayload<{
    select: ReturnType<DiariesService['entrySelect']>;
  }>) {
    return {
      id: entry.id,
      title: entry.title,
      content: entry.content,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      emotions: entry.emotions.map(({ emotion }) => emotion),
    };
  }
}
