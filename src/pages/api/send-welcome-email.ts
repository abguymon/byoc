import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { jsonResponse } from '../../lib/response.js';

const CITY_CONFIG = {
  boise: {
    label: 'Boise, ID',
    location: "Camel's Back Park",
    audienceEnvVar: 'RESEND_AUDIENCE_BOISE_ID',
  },
  slc: {
    label: 'Salt Lake City, UT',
    location: 'Sugar House Park',
    audienceEnvVar: 'RESEND_AUDIENCE_SLC_ID',
  },
} as const;

type City = keyof typeof CITY_CONFIG;

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: unknown; city?: unknown; contact_email?: string; ticket_price?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    return jsonResponse({ error: 'Invalid email' }, 400);
  }

  if (!body.city || !Object.keys(CITY_CONFIG).includes(body.city as string)) {
    return jsonResponse({ error: 'Invalid city selection' }, 400);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not configured');
    return jsonResponse({ error: 'Email service not configured' }, 500);
  }

  const city = body.city as City;
  const config = CITY_CONFIG[city];
  const resend = new Resend(apiKey);

  try {
    // Add contact to the city-specific Resend audience (if configured)
    const audienceId = import.meta.env[config.audienceEnvVar];
    if (audienceId) {
      await resend.contacts.create({
        email: body.email,
        unsubscribed: false,
        audienceId,
      });
    }

    // Send welcome email
    await resend.emails.send({
      from: 'BYO Cake Club <noreply@bringyourowncake.com>',
      to: [body.email],
      subject: `Welcome to BYO Cake Club - ${config.label}! 🎂`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #E6397F; text-align: center;">Welcome to BYO Cake Club! 🎂</h1>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #E6397F; margin-top: 0;">Your Event</h2>
            <p><strong>Location:</strong> ${config.location}, ${config.label}</p>
            <p><strong>Date:</strong> Spring 2026 — we'll email you once the date is confirmed!</p>
            <p><strong>Cost:</strong> ${body.ticket_price ?? '$10 per person'}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">What to Bring</h3>
            <p>Please bring your own cake creation to share! Homemade and decorated cakes are encouraged.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p>We're excited to see your delicious creations!</p>
            <p>Questions? Email us at <a href="mailto:${body.contact_email ?? 'bringyourowncake@gmail.com'}" style="color: #E6397F;">${body.contact_email ?? 'bringyourowncake@gmail.com'}</a></p>
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
