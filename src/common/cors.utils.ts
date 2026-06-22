function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, '');
}

export function getAllowedOrigins(): string[] {
  const raw = process.env.FRONTEND_URL;
  if (!raw) {
    return [];
  }

  return raw.split(',').map(normalizeOrigin).filter(Boolean);
}

export function createCorsOriginValidator() {
  const allowedOrigins = getAllowedOrigins();

  return (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.length === 0) {
      callback(new Error('FRONTEND_URL is not configured'), false);
      return;
    }

    if (allowedOrigins.includes(normalizeOrigin(origin))) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
  };
}
