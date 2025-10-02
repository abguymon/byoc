# Staff Portal Setup Guide

## Overview

This guide will help you set up the password-protected staff portal for BYO Cake Club ticket verification and redemption.

## Prerequisites

- ✅ Supabase database with `tickets` table
- ✅ Stripe webhook generating QR codes
- ✅ Astro project deployed on Netlify
- ✅ Environment variables configured

## Step 1: Database Migration

First, you need to add the `redeemed_at` field to your tickets table:

1. **Open Supabase SQL Editor**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor

2. **Run the Migration Script**
   ```sql
   -- Add redeemed_at column to tickets table
   ALTER TABLE tickets 
   ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMP WITH TIME ZONE;

   -- Add index for faster lookups on redeemed status
   CREATE INDEX IF NOT EXISTS idx_tickets_redeemed_at ON tickets(redeemed_at);

   -- Add index for faster lookups on code and redeemed status
   CREATE INDEX IF NOT EXISTS idx_tickets_code_redeemed ON tickets(code, redeemed_at);

   -- Update existing tickets to have NULL redeemed_at (they haven't been redeemed yet)
   UPDATE tickets 
   SET redeemed_at = NULL 
   WHERE redeemed_at IS NULL;

   -- Optional: Add a comment to document the field
   COMMENT ON COLUMN tickets.redeemed_at IS 'Timestamp when the ticket was redeemed/used at the event';
   ```

3. **Verify the Migration**
   - Check that the `redeemed_at` column exists
   - Ensure indexes were created successfully

## Step 2: Deploy the Staff Portal

The staff portal files are already created in your project:

- `/src/pages/staff.astro` - Main staff portal page
- `/src/pages/api/verify-ticket.ts` - API endpoint for ticket verification
- `/src/pages/api/redeem-ticket.ts` - API endpoint for ticket redemption

1. **Deploy to Netlify**
   ```bash
   npm run build
   # Deploy to Netlify (via git push or Netlify CLI)
   ```

2. **Verify Deployment**
   - Check that `/staff` page loads
   - Test API endpoints are accessible

## Step 3: Configure Staff Password

**⚠️ IMPORTANT: Change the default password before going live!**

1. **Edit Staff Password**
   - Open `/src/pages/staff.astro`
   - Find line: `const STAFF_PASSWORD = 'byoc2025staff';`
   - Change to a secure password

2. **For Production Security** (Recommended):
   - Move password to environment variable
   - Implement server-side authentication
   - Add session management

## Step 4: Test the System

### Manual Testing

1. **Access Staff Portal**
   - Navigate to `https://your-domain.com/staff`
   - Enter the staff password
   - Verify login works

2. **Test QR Code Scanning**
   - Click "Start Scanner"
   - Allow camera permissions
   - Test with a real QR code from a ticket email

3. **Test Manual Entry**
   - Enter a ticket code manually (e.g., `TCKT-ABC12345`)
   - Click "Verify"
   - Check ticket details display correctly

4. **Test Redemption**
   - Click "Mark as Redeemed" for a valid ticket
   - Verify redemption timestamp is recorded
   - Test that already redeemed tickets show correct status

### Automated Testing

Run the test script to verify API functionality:

```bash
# Test locally
node test-staff-portal.js

# Test production (replace with your domain)
TEST_URL=https://your-domain.com node test-staff-portal.js
```

## Step 5: Staff Training

### For Event Staff:

1. **Access Instructions**
   - Bookmark the staff portal URL
   - Save the password securely
   - Test access before the event

2. **QR Code Scanning**
   - Use device camera to scan customer QR codes
   - Ensure good lighting for scanning
   - Have manual entry as backup

3. **Verification Process**
   - Check customer name matches ID
   - Verify quantity matches group size
   - Confirm ticket hasn't been redeemed

4. **Redemption Process**
   - Click "Mark as Redeemed" after verification
   - Confirm redemption timestamp
   - Handle any errors or disputes

## Step 6: Event Day Setup

### Technical Setup:

1. **Device Preparation**
   - Use tablets or phones with good cameras
   - Ensure stable internet connection
   - Test camera permissions beforehand

2. **Backup Plans**
   - Manual entry for QR code failures
   - Offline ticket list (if needed)
   - Contact information for technical issues

3. **Multiple Staff Members**
   - Each staff member can use the portal
   - All redemptions are tracked in real-time
   - No conflicts between multiple devices

## Troubleshooting

### Common Issues:

1. **Camera Not Working**
   - Check browser permissions
   - Ensure HTTPS connection
   - Try manual entry instead

2. **"Ticket Not Found" Error**
   - Verify QR code format (TCKT-XXXXXXXX)
   - Check database connection
   - Ensure ticket exists in system

3. **"Already Redeemed" Error**
   - Check redemption timestamp
   - Verify customer hasn't already entered
   - Contact supervisor if dispute

4. **Database Connection Issues**
   - Check Supabase status
   - Verify environment variables
   - Check network connectivity

### Emergency Procedures:

1. **System Down**
   - Use manual ticket list
   - Take photos of QR codes for later processing
   - Record redemptions manually

2. **Multiple Redemptions**
   - Check redemption timestamps
   - Verify customer identity
   - Contact technical support

## Security Considerations

### Current Implementation:
- Simple password authentication
- Client-side password storage
- Basic session management

### Production Recommendations:
1. **Server-side Authentication**
   - JWT tokens with expiration
   - Secure password hashing
   - Session management

2. **Rate Limiting**
   - Prevent API abuse
   - Limit verification attempts
   - Monitor suspicious activity

3. **Audit Logging**
   - Log all redemption activities
   - Track staff member actions
   - Generate reports

4. **Environment Variables**
   - Store passwords securely
   - Use different passwords per environment
   - Regular password rotation

## Monitoring and Analytics

### Track These Metrics:
- Total tickets verified
- Redemption rate
- Failed verification attempts
- Staff member activity
- Peak usage times

### Generate Reports:
- Daily redemption summary
- Unredeemed tickets list
- Staff performance metrics
- Error rate analysis

## Support and Maintenance

### Regular Maintenance:
- Monitor system performance
- Update passwords regularly
- Review audit logs
- Test functionality before events

### Contact Information:
- Technical support: [Your contact info]
- Database issues: Supabase support
- Stripe issues: Stripe support

---

## Quick Reference

### URLs:
- Staff Portal: `https://your-domain.com/staff`
- Verify API: `https://your-domain.com/api/verify-ticket`
- Redeem API: `https://your-domain.com/api/redeem-ticket`

### Default Password:
- `byoc2025staff` (CHANGE THIS!)

### QR Code Format:
- `TCKT-XXXXXXXX` (8-character alphanumeric)

### Database Fields:
- `code`: Ticket code
- `redeemed_at`: Redemption timestamp (NULL = not redeemed)
- `first_name`, `last_name`: Customer name
- `email`: Customer email
- `quantity`: Number of tickets
