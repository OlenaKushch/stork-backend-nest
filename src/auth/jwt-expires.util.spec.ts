import { resolveJwtExpiresIn } from './jwt-expires.util';

describe('resolveJwtExpiresIn', () => {
  it('defaults to 7 days when value is missing', () => {
    expect(resolveJwtExpiresIn(undefined)).toBe('7d');
  });

  it('accepts explicit time units', () => {
    expect(resolveJwtExpiresIn('24h')).toBe('24h');
    expect(resolveJwtExpiresIn('7d')).toBe('7d');
  });

  it('accepts large second values', () => {
    expect(resolveJwtExpiresIn('3600')).toBe(3600);
  });

  it('rejects short numeric values like 3 seconds', () => {
    expect(resolveJwtExpiresIn('3')).toBe('7d');
  });
});
