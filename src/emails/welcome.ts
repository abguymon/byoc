interface WelcomeEmailOptions {
  checkoutUrlSlc?: string | null;
  checkoutUrlBoise?: string | null;
}

export function welcomeEmailHtml({ checkoutUrlSlc, checkoutUrlBoise }: WelcomeEmailOptions = {}): string {
  const slcButton = checkoutUrlSlc
    ? `<a href="${checkoutUrlSlc}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #52634c; color: #ffffff; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; border-radius: 6px;">Get SLC Ticket — $10</a>`
    : '';
  const boiseButton = checkoutUrlBoise
    ? `<a href="${checkoutUrlBoise}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #52634c; color: #ffffff; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; border-radius: 6px;">Get Boise Ticket — $10</a>`
    : '';

  return `
    <style>@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@400;500;600&display=swap');</style>
    <div style="font-family: 'Work Sans', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fef9ed;">

      <div style="padding: 48px 40px 0; text-align: center;">
        <a href="https://bringyourowncake.com" style="font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #747870; text-decoration: none;">BYO Cake Club</a>
        <h1 style="font-family: 'Noto Serif', Georgia, serif; font-size: 34px; font-weight: 400; color: #1d1c15; margin: 0 0 16px; line-height: 1.2;">Welcome to the Club 🎂</h1>
        <div style="width: 40px; height: 2px; background-color: #7b5455; margin: 0 auto 32px;"></div>
      </div>

      <div style="padding: 0 40px 32px;">
        <p style="color: #1d1c15; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">Thanks for joining! We'll keep you in the loop on upcoming events, dates, and all things cake.</p>

        <div style="background-color: #f8f3e7; padding: 24px; border-radius: 8px; margin: 0 0 16px; border: 1px solid #c4c8be;">
          <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #52634c; margin: 0 0 16px;">Coming up in 2026</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 0 8px 0 0; vertical-align: top; width: 50%;">
                <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #747870; margin: 0 0 4px;">Salt Lake City, UT</p>
                <p style="color: #1d1c15; margin: 0 0 4px; font-size: 15px;">May 16th, 2026</p>
                <p style="color: #444841; margin: 0 0 2px; font-size: 13px;">Sugarhouse Park</p>
                <p style="color: #747870; margin: 0; font-size: 12px;">11:00am–2:00pm</p>
                ${slcButton}
              </td>
              <td style="padding: 0 0 0 8px; vertical-align: top; width: 50%;">
                <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #747870; margin: 0 0 4px;">Boise, ID</p>
                <p style="color: #1d1c15; margin: 0 0 4px; font-size: 15px;">June 27th, 2026</p>
                <p style="color: #444841; margin: 0 0 2px; font-size: 13px;">Camels Back Park</p>
                <p style="color: #747870; margin: 0; font-size: 12px;">11:00am–2:00pm</p>
                ${boiseButton}
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #d5e8cb; padding: 20px; border-radius: 8px; margin: 0 0 32px; border: 1px solid #b9ccb0;">
          <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #52634c; margin: 0 0 8px;">What to Bring</p>
          <p style="color: #1d1c15; margin: 0; font-size: 15px; line-height: 1.6;">Bring your own cake creation to share! Homemade and decorated cakes are encouraged.</p>
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
