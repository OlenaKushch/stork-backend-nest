import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDiaryEntryDto, UpdateDiaryEntryDto } from './dto/diary-entry.dto';
import { DiariesService } from './diaries.service';

@Controller('diaries')
@UseGuards(JwtAuthGuard)
export class DiariesController {
  constructor(private readonly diariesService: DiariesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: { id: number },
    @Body() dto: CreateDiaryEntryDto,
  ) {
    return this.diariesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { id: number }) {
    return this.diariesService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) entryId: number,
  ) {
    return this.diariesService.findOne(user.id, entryId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) entryId: number,
    @Body() dto: UpdateDiaryEntryDto,
  ) {
    return this.diariesService.update(user.id, entryId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) entryId: number,
  ) {
    return this.diariesService.remove(user.id, entryId);
  }
}
