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

    // Видалити старе фото з Cloudinary якщо є
    if (existing?.avatarPublicId) {
      await this.cloudinary.delete(existing.avatarPublicId).catch(() => null);
    }

    const result = await this.cloudinary.uploadStream(buffer, {
      folder: 'avatars',
      public_id: `user_${userId}`,
    });

    await this.prisma.profile.update({
      where: { userId },
      data: {
        avatarUrl: result.secure_url,
        avatarPublicId: result.public_id,
      },
    });

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
