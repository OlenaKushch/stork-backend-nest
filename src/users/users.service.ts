import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getProfile(userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        name: true,
        childGender: true,
        dueDate: true,
        avatarUrl: true,
        updatedAt: true,
        user: { select: { id: true, email: true } },
      },
    });

    if (!profile) throw new NotFoundException('Профіль не знайдено');

    return {
      id: profile.user.id,
      email: profile.user.email,
      name: profile.name,
      childGender: profile.childGender,
      dueDate: profile.dueDate,
      avatarUrl: profile.avatarUrl,
      updatedAt: profile.updatedAt,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    await this.ensureProfileExists(userId);

    const updated = await this.prisma.profile.update({
      where: { userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.childGender !== undefined && { childGender: dto.childGender }),
        ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
      },
      select: {
        name: true,
        childGender: true,
        dueDate: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async uploadAvatar(
    userId: number,
    buffer: Buffer,
  ): Promise<{ avatarUrl: string }> {
    await this.ensureProfileExists(userId);

    const existing = await this.prisma.profile.findUnique({
      where: { userId },
      select: { avatarPublicId: true },
    });

    // 1. Спочатку завантажуємо нове фото. Якщо це впаде — старе фото та
    // запис у БД лишаються недоторканими (fail-safe).
    const result = await this.cloudinary.uploadStream(buffer, {
      folder: 'avatars',
      public_id: `user_${userId}`,
    });

    // 2. Лише після успішного завантаження оновлюємо БД.
    await this.prisma.profile.update({
      where: { userId },
      data: {
        avatarUrl: result.secure_url,
        avatarPublicId: result.public_id,
      },
    });

    // 3. Чистимо старий ассет тільки якщо його id відрізняється від нового.
    // public_id детермінований і overwrite:true вже перезаписав старе фото,
    // тож видалення за однакового id стерло б щойно завантажений аватар.
    if (
      existing?.avatarPublicId &&
      existing.avatarPublicId !== result.public_id
    ) {
      await this.cloudinary.delete(existing.avatarPublicId).catch(() => null);
    }

    return { avatarUrl: result.secure_url };
  }

  async deleteAvatar(userId: number): Promise<{ message: string }> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { avatarPublicId: true },
    });

    if (profile?.avatarPublicId) {
      await this.cloudinary.delete(profile.avatarPublicId).catch(() => null);
    }

    await this.prisma.profile.update({
      where: { userId },
      data: { avatarUrl: null, avatarPublicId: null },
    });

    return { message: 'Фото видалено' };
  }

  private async ensureProfileExists(userId: number): Promise<void> {
    const exists = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!exists) throw new NotFoundException('Профіль не знайдено');
  }
}
