import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if request has body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse JSON with better error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const {
      email,
      event_date,
      event_location,
      event_time,
      contact_email,
      ticket_price,
    } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if we're in development mode (no API key)
    const apiKey = import.meta.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_your_api_key_here') {
      console.log('Development mode: Mocking email send for', email);
      return new Response(
        JSON.stringify({
          success: true,
          messageId: 'mock-' + Date.now(),
          message: 'Email would be sent in production',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Send welcome email using Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:
          import.meta.env.MAIL_FROM ||
          'BYO Cake Club <noreply@bringyourowncake.com>',
        to: [email],
        subject: 'Welcome to BYO Cake Club! 🎂',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #E6397F; text-align: center;">Welcome to BYO Cake Club! 🎂</h1>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #E6397F; margin-top: 0;">Event Details</h2>
              <p><strong>Date:</strong> ${event_date}</p>
              <p><strong>Location:</strong> ${event_location}</p>
              <p><strong>Time:</strong> ${event_time}</p>
              <p><strong>Cost:</strong> ${ticket_price}</p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">What to Bring</h3>
              <p>Please bring your own cake creation to share! Homemade and decorated cakes are encouraged.</p>
            </div>
            
            <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0c5460; margin-top: 0;">RSVP Required</h3>
              <p>Please email us at <a href="mailto:${contact_email}" style="color: #E6397F;">${contact_email}</a> to confirm your attendance so we can plan for numbers!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p>We're excited to see your delicious creations!</p>
              <p>Questions? Email us at <a href="mailto:${contact_email}" style="color: #E6397F;">${contact_email}</a></p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">Made with love and lots of sugar 🍰</p>
              <p style="color: #666; font-size: 12px;">© 2024 BYO Cake Club</p>
            </div>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error('Resend API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await resendResponse.json();
    console.log('Welcome email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
