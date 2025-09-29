import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
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
      
      // Send email with QR code if email is available
      if (email) {
        try {
          console.log("=== SENDING EMAIL WITH QR CODE ===");
          
          // Generate QR code as data URL
          const qrCodeDataUrl = await QRCode.toDataURL(code, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          // Check if we're in development mode (no API key)
          const apiKey = process.env.RESEND_API_KEY;
          if (!apiKey || apiKey === 're_your_api_key_here') {
            console.log('Development mode: Mocking email send for', email);
            console.log('✅ Mock email sent successfully (development mode)');
          } else {
            // Send email using Resend API directly (same pattern as send-welcome-email.ts)
            const resendResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: process.env.MAIL_FROM || 'BYO Cake Club <noreply@bringyourowncake.com>',
                to: [email],
                subject: 'Your BYO Cake Club Ticket 🎂',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #E6397F; text-align: center;">Your BYO Cake Club Ticket! 🎂</h1>
                    
                    <p>Hello ${firstName ? firstName : 'there'},</p>
                    
                    <p>Thank you for your purchase! Your ticket has been confirmed.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                      <h3 style="color: #E6397F; margin-top: 0;">Your Ticket Code</h3>
                      <p style="font-size: 18px; font-weight: bold; color: #E6397F; margin: 10px 0;">${code}</p>
                      
                      <h3 style="color: #E6397F;">QR Code</h3>
                      <img src="${qrCodeDataUrl}" alt="QR Code for ticket ${code}" style="display: block; margin: 10px auto; border: 1px solid #ddd; border-radius: 4px;" />
                      
                      <p style="font-size: 14px; color: #666; margin-top: 15px;">
                        Present this QR code at the event for entry. Each code can only be used once.
                      </p>
                    </div>
                    
                    <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <h4 style="color: #333; margin-top: 0;">Ticket Details:</h4>
                      <ul style="margin: 10px 0; padding-left: 20px;">
                        <li><strong>Ticket Code:</strong> ${code}</li>
                        <li><strong>Quantity:</strong> ${quantity}</li>
                        ${firstName ? `<li><strong>Name:</strong> ${firstName}${lastName ? ` ${lastName}` : ''}</li>` : ''}
                        <li><strong>Email:</strong> ${email}</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="color: #856404; margin-top: 0;">What to Bring</h3>
                      <p>Please bring your own cake creation to share! Homemade and decorated cakes are encouraged.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <p>We're excited to see your delicious creations!</p>
                      <p>Questions? Email us at <a href="mailto:${process.env.CONTACT_EMAIL || 'contact@bringyourowncake.com'}" style="color: #E6397F;">${process.env.CONTACT_EMAIL || 'contact@bringyourowncake.com'}</a></p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                      <p style="color: #666; font-size: 14px;">Made with love and lots of sugar 🍰</p>
                      <p style="color: #666; font-size: 12px;">© 2025 BYO Cake Club</p>
                    </div>
                  </div>
                `,
              }),
            });

            if (!resendResponse.ok) {
              const errorData = await resendResponse.json();
              console.error('Resend API error:', errorData);
              throw new Error('Failed to send email');
            }

            const result = await resendResponse.json();
            console.log("✅ Email sent successfully:", result.id);
          }
          
        } catch (emailError) {
          console.error("❌ Failed to send email:", emailError);
          // Don't fail the webhook if email fails - the ticket was still created successfully
        }
      } else {
        console.log("⚠️ No email address available, skipping email send");
      }
    }
  } else {
    console.log("Event type not handled:", stripeEvent.type);
  }

  return { statusCode: 200, body: "ok" };
};
