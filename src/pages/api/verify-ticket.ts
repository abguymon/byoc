import type { APIRoute } from 'astro';
import { getTicketByCode } from '../../lib/db.js';
import { jsonResponse } from '../../lib/response.js';

export const POST: APIRoute = async ({ request }) => {
  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  if (!body.code || typeof body.code !== 'string') {
    return jsonResponse({ error: 'Ticket code is required' }, 400);
  }

  const code = body.code.trim().toUpperCase();
  if (!code.startsWith('TCKT-')) {
    return jsonResponse({ error: 'Invalid ticket code format' }, 400);
  }

  try {
    const ticket = await getTicketByCode(code);
    if (!ticket) return jsonResponse({ error: 'Ticket not found' }, 404);
    return jsonResponse({ success: true, ticket });
  } catch (err) {
    console.error('Error verifying ticket:', err);
    return jsonResponse({ error: 'Database error occurred' }, 500);
  }
};
