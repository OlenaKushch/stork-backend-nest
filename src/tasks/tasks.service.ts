import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTaskDto,
  taskDateToDate,
  UpdateTaskStatusDto,
} from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        userId,
        name: dto.name,
        date: taskDateToDate(dto.date),
        isDone: dto.isDone ?? false,
      },
      select: this.taskSelect(),
    });
  }

  findAll(userId: number) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      select: this.taskSelect(),
    });
  }

  async updateStatus(userId: number, taskId: number, dto: UpdateTaskStatusDto) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { isDone: dto.isDone },
      select: this.taskSelect(),
    });
  }

  private taskSelect() {
    return {
      id: true,
      name: true,
      date: true,
      isDone: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
