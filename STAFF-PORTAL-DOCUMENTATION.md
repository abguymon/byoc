# Staff Portal Documentation

## Overview

The Staff Portal is a password-protected page that allows BYO Cake Club staff to scan QR codes from tickets and verify/redeem them at the event. This system provides a secure way to manage ticket verification and prevent duplicate entries.

## Features

### 🔐 Password Protection
- Simple password-based authentication
- Password: `byoc2025staff` (configurable in the code)
- Session-based access (logout required to exit)

### 📱 QR Code Scanning
- **Camera-based scanning**: Uses device camera to scan QR codes
- **Manual entry**: Fallback option to manually enter ticket codes
- **Real-time detection**: Automatically detects and processes QR codes
- **Cross-platform**: Works on mobile devices and desktop computers

### 🎫 Ticket Verification
- **Instant verification**: Immediately shows ticket details when scanned
- **Comprehensive info**: Displays customer name, email, quantity, purchase date
- **Status tracking**: Shows if ticket is already redeemed or still valid
- **Error handling**: Clear error messages for invalid or missing tickets

### ✅ Ticket Redemption
- **One-click redemption**: Mark tickets as redeemed with a single click
- **Duplicate prevention**: Cannot redeem already redeemed tickets
- **Audit trail**: Tracks when tickets were redeemed
- **Status updates**: Real-time status updates after redemption

## Access

### URL
```
https://your-domain.com/staff
```

### Login Credentials
- **Password**: `byoc2025staff`
- **Note**: Change this password in production by updating the `STAFF_PASSWORD` constant in `/src/pages/staff.astro`

## Database Schema

The system uses the following database fields:

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
  redeemed_at TIMESTAMP WITH TIME ZONE,  -- NEW FIELD
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Fields for Staff Portal:
- `code`: The ticket code (e.g., "TCKT-ABC12345")
- `redeemed_at`: Timestamp when ticket was redeemed (NULL = not redeemed)
- `first_name`, `last_name`: Customer name
- `email`: Customer email
- `quantity`: Number of tickets purchased

## API Endpoints

### 1. Verify Ticket
**Endpoint**: `POST /api/verify-ticket`

**Request Body**:
```json
{
  "code": "TCKT-ABC12345"
}
```

**Response** (Success):
```json
{
  "success": true,
  "ticket": {
    "id": 1,
    "code": "TCKT-ABC12345",
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "quantity": 1,
    "redeemed_at": null,
    "created_at": "2025-01-30T20:00:00.000Z",
    // ... other fields
  }
}
```

**Response** (Error):
```json
{
  "error": "Ticket not found"
}
```

### 2. Redeem Ticket
**Endpoint**: `POST /api/redeem-ticket`

**Request Body**:
```json
{
  "code": "TCKT-ABC12345"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Ticket successfully redeemed",
  "ticket": {
    // ... ticket data with redeemed_at timestamp
  }
}
```

**Response** (Already Redeemed):
```json
{
  "error": "Ticket has already been redeemed",
  "redeemed_at": "2025-01-30T21:00:00.000Z"
}
```

## QR Code Format

QR codes contain the ticket code in the format:
```
TCKT-XXXXXXXX
```

Where `XXXXXXXX` is an 8-character alphanumeric code (e.g., `TCKT-ABC12345`).

## Usage Instructions

### For Staff Members:

1. **Access the Portal**
   - Navigate to `/staff` on your website
   - Enter the staff password

2. **Scan QR Codes**
   - Click "Start Scanner" to activate camera
   - Point camera at customer's QR code
   - System will automatically detect and verify the ticket

3. **Manual Entry** (if camera unavailable)
   - Enter ticket code manually in the text field
   - Click "Verify" to check the ticket

4. **Verify Ticket Details**
   - Review customer information displayed
   - Check redemption status
   - Verify quantity matches customer's group size

5. **Redeem Ticket**
   - Click "Mark as Redeemed" for valid tickets
   - System will prevent duplicate redemptions
   - Confirmation message will appear

6. **Handle Issues**
   - **Invalid QR Code**: Clear error message will appear
   - **Already Redeemed**: System will show redemption date
   - **Ticket Not Found**: Verify code format and database

## Security Considerations

### Current Implementation:
- Simple password authentication
- Client-side password storage (not secure for production)

### Recommended Production Security:
1. **Server-side authentication** with JWT tokens
2. **Environment variable** for staff password
3. **Session management** with expiration
4. **Rate limiting** on API endpoints
5. **Audit logging** for all redemption activities

## Troubleshooting

### Common Issues:

1. **Camera Not Working**
   - Check browser permissions
   - Try manual entry as fallback
   - Ensure HTTPS connection (required for camera access)

2. **QR Code Not Detecting**
   - Ensure good lighting
   - Hold camera steady
   - Try manual entry if scanning fails

3. **"Ticket Not Found" Error**
   - Verify QR code format (should start with "TCKT-")
   - Check if ticket exists in database
   - Ensure code is not corrupted

4. **"Already Redeemed" Error**
   - Check redemption timestamp
   - Verify customer hasn't already entered
   - Contact supervisor if dispute

### Database Issues:
- Check Supabase connection
- Verify `redeemed_at` column exists
- Ensure proper indexes are created

## Development Notes

### Dependencies:
- `jsQR`: QR code detection library
- `@supabase/supabase-js`: Database client
- Astro API routes for backend logic

### Browser Compatibility:
- Modern browsers with camera API support
- Mobile devices (iOS Safari, Chrome, etc.)
- Desktop browsers with camera access

### Performance:
- QR scanning uses `requestAnimationFrame` for smooth performance
- Database queries are indexed for fast lookups
- Minimal JavaScript for quick loading

## Future Enhancements

1. **Offline Mode**: Cache ticket data for offline scanning
2. **Bulk Operations**: Process multiple tickets at once
3. **Analytics Dashboard**: Track redemption statistics
4. **Mobile App**: Native mobile application
5. **Biometric Authentication**: Fingerprint/face ID for staff login
6. **Real-time Sync**: Live updates across multiple devices
7. **Export Reports**: Generate redemption reports
8. **Integration**: Connect with other event management systems
