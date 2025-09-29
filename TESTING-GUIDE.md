# Stripe Webhook Testing Guide

Your Netlify Stripe webhook function is now properly configured and ready for testing! 🎉

## ✅ What's Fixed

- **Netlify dev works properly** - No more build errors
- **Test files separated** - Tests are now in `/tests` directory, not treated as functions
- **Unit tests passing** - All 4 tests pass successfully
- **Function loads correctly** - `stripe-webhook` function loads without errors

## 🚀 Quick Start

### 1. Start Netlify Dev Server
```bash
npm run dev
# or
netlify dev
```

Your server will be available at:
- **Main site**: http://localhost:4321/
- **Functions**: http://localhost:8888/.netlify/functions/

### 2. Test Your Webhook Function

**Option A: Quick Test with curl**
```bash
curl -X POST http://localhost:8888/.netlify/functions/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=1234567890,v1=test_signature" \
  -d '{"id":"evt_test","type":"checkout.session.completed","data":{"object":{"id":"cs_test","payment_intent":"pi_test","customer_details":{"email":"test@example.com","name":"John Doe"}}}}'
```

**Option B: Run Unit Tests**
```bash
npm test
```

**Option C: Test with Stripe CLI (Most Realistic)**
```bash
# Install Stripe CLI first
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook

# In another terminal, trigger test events
stripe trigger checkout.session.completed
```

## 📁 Project Structure

```
/home/adam/dev/learning/byoc/
├── netlify/
│   └── functions/
│       └── stripe-webhook.ts          # Your webhook function
├── tests/
│   ├── stripe-webhook.test.ts         # Unit tests
│   └── test-setup.ts                  # Test configuration
├── vitest.config.ts                   # Vitest configuration
├── test-webhook.js                    # Comprehensive test script
└── netlify.toml                       # Netlify configuration
```

## 🧪 Testing Methods

### Unit Tests
```bash
npm test                    # Run once
npm run test:watch         # Watch mode
npm run test:ui            # UI mode
```

### Local Function Testing
```bash
npm run test:webhook       # Comprehensive test suite
```

### Manual Testing
1. Start `netlify dev`
2. Use curl or Postman to send POST requests to `http://localhost:8888/.netlify/functions/stripe-webhook`
3. Check the terminal logs for function execution details

## 🔧 Environment Variables

Make sure you have a `.env` file with:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🐛 Debugging Tips

1. **Check Function Logs**: The terminal running `netlify dev` shows detailed logs
2. **Test Signature Validation**: Your function properly validates Stripe signatures
3. **Database Connection**: Function connects to Supabase correctly
4. **Error Handling**: Proper error responses for invalid requests

## 🚀 Production Deployment

1. **Deploy to Netlify**:
   ```bash
   netlify deploy --prod
   ```

2. **Configure Stripe Webhook**:
   - URL: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
   - Events: `checkout.session.completed`

3. **Test Production**:
   ```bash
   stripe trigger checkout.session.completed
   ```

## ✅ What's Working

- ✅ Netlify dev server starts successfully
- ✅ Stripe webhook function loads without errors
- ✅ Function responds to HTTP requests
- ✅ Signature validation works correctly
- ✅ Unit tests pass (4/4)
- ✅ Proper error handling for invalid signatures
- ✅ Environment variables loaded correctly

## 🎯 Next Steps

1. **Test with real Stripe events** using Stripe CLI
2. **Deploy to production** when ready
3. **Monitor logs** in Netlify dashboard
4. **Set up webhook endpoint** in Stripe dashboard

Your webhook function is now ready for development and testing! 🚀
