import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { resolveJwtExpiresIn } from './jwt-expires.util';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  signAccessToken(userId: number, email: string, sessionId: number): string {
    const expiresIn = resolveJwtExpiresIn(
      this.config.get<string>('JWT_EXPIRES_IN'),
    );

    return this.jwtService.sign(
      { sub: userId, email, sid: sessionId },
      {
        secret: this.config.getOrThrow('JWT_SECRET'),
        expiresIn,
      },
    );
  }
}
