import type { APIRoute } from 'astro';
import { createSessionToken } from '../../lib/session.js';
import { jsonResponse } from '../../lib/response.js';

export const POST: APIRoute = async ({ request }) => {
  let body: { password?: unknown; logout?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  if (body.logout) {
    return jsonResponse(
      { success: true },
      200,
      { 'Set-Cookie': 'staff_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/' }
    );
  }

  if (!body.password || typeof body.password !== 'string') {
    return jsonResponse({ error: 'Password is required' }, 400);
  }

  const staffPassword = import.meta.env.STAFF_PASSWORD;
  if (!staffPassword) {
    console.error('STAFF_PASSWORD environment variable not set');
    return jsonResponse({ error: 'Server configuration error' }, 500);
  }

  if (body.password !== staffPassword) {
    return jsonResponse({ error: 'Invalid password' }, 401);
  }

  const token = createSessionToken(staffPassword);
  return jsonResponse(
    { success: true },
    200,
    { 'Set-Cookie': `staff_session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=28800; Path=/` }
  );
};
