import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export function createSessionToken(secret: string): string {
  const payload = JSON.stringify({ expires: Date.now() + SESSION_DURATION_MS });
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(
  token: string,
  secret: string
): { expires: number } | null {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;

  const encoded = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  const expected = createHmac('sha256', secret).update(encoded).digest('base64url');

  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(provided, 'utf8'), Buffer.from(expected, 'utf8'))) return null;

  try {
    const data = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    if (!data.expires || data.expires < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}
