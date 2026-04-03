import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { Resend } from "resend";
import Stripe from "stripe";

interface NetlifyEvent {
  headers: Record<string, string | undefined>;
  body: string;
  httpMethod: string;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-08-27.basil" });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

function constructStripeEvent(body: string, sig: string): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    const devSecret = process.env.STRIPE_WEBHOOK_SECRET_DEV;
    if (!devSecret) throw new Error("Invalid webhook signature");
    return stripe.webhooks.constructEvent(body, sig, devSecret);
  }
}

export const handler = async (event: NetlifyEvent) => {
  const sig = event.headers["stripe-signature"];
  if (!sig) {
    return { statusCode: 400, body: "Missing signature" };
  }

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = constructStripeEvent(event.body, sig);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return { statusCode: 400, body: `Webhook Error: ${message}` };
  }

  if (stripeEvent.type !== "checkout.session.completed") {
    return { statusCode: 200, body: "ok" };
  }

  const session = stripeEvent.data.object as Stripe.Checkout.Session;
  const email = session.customer_details?.email ?? null;

  // Identify city from which Payment Link was used
  const paymentLinkId = typeof session.payment_link === 'string' ? session.payment_link : session.payment_link?.id ?? null;
  let city: string | null = null;
  if (paymentLinkId) {
    if (paymentLinkId === process.env.STRIPE_PAYMENT_LINK_BOISE) city = 'boise';
    else if (paymentLinkId === process.env.STRIPE_PAYMENT_LINK_SLC) city = 'slc';
  }

  // Extract name from custom fields, fall back to customer_details.name
  let firstName: string | null = null;
  let lastName: string | null = null;
  const firstNameField = session.custom_fields?.find(f => f.key === "firstname");
  const lastNameField = session.custom_fields?.find(f => f.key === "lastname");
  if (firstNameField?.text?.value) firstName = firstNameField.text.value;
  if (lastNameField?.text?.value) lastName = lastNameField.text.value;
  if (!firstName && !lastName && session.customer_details?.name) {
    const parts = session.customer_details.name.trim().split(" ");
    firstName = parts[0];
    lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
  }

  // Retrieve quantity from line items
  let quantity = 1;
  try {
    const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items"] });
    if (full.line_items?.data?.length) {
      quantity = full.line_items.data.reduce((sum, li) => sum + (li.quantity ?? 0), 0);
    }
  } catch (e) {
    console.warn("Could not fetch line items, defaulting quantity to 1:", e);
  }

  const code = `TCKT-${randomBytes(4).toString("hex").toUpperCase()}`;

  const { error: dbError } = await supabase.from("tickets").upsert(
    {
      stripe_payment_intent: session.payment_intent as string | null,
      stripe_checkout_session: session.id,
      email,
      first_name: firstName,
      last_name: lastName,
      quantity,
      code,
      city,
    },
    { onConflict: "stripe_payment_intent" }
  );

  if (dbError) {
    console.error("Failed to insert ticket:", dbError);
    return { statusCode: 200, body: "Received (DB error logged)" };
  }

  if (email) {
    try {
      const qrCodeBuffer = await QRCode.toBuffer(code, { width: 200, margin: 2, type: "png" });
      await resend.emails.send({
        from: process.env.MAIL_FROM || "BYO Cake Club <noreply@bringyourowncake.com>",
        to: [email],
        subject: "Your BYO Cake Club Ticket 🎂",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #E6397F; text-align: center;">Your BYO Cake Club Ticket! 🎂</h1>

            <p>Hello ${firstName ?? "there"},</p>

            <p>Thank you for your purchase! Your ticket has been confirmed.</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: #E6397F; margin-top: 0;">Your Ticket Code</h3>
              <p style="font-size: 18px; font-weight: bold; color: #E6397F; margin: 10px 0;">${code}</p>
              <p style="font-size: 16px; color: #333; margin: 20px 0;">
                <strong>Attached is your QR code that will grant you entry to the event.</strong>
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 15px;">
                Please present this QR code at the event for entry.
              </p>
            </div>

            <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0;">Ticket Details:</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Ticket Code:</strong> ${code}</li>
                <li><strong>Quantity:</strong> ${quantity}</li>
                ${firstName ? `<li><strong>Name:</strong> ${firstName}${lastName ? ` ${lastName}` : ""}</li>` : ""}
                <li><strong>Email:</strong> ${email}</li>
              </ul>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">What to Bring</h3>
              <p>Please bring your own cake creation to share! Homemade and decorated cakes are encouraged.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p>We're excited to see your delicious creations!</p>
              <p>Questions? Email us at <a href="mailto:${process.env.CONTACT_EMAIL || "contact@bringyourowncake.com"}" style="color: #E6397F;">${process.env.CONTACT_EMAIL || "contact@bringyourowncake.com"}</a></p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">Made with love and lots of sugar 🍰</p>
              <p style="color: #666; font-size: 12px;">© 2025 BYO Cake Club</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `ticket-${code}.png`,
            content: qrCodeBuffer.toString("base64"),
          },
        ],
      });
    } catch (err) {
      console.error("Failed to send ticket email:", err);
    }
  }

  return { statusCode: 200, body: "ok" };
};
