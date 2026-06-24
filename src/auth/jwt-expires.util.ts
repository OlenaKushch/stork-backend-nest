import type { SignOptions } from 'jsonwebtoken';

const DEFAULT_JWT_EXPIRES_IN: SignOptions['expiresIn'] = '7d';

export function resolveJwtExpiresIn(
  value: string | undefined,
): SignOptions['expiresIn'] {
  if (!value?.trim()) {
    return DEFAULT_JWT_EXPIRES_IN;
  }

  const trimmed = value.trim();

  if (/^\d+[smhdwy]$/i.test(trimmed)) {
    return trimmed as SignOptions['expiresIn'];
  }

  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed);

    if (seconds >= 3600) {
      return seconds;
    }
  }

  return DEFAULT_JWT_EXPIRES_IN;
}
