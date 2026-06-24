import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const emotions = await this.prisma.emotion.findMany({
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
      },
    });

    return emotions.map((emotion) => ({
      _id: String(emotion.id),
      title: emotion.title,
      isActive: true,
    }));
  }
}
