interface ReturningBoiseEmailOptions {
  checkoutUrlBoise?: string | null;
  checkoutUrlSlc?: string | null;
}

export function returningBoiseEmailHtml({ checkoutUrlBoise, checkoutUrlSlc }: ReturningBoiseEmailOptions = {}): string {
  const boiseButton = checkoutUrlBoise
    ? `<a href="${checkoutUrlBoise}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #52634c; color: #ffffff; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; border-radius: 6px;">Get Your Boise Ticket — $10</a>`
    : '';
  const slcButton = checkoutUrlSlc
    ? `<a href="${checkoutUrlSlc}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #52634c; color: #ffffff; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; border-radius: 6px;">Get SLC Ticket — $10</a>`
    : '';

  return `
    <style>@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@400;500;600&display=swap');</style>
    <div style="font-family: 'Work Sans', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fef9ed;">

      <div style="padding: 48px 40px 0; text-align: center;">
        <a href="https://bringyourowncake.com" style="font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #747870; text-decoration: none;">BYO Cake Club</a>
        <h1 style="font-family: 'Noto Serif', Georgia, serif; font-size: 34px; font-weight: 400; color: #1d1c15; margin: 0 0 8px; line-height: 1.2;">We're doing it again 🎂</h1>
        <p style="font-family: 'Noto Serif', Georgia, serif; font-style: italic; font-size: 18px; color: #7b5455; margin: 0 0 16px;">and we'd love to see you there</p>
        <div style="width: 40px; height: 2px; background-color: #7b5455; margin: 0 auto 32px;"></div>
      </div>

      <div style="padding: 0 40px 32px;">
        <p style="color: #1d1c15; font-size: 16px; line-height: 1.7; margin: 0 0 16px;">You came to our first cake picnic in Boise and made it everything we hoped it would be. The cakes were incredible, the energy was even better, and we've been thinking about round two ever since.</p>
        <p style="color: #1d1c15; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">We're heading back to Camels Back Park this June — same spirit, more cake. Bring something new, bring something classic, or just bring yourself.</p>

        <div style="background-color: #f8f3e7; padding: 24px; border-radius: 8px; margin: 0 0 16px; border: 1px solid #c4c8be; text-align: center;">
          <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #52634c; margin: 0 0 8px;">Boise — Round Two</p>
          <p style="font-family: 'Noto Serif', Georgia, serif; font-size: 22px; color: #1d1c15; margin: 0 0 4px;">June 27th, 2026</p>
          <p style="color: #444841; font-size: 15px; margin: 0;">Camels Back Park · Boise, ID</p>
          ${boiseButton}
        </div>

        <div style="background-color: #ede8dc; padding: 20px; border-radius: 8px; margin: 0 0 32px; border: 1px solid #c4c8be;">
          <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #52634c; margin: 0 0 8px;">Also coming to Salt Lake City</p>
          <p style="color: #1d1c15; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">This spring we're launching our first-ever SLC event at Sugarhouse Park on May 16th. If you know anyone in Salt Lake who would be into this, send them our way — we'd love to grow the community there too.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #1d1c15; margin-bottom: 4px;">
            <tr>
              <td style="padding: 2px 0; color: #747870; width: 60px;">When</td>
              <td style="padding: 2px 0;">May 16th, 2026</td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #747870;">Where</td>
              <td style="padding: 2px 0;">Sugarhouse Park · Salt Lake City, UT</td>
            </tr>
          </table>
          ${slcButton}
        </div>

        <p style="text-align: center; color: #444841; font-size: 14px; margin: 0 0 8px;">Find out more at <a href="https://bringyourowncake.com" style="color: #7b5455; text-decoration: none; font-weight: 500;">bringyourowncake.com</a></p>
        <p style="text-align: center; color: #747870; font-size: 13px; margin: 0;">Questions? Email us at <a href="mailto:bringyourowncake@gmail.com" style="color: #7b5455; text-decoration: none;">bringyourowncake@gmail.com</a></p>
      </div>

      <div style="text-align: center; padding: 24px 40px 40px; border-top: 1px solid #c4c8be; margin: 0 40px;">
        <p style="color: #747870; font-size: 13px; margin: 0 0 4px;">Made with love and lots of sugar 🍰</p>
        <p style="color: #747870; font-size: 12px; margin: 0;">© 2026 <a href="https://bringyourowncake.com" style="color: #747870; text-decoration: underline;">BYO Cake Club</a></p>
      </div>

    </div>
  `;
}
