import type { APIRoute } from 'astro';
import { Resend } from 'resend';
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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #E6397F; text-align: center;">Welcome to BYO Cake Club! 🎂</h1>

          <p>Thanks for joining! We'll keep you in the loop on upcoming events, dates, and all things cake.</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #E6397F; margin-top: 0;">Coming up in 2026</h2>
            <p><strong>Salt Lake City</strong> — May 16th at Sugarhouse Park</p>
            <p><strong>Boise</strong> — June 27th at Camels Back Park</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">What to Bring</h3>
            <p>Bring your own cake creation to share! Homemade and decorated cakes are encouraged.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p>Questions? Email us at <a href="mailto:bringyourowncake@gmail.com" style="color: #E6397F;">bringyourowncake@gmail.com</a></p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">Made with love and lots of sugar 🍰</p>
            <p style="color: #666; font-size: 12px;">© 2026 BYO Cake Club</p>
          </div>
        </div>
      `,
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error in send-welcome-email:', error);
    return jsonResponse({ error: 'Failed to send email' }, 500);
  }
};
