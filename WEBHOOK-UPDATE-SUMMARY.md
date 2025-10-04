# Updated Stripe Webhook Function

Your Stripe webhook function has been updated to properly extract customer data from the actual webhook payload structure you provided.

## ✅ **What's Updated:**

### 1. **Enhanced Data Extraction**
- **First Name & Last Name**: Now extracted from `custom_fields` array (keys: "firstname", "lastname")
- **Fallback Logic**: If custom fields aren't available, falls back to splitting `customer_details.name`
- **Email**: Extracted from `customer_details.email`
- **Payment Info**: Amount total, currency, and payment status
- **Address**: Complete address information from `customer_details.address`

### 2. **Updated Database Schema**
The Supabase table now includes additional fields:
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
  amount_total INTEGER,        -- NEW
  currency TEXT,               -- NEW
  payment_status TEXT,         -- NEW
  address JSONB,               -- NEW
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. **Enhanced Logging**
The function now logs:
- Custom fields data
- Payment information (amount, currency, status)
- Address extraction
- Detailed data extraction process

## 🧪 **Testing**

All tests pass (4/4) with the updated data structure. The function properly handles:
- ✅ Missing signature validation
- ✅ Invalid signature handling
- ✅ Successful event processing with custom fields
- ✅ Graceful handling of other event types

## 📊 **Data Extracted from Your Webhook Payload**

Based on your example payload, the function will extract:

```javascript
{
  stripe_payment_intent: "pi_3SCWLxFlIadQytR20mXGzaNN",
  stripe_checkout_session: "cs_test_a1uz5n2raQcSGeLoTccd567cta0F2DXIbhjfP72Dx5u2c9LLORnmx9nkmO",
  email: "adambguymon@gmail.com",
  first_name: "Adam",           // From custom_fields[0].text.value
  last_name: "Guymon",          // From custom_fields[1].text.value
  quantity: 1,                  // From line_items
  code: "TCKT-ABC12345",        // Generated unique code
  amount_total: 530,            // From amount_total
  currency: "usd",              // From currency
  payment_status: "paid",       // From payment_status
  address: {                    // From customer_details.address
    city: null,
    country: "US",
    line1: null,
    line2: null,
    postal_code: "83616",
    state: null
  },
  issued_at: "2025-01-30T20:00:00.000Z"
}
```

## 🚀 **Ready for Production**

Your webhook function is now properly configured to:
1. Extract all relevant customer data from Stripe checkout sessions
2. Handle both custom fields and fallback data extraction
3. Store comprehensive ticket information in Supabase
4. Provide detailed logging for debugging

The function will work correctly with your actual Stripe webhook payloads! 🎉

