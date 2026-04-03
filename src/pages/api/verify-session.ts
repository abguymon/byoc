import type { APIRoute } from 'astro';
import { verifySessionToken } from '../../lib/session.js';
import { jsonResponse } from '../../lib/response.js';

export const GET: APIRoute = async ({ request }) => {
  const cookie = request.headers.get('cookie');
  const token = cookie
    ?.split(';')
    .find(c => c.trim().startsWith('staff_session='))
    ?.split('=')[1];

  if (!token) return jsonResponse({ authenticated: false });

  const staffPassword = import.meta.env.STAFF_PASSWORD;
  if (!staffPassword) return jsonResponse({ authenticated: false });

  const session = verifySessionToken(token, staffPassword);
  if (!session) return jsonResponse({ authenticated: false });

  return jsonResponse({ authenticated: true, expires: session.expires });
};
