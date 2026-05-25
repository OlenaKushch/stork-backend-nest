import type { Response } from 'express';
import type { ConfigService } from '@nestjs/config';

const ACCESS_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 днів

export function getBaseCookieOptions(config: ConfigService) {
  const isProd = config.get('NODE_ENV') === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
  };
}

export function setAccessCookie(
  res: Response,
  token: string,
  config: ConfigService,
): void {
  res.cookie('accessToken', token, {
    ...getBaseCookieOptions(config),
    maxAge: ACCESS_TOKEN_TTL_MS,
  });
}

export function clearAuthCookies(res: Response, config: ConfigService): void {
  const opts = getBaseCookieOptions(config);
  res.clearCookie('accessToken', opts);
}
