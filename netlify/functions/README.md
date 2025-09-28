# Stripe Webhook Function

This Netlify function handles Stripe webhook events and inserts ticket data into Supabase.

## Setup

### 2. Supabase Table

Create a `tickets` table in Supabase with the following schema:

```sql
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  stripe_payment_intent TEXT UNIQUE NOT NULL,
  stripe_checkout_session TEXT NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  quantity INTEGER DEFAULT 1,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_tickets_stripe_payment_intent ON tickets(stripe_payment_intent);
CREATE INDEX idx_tickets_email ON tickets(email);
CREATE INDEX idx_tickets_code ON tickets(code);
```

### 3. Stripe Webhook Configuration

1. Go to your Stripe Dashboard → Webhooks
2. Create a new webhook endpoint
3. Set the URL to: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
4. Select events: `checkout.session.completed`
5. Copy the webhook secret and add it to your Netlify environment variables

## Function Details

The function handles `checkout.session.completed` events and:

1. Extracts customer information from the Stripe session
2. Retrieves line item quantities
3. Generates a unique ticket code
4. Inserts/updates the ticket record in Supabase

## Testing

You can test the webhook locally using Stripe CLI:

```bash
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
```

## Error Handling

- Returns 400 for missing signatures or invalid webhook data
- Returns 200 for successful processing (even if DB errors occur)
- Logs errors to console for debugging
