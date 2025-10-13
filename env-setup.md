# Environment Setup

## Required Environment Variables

Create a `.env` file in your project root with:

```
RESEND_API_KEY=re_your_api_key_here
MAIL_FROM=BYO Cake Club <noreply@bringyourowncake.com>
STAFF_PASSWORD=your_secure_staff_password_here
STRIPE_CHECKOUT_URL=https://buy.stripe.com/your_checkout_url
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_WEBHOOK_SECRET_DEV=whsec_your_dev_webhook_secret
CONTACT_EMAIL=contact@bringyourowncake.com
```

## Service Setup Guides

### 1. Resend Email Service

1. Go to [resend.com](https://resend.com)
2. Sign up for an account
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `re_`)
6. Add it to your `.env` file as `RESEND_API_KEY`

#### Domain Setup
1. In Resend dashboard, go to Domains
2. Add your domain: `bringyourowncake.com`
3. Verify the domain with DNS records
4. Once verified, you can send emails from `noreply@bringyourowncake.com`

### 2. Stripe Payment Processing

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Set up a product and price for tickets
4. Create a checkout session URL
5. Configure webhook endpoints

#### Webhook Setup
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook secret and add to `STRIPE_WEBHOOK_SECRET`

### 3. Supabase Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and service role key
3. Run the SQL migration from `database-migration.sql`
4. Add credentials to your `.env` file

#### Database Schema

Create the tickets table with the following schema:

```sql
CREATE TABLE public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stripe_payment_intent text NOT NULL,
  stripe_checkout_session text NOT NULL,
  email text NOT NULL,
  first_name text NULL,
  last_name text NULL,
  quantity integer NOT NULL DEFAULT 1,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  code text NOT NULL,
  redeemed_at timestamp with time zone NULL,
  CONSTRAINT tickets_pkey PRIMARY KEY (id),
  CONSTRAINT tickets_code_key UNIQUE (code),
  CONSTRAINT tickets_stripe_payment_intent_key UNIQUE (stripe_payment_intent)
) TABLESPACE pg_default;
```

**Required Indexes:**
```sql
CREATE INDEX idx_tickets_code ON tickets(code);
CREATE INDEX idx_tickets_email ON tickets(email);
CREATE INDEX idx_tickets_redeemed_at ON tickets(redeemed_at);
```

### 4. Netlify Environment Variables

When deploying to Netlify:

1. Go to Site Settings → Environment Variables
2. Add all environment variables from your `.env` file
3. Redeploy your site

## Security Notes

### Staff Password Security
- **Choose a strong password**: Use a combination of letters, numbers, and symbols
- **Keep it secret**: Don't share the password in code repositories
- **Change regularly**: Update the password periodically for security
- **Different environments**: Use different passwords for development and production

### API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate keys regularly
- Use different keys for development and production

## Development vs Production

### Development Environment
- Use Stripe test keys (`sk_test_...`)
- Use development webhook secrets
- Mock email sending if needed
- Use test Supabase project

### Production Environment
- Use Stripe live keys (`sk_live_...`)
- Use production webhook secrets
- Real email sending enabled
- Use production Supabase project

## Troubleshooting

### Common Issues

1. **"RESEND_API_KEY not found"**
   - Check that your `.env` file is in the project root
   - Verify the API key format (starts with `re_`)

2. **"Stripe webhook signature verification failed"**
   - Ensure webhook secret is correct
   - Check that webhook URL is accessible
   - Verify webhook events are configured correctly

3. **"Supabase connection failed"**
   - Verify SUPABASE_URL format
   - Check service role key permissions
   - Ensure database tables exist

4. **"Staff authentication failed"**
   - Verify STAFF_PASSWORD is set
   - Check password complexity requirements
   - Ensure session cookies are enabled