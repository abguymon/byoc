import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-08-27.basil" });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const handler = async (event: any) => {
  console.log("=== WEBHOOK RECEIVED ===");
  console.log("Event headers:", JSON.stringify(event.headers, null, 2));
  console.log("Event body:", event.body);
  console.log("Event HTTP method:", event.httpMethod);
  console.log("Event path:", event.path);

  const sig = event.headers["stripe-signature"];
  if (!sig) {
    console.log("ERROR: Missing stripe-signature header");
    return { statusCode: 400, body: "Missing signature" };
  }

  console.log("Stripe signature found:", sig);

  let stripeEvent: Stripe.Event;
  let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  // Try production webhook secret first, then fall back to dev secret
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
    console.log("Stripe event constructed successfully with production webhook secret");
    console.log("Event type:", stripeEvent.type);
    console.log("Event ID:", stripeEvent.id);
  } catch (err: any) {
    console.log("Failed with production webhook secret, trying dev webhook secret...");
    
    // Try with dev webhook secret if available
    const devWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET_DEV;
    if (devWebhookSecret) {
      try {
        stripeEvent = stripe.webhooks.constructEvent(
          event.body,
          sig,
          devWebhookSecret
        );
        console.log("Stripe event constructed successfully with dev webhook secret");
        console.log("Event type:", stripeEvent.type);
        console.log("Event ID:", stripeEvent.id);
      } catch (devErr: any) {
        console.log("ERROR: Failed to construct Stripe event with both secrets:", devErr.message);
        return { statusCode: 400, body: `Webhook Error: ${devErr.message}` };
      }
    } else {
      console.log("ERROR: Failed to construct Stripe event:", err.message);
      return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }
  }

  if (stripeEvent.type === "checkout.session.completed") {
    console.log("=== PROCESSING CHECKOUT.SESSION.COMPLETED ===");
    const session = stripeEvent.data.object as Stripe.Checkout.Session;
    
    console.log("Session data:", JSON.stringify(session, null, 2));
    console.log("Customer details:", JSON.stringify(session.customer_details, null, 2));
    console.log("Custom fields:", JSON.stringify(session.custom_fields, null, 2));

    const paymentIntentId = (session.payment_intent as string) ?? null;
    const sessionId = session.id;
    const email = session.customer_details?.email ?? null;

    console.log("Extracted data:");
    console.log("- Payment Intent ID:", paymentIntentId);
    console.log("- Session ID:", sessionId);
    console.log("- Email:", email);

    // Extract first name and last name from custom fields
    let firstName: string | null = null;
    let lastName: string | null = null;
    
    if (session.custom_fields && session.custom_fields.length > 0) {
      // Look for firstname and lastname custom fields
      const firstNameField = session.custom_fields.find(field => field.key === "firstname");
      const lastNameField = session.custom_fields.find(field => field.key === "lastname");
      
      if (firstNameField?.text?.value) {
        firstName = firstNameField.text.value;
      }
      if (lastNameField?.text?.value) {
        lastName = lastNameField.text.value;
      }
      
      console.log("- Custom fields found:", { firstName, lastName });
    }
    
    // Fallback: try to split name from customer_details if custom fields not available
    if (!firstName && !lastName && session.customer_details?.name) {
      const parts = session.customer_details.name.trim().split(" ");
      firstName = parts[0];
      lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
      console.log("- Name split from customer_details:", { firstName, lastName, originalName: session.customer_details.name });
    }
    
    if (!firstName && !lastName) {
      console.log("- No customer name provided in custom fields or customer_details");
    }

    // Quantity → from line_items
    let quantity = 1;
    try {
      console.log("Fetching line items for session:", sessionId);
      const full = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
      console.log("Line items data:", JSON.stringify(full.line_items, null, 2));
      
      if (full.line_items?.data?.[0]?.quantity) {
        quantity = full.line_items.data.reduce((sum, li) => sum + (li.quantity ?? 0), 0);
        console.log("- Calculated quantity:", quantity);
      } else {
        console.log("- No quantity found in line items, using default:", quantity);
      }
    } catch (e) {
      console.warn("Could not fetch line items:", e);
    }

    // Generate unique ticket code
    const code = `TCKT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    console.log("- Generated ticket code:", code);

    // Prepare data for Supabase
    const ticketData = {
      stripe_payment_intent: paymentIntentId,
      stripe_checkout_session: sessionId,
      email,
      first_name: firstName,
      last_name: lastName,
      quantity,
      code,
    };
    
    console.log("=== INSERTING INTO SUPABASE ===");
    console.log("Ticket data to insert:", JSON.stringify(ticketData, null, 2));

    // Insert (upsert for idempotency)
    const { error } = await supabase.from("tickets").upsert(
      ticketData,
      { onConflict: "stripe_payment_intent" }
    );

    if (error) {
      console.error("Supabase upsert error:", error);
      return { statusCode: 200, body: "Received (DB error logged)" };
    } else {
      console.log("✅ Successfully inserted ticket into Supabase");
    }
  } else {
    console.log("Event type not handled:", stripeEvent.type);
  }

  return { statusCode: 200, body: "ok" };
};
