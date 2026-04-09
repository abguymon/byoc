interface TicketEmailOptions {
  firstName: string | null;
  lastName: string | null;
  email: string;
  code: string;
  quantity: number;
  city: 'boise' | 'slc' | null;
  contactEmail?: string;
}

const EVENT_DETAILS = {
  slc: { name: 'Salt Lake City, UT', date: 'May 16th, 2026', location: 'Sugarhouse Park' },
  boise: { name: 'Boise, ID', date: 'June 27th, 2026', location: 'Camels Back Park' },
} as const;

export function ticketEmailHtml({ firstName, lastName, email, code, quantity, city, contactEmail }: TicketEmailOptions): string {
  const contact = contactEmail || 'contact@bringyourowncake.com';
  const event = city ? EVENT_DETAILS[city] : null;

  const eventBlock = event ? `
        <div style="background-color: #f8f3e7; padding: 24px; border-radius: 8px; margin: 0 0 16px; border: 1px solid #c4c8be;">
          <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #52634c; margin: 0 0 12px;">Event Details</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px; color: #1d1c15;">
            <tr><td style="padding: 4px 0; color: #747870; width: 80px;">Where</td><td style="padding: 4px 0;"><strong>${event.name}</strong> · ${event.location}</td></tr>
            <tr><td style="padding: 4px 0; color: #747870;">When</td><td style="padding: 4px 0;">${event.date}</td></tr>
          </table>
        </div>` : '';

  return `
    <style>@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@400;500;600&display=swap');</style>
    <div style="font-family: 'Work Sans', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fef9ed;">

      <div style="padding: 48px 40px 0; text-align: center;">
        <a href="https://bringyourowncake.com" style="font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #747870; text-decoration: none;">BYO Cake Club</a>
        <h1 style="font-family: 'Noto Serif', Georgia, serif; font-size: 34px; font-weight: 400; color: #1d1c15; margin: 0 0 16px; line-height: 1.2;">Your Ticket 🎂</h1>
        <div style="width: 40px; height: 2px; background-color: #7b5455; margin: 0 auto 32px;"></div>
      </div>

      <div style="padding: 0 40px 32px;">
        <p style="color: #1d1c15; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">Hello ${firstName ?? 'there'}, your ticket has been confirmed — we can't wait to see your creation!</p>

        <div style="background-color: #ede8dc; padding: 24px; border-radius: 8px; margin: 0 0 16px; border: 1px solid #c4c8be; text-align: center;">
          <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #52634c; margin: 0 0 12px;">Your Ticket Code</p>
          <p style="font-family: 'Noto Serif', Georgia, serif; font-size: 26px; font-weight: 700; color: #1d1c15; margin: 0 0 16px; letter-spacing: 0.05em;">${code}</p>
          <p style="font-size: 14px; color: #444841; margin: 0; line-height: 1.6;">Your QR code is attached — present it at the gate for entry.</p>
        </div>

        ${eventBlock}

        <div style="background-color: #ede8dc; padding: 20px; border-radius: 8px; margin: 0 0 16px; border: 1px solid #c4c8be;">
          <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #52634c; margin: 0 0 12px;">Ticket Details</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px; color: #1d1c15;">
            <tr><td style="padding: 4px 0; color: #747870; width: 120px;">Code</td><td style="padding: 4px 0;">${code}</td></tr>
            <tr><td style="padding: 4px 0; color: #747870;">Quantity</td><td style="padding: 4px 0;">${quantity}</td></tr>
            ${firstName ? `<tr><td style="padding: 4px 0; color: #747870;">Name</td><td style="padding: 4px 0;">${firstName}${lastName ? ` ${lastName}` : ''}</td></tr>` : ''}
            <tr><td style="padding: 4px 0; color: #747870;">Email</td><td style="padding: 4px 0;">${email}</td></tr>
          </table>
        </div>

        <div style="background-color: #d5e8cb; padding: 20px; border-radius: 8px; margin: 0 0 32px; border: 1px solid #b9ccb0;">
          <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #52634c; margin: 0 0 8px;">What to Bring</p>
          <p style="color: #1d1c15; margin: 0; font-size: 15px; line-height: 1.6;">Bring your own cake creation to share! Homemade and decorated cakes are encouraged.</p>
        </div>

        <p style="text-align: center; color: #444841; font-size: 14px; margin: 0 0 8px;">Find out more at <a href="https://bringyourowncake.com" style="color: #7b5455; text-decoration: none; font-weight: 500;">bringyourowncake.com</a></p>
        <p style="text-align: center; color: #747870; font-size: 13px; margin: 0;">Questions? Email us at <a href="mailto:${contact}" style="color: #7b5455; text-decoration: none;">${contact}</a></p>
      </div>

      <div style="text-align: center; padding: 24px 40px 40px; border-top: 1px solid #c4c8be; margin: 0 40px;">
        <p style="color: #747870; font-size: 13px; margin: 0 0 4px;">Made with love and lots of sugar 🍰</p>
        <p style="color: #747870; font-size: 12px; margin: 0;">© 2026 <a href="https://bringyourowncake.com" style="color: #747870; text-decoration: underline;">BYO Cake Club</a></p>
      </div>

    </div>
  `;
}
