import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Gender } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, RegisterGender } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { TokenService } from './token.service';

type AuthTokens = { accessToken: string };
type AuthenticatedUser = { id: number; email: string; sessionId: number };

const profileGenderMap: Record<RegisterGender, Gender> = {
  boy: Gender.MALE,
  girl: Gender.FEMALE,
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const email = dto.email.toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        profile: {
          create: {
            name: dto.name,
            ...(dto.gender && { childGender: profileGenderMap[dto.gender] }),
            ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
          },
        },
      },
      select: { id: true, email: true },
    });

    return this.issueToken(user.id, user.email);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueToken(user.id, user.email);
  }

  refresh(user: AuthenticatedUser): Promise<AuthTokens> {
    return this.issueToken(user.id, user.email, user.sessionId);
  }

  async logout(user: AuthenticatedUser): Promise<{ message: string }> {
    await this.prisma.authSession.updateMany({
      where: {
        id: user.sessionId,
        userId: user.id,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logged out successfully' };
  }

  private async issueToken(
    userId: number,
    email: string,
    sessionId?: number,
  ): Promise<AuthTokens> {
    const session =
      sessionId !== undefined
        ? { id: sessionId }
        : await this.prisma.authSession.create({
            data: { userId },
            select: { id: true },
          });
    const accessToken = this.tokenService.signAccessToken(
      userId,
      email,
      session.id,
    );

    return { accessToken };
  }
}
