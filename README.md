# 🎂 BYO Cake Club - Event Website

A modern, mobile-optimized website for the "Bring Your Own Cake" community event in Boise, Idaho. Built with Astro, Tailwind CSS, and integrated with Stripe for ticket sales, Supabase for data management, and Resend for email notifications.

## ✨ Features

- **Modern Event Website** - Clean, mobile-first design with cake-themed styling
- **Ticket Sales Integration** - Stripe checkout for secure ticket purchases
- **QR Code System** - Automated QR code generation and email delivery for event entry
- **Staff Portal** - Password-protected admin interface for ticket verification
- **Email Automation** - Welcome emails and ticket confirmations via Resend
- **Database Management** - Supabase integration for ticket tracking and redemption
- **Responsive Design** - Optimized for all device sizes
- **SEO Optimized** - Structured data and meta tags for better search visibility

## 🚀 Tech Stack

- **[Astro](https://astro.build/)** - Modern static site generator
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Stripe](https://stripe.com/)** - Payment processing and checkout
- **[Supabase](https://supabase.com/)** - Database and backend services
- **[Resend](https://resend.com/)** - Email delivery service
- **[Netlify](https://netlify.com/)** - Hosting and serverless functions

## 📁 Project Structure

```
src/
├── pages/
│   ├── index.astro          # Main event page
│   ├── staff.astro          # Staff portal for ticket verification
│   ├── waiver.astro        # Terms and conditions page
│   └── api/
│       ├── send-welcome-email.ts    # Email signup endpoint
│       ├── staff-auth.ts           # Staff authentication
│       ├── verify-session.ts       # Session verification
│       ├── verify-ticket.ts        # Ticket verification
│       └── redeem-ticket.ts        # Ticket redemption
netlify/
└── functions/
    └── stripe-webhook.ts   # Stripe webhook handler
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (version 18.20.8 or higher)
- npm or yarn
- Supabase account
- Stripe account
- Resend account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/byoc-cake-club.git
   cd byoc-cake-club
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see [Environment Setup](env-setup.md)):
   ```bash
   cp env-setup.md .env
   # Edit .env with your actual values
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:4321`

## 🔧 Configuration

### Environment Variables

See [env-setup.md](env-setup.md) for detailed setup instructions for all required environment variables including:

- Stripe configuration
- Supabase database setup
- Resend email service
- Staff authentication

### Database Setup

The project uses Supabase for data storage. Run the SQL migration in `database-migration.sql` to set up the required tables.

#### Database Schema

The main `tickets` table stores all ticket information:

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

**Table Fields:**
- `id` - Unique identifier for each ticket
- `stripe_payment_intent` - Stripe payment intent ID (unique)
- `stripe_checkout_session` - Stripe checkout session ID
- `email` - Customer email address
- `first_name` - Customer first name (optional)
- `last_name` - Customer last name (optional)
- `quantity` - Number of tickets purchased
- `issued_at` - When the ticket was created
- `code` - Unique ticket code (format: TCKT-XXXXXXXX)
- `redeemed_at` - When the ticket was redeemed (NULL if not redeemed)

### Stripe Integration

1. Create a Stripe account and get your API keys
2. Set up webhook endpoints pointing to your Netlify function
3. Configure your checkout session with custom fields for customer names

## 🎨 Customization

### Styling

The website uses custom cake-themed colors defined in `tailwind.config.mjs`:
- `cake-pink` - Primary brand color
- `cake-yellow` - Accent color
- `cake-blue` - Secondary color
- `cake-purple` - Tertiary color
- `cake-orange` - Highlight color

### Event Details

Update event information in `src/pages/index.astro`:
- Event date and time
- Location details
- Contact information
- Pricing

## 🚀 Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on git push

### Manual Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📱 Features Overview

### Public Features
- Event information and countdown
- Email signup for event updates
- Ticket purchase via Stripe checkout
- Terms and conditions page
- Mobile-optimized responsive design

### Staff Features
- Password-protected staff portal
- QR code scanner for ticket verification
- Manual ticket code entry
- Ticket redemption tracking
- Customer information display

### Backend Features
- Stripe webhook processing
- Automated email notifications
- QR code generation
- Database ticket management
- Session-based authentication

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions or support, please contact:
- Email: bringyourowncake@gmail.com
- Website: https://bringyourowncake.com

---

Made with 🍰 and lots of love for cake enthusiasts!