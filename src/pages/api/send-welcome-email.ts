import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { welcomeEmailHtml } from '../../emails/welcome.js';
import { jsonResponse } from '../../lib/response.js';

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    return jsonResponse({ error: 'Invalid email' }, 400);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not configured');
    return jsonResponse({ error: 'Email service not configured' }, 500);
  }

  const resend = new Resend(apiKey);

  try {
    // Best-effort contact creation — don't let this block the welcome email
    resend.contacts.create({ email: body.email, unsubscribed: false }).catch((err) => {
      console.warn('Failed to add contact to Resend:', err);
    });

    // Send welcome email
    await resend.emails.send({
      from: 'BYO Cake Club <noreply@bringyourowncake.com>',
      to: [body.email],
      subject: 'Welcome to BYO Cake Club! 🎂',
      html: welcomeEmailHtml({
        checkoutUrlSlc: import.meta.env.STRIPE_CHECKOUT_URL_SLC,
        checkoutUrlBoise: import.meta.env.STRIPE_CHECKOUT_URL_BOISE,
      }),
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error in send-welcome-email:', error);
    return jsonResponse({ error: 'Failed to send email' }, 500);
  }
};
