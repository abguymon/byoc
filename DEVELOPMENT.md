# BYOC Development Guide

## Environment Detection

The app automatically detects whether it's running in **production** or **development** mode based on Supabase credentials.

### Automatic Detection Logic:

```javascript
// Production: Has Supabase credentials
const hasSupabase = import.meta.env.SUPABASE_URL && import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

// Production mode: Uses real Supabase database
// Development mode: Uses mock data for testing
```

### Production Mode (Supabase Available):
- ✅ Connects to real Supabase database
- ✅ Stores/retrieves actual tickets  
- ✅ Persists redemption data
- ✅ Default behavior

### Development Mode (No Supabase):
- ✅ Uses mock ticket data (5 sample tickets)
- ✅ Simulates database operations
- ✅ Perfect for local testing
- ✅ No database dependencies

## API Behavior

### Ticket Verification (`/api/verify-ticket`)
- **Production:** Queries Supabase `tickets` table
- **Development:** Searches mock data array

### Ticket Redemption (`/api/redeem-ticket`)
- **Production:** Updates Supabase database
- **Development:** Updates mock data in memory

## Environment Variables

### For Production:
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
STAFF_PASSWORD=your_secure_password
RESEND_API_KEY=your_resend_key
MAIL_FROM=your_email@domain.com
```

### For Development:
```env
# Only needs these for staff portal and basic functionality
STAFF_PASSWORD=cake2024
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY can be empty/missing
```

## Sample Tickets (Development Mode)

The following tickets are available for testing:

| Code | Name | Email | Status |
|------|------|-------|--------|
| TCKT-JANE2024 | Jane Smith | jane.smith@example.com | Valid |
| TCKT-JOHN2024 | John Doe | john.doe@example.com | Valid |
| TCKT-MARY2024 | Mary Johnson | mary.johnson@example.com | Redeemed |
| TCKT-BOB2024 | Bob Wilson | bob.wilson@example.com | Valid |
| TCKT-SARAH2024 | Sarah Brown | sarah.brown@example.com | Redeemed |

## Switching to Production

To deploy with real Supabase:

1. Set up Supabase project
2. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Create `tickets` table in Supabase
4. Deploy to Netlify

The app will automatically detect Supabase credentials and switch to production mode.
