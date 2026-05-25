import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  signAccessToken(userId: number, email: string, sessionId: number): string {
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '7d');

    return this.jwtService.sign(
      { sub: userId, email, sid: sessionId },
      {
        secret: this.config.getOrThrow('JWT_SECRET'),
        expiresIn: expiresIn as SignOptions['expiresIn'],
      },
    );
  }
}
