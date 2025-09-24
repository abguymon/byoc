# Environment Setup for Resend

## Required Environment Variables

Create a `.env` file in your project root with:

```
RESEND_API_KEY=re_your_api_key_here
MAIL_FROM=BYO Cake Club <noreply@bringyourowncake.com>
```

## Getting Your Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for an account
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `re_`)
6. Add it to your `.env` file

## Domain Setup

1. In Resend dashboard, go to Domains
2. Add your domain: `bringyourowncake.com`
3. Verify the domain with DNS records
4. Once verified, you can send emails from `noreply@bringyourowncake.com`

## Netlify Environment Variables

When deploying to Netlify:

1. Go to Site Settings → Environment Variables
2. Add `RESEND_API_KEY` with your API key value
3. Add `MAIL_FROM` with your sender email (e.g., `BYO Cake Club <noreply@bringyourowncake.com>`)
4. Redeploy your site
