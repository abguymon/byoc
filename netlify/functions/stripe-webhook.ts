import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { Resend } from "resend";
import Stripe from "stripe";
import { ticketEmailHtml } from "../../src/emails/ticket.js";

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
      await resend.contacts.create({ email, unsubscribed: false });
    } catch (err) {
      console.warn("Failed to add purchaser to Resend contacts:", err);
    }
  }

  if (email) {
    try {
      const qrCodeBuffer = await QRCode.toBuffer(code, { width: 200, margin: 2, type: "png" });
      await resend.emails.send({
        from: process.env.MAIL_FROM || "BYO Cake Club <noreply@bringyourowncake.com>",
        to: [email],
        subject: "Your BYO Cake Club Ticket 🎂",
        html: ticketEmailHtml({
          firstName,
          lastName,
          email,
          code,
          quantity,
          city,
          contactEmail: process.env.CONTACT_EMAIL,
        }),
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
