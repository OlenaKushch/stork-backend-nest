import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { clearAuthCookies, setAccessCookie } from '../common/cookie-utils';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(dto);
    setAccessCookie(res, tokens.accessToken, this.configService);
    return tokens;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);
    setAccessCookie(res, tokens.accessToken, this.configService);
    return tokens;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: { id: number; email: string; sessionId: number },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(user);
    clearAuthCookies(res, this.configService);
    return result;
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: { id: number; email: string; sessionId: number },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refresh(user);
    setAccessCookie(res, tokens.accessToken, this.configService);
    return tokens;
  }
}
