import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'a24s_dashboard';
const ttlSeconds = 60 * 60 * 12;
function signature(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}
export function isDashboardConfigured() { return Boolean(process.env.DASHBOARD_PASSWORD); }
export function makeSession(password: string) {
  const secret = process.env.DASHBOARD_PASSWORD;
  if (!secret || password !== secret) return false;
  const exp = String(Math.floor(Date.now() / 1000) + ttlSeconds);
  const payload = `${exp}`;
  return `${payload}.${signature(payload, secret)}`;
}
export function validSession(token?: string) {
  const secret = process.env.DASHBOARD_PASSWORD;
  if (!secret || !token) return false;
  const [exp, sig, extra] = token.split('.');
  if (!exp || !sig || extra || Number(exp) < Math.floor(Date.now() / 1000)) return false;
  const expected = signature(exp, secret);
  const a = Buffer.from(sig); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function dashboardCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: ttlSeconds };
}
export async function dashboardAuthorized() {
  return validSession((await cookies()).get(COOKIE)?.value);
}
export { COOKIE };
