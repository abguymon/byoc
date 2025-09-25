# Netlify Forms Recovery Scripts

This directory contains scripts to help you process Netlify Forms submissions when you need to send emails manually after hitting Resend limits.

## How It Works

1. **Automatic Storage**: Your form now always submits to Netlify Forms (no limits)
2. **Primary Email**: Tries to send via Resend first (when under limit)
3. **Fallback**: If Resend fails, form is still saved to Netlify Forms
4. **Recovery**: Use these scripts to process saved forms later

## Usage

### Step 1: Export Netlify Forms Data

1. Go to your [Netlify Dashboard](https://app.netlify.com/)
2. Navigate to **Forms** → **[Your Site]** → **signup**
3. Click **"Export"** and download as CSV
4. Save the file as `netlify-forms-export.csv` in this directory

### Step 2: Process the Data

```bash
node scripts/process-netlify-forms.js
```

This will:
- Parse your CSV export
- Generate a batch email script
- Show you all the emails that will be sent

### Step 3: Send Batch Emails

```bash
# Set your Resend API key
export RESEND_API_KEY="your_api_key_here"

# Run the batch script
node scripts/send-batch-emails.js
```

## Features

- ✅ **No Email Loss**: All forms are saved to Netlify Forms
- ✅ **Rate Limit Safe**: Includes delays between emails
- ✅ **Error Handling**: Continues processing even if some emails fail
- ✅ **Progress Tracking**: Shows success/failure counts
- ✅ **Same Email Template**: Uses your existing email design

## CSV Format Expected

The script expects a CSV with columns like:
- `email` or `Email`
- `submitted_at` or `Submitted at`
- Any other fields from your form

## Troubleshooting

### "CSV file not found"
- Make sure you've exported from Netlify Forms
- Save as `netlify-forms-export.csv` in this directory

### "No valid email addresses found"
- Check that your CSV has an `email` or `Email` column
- Verify the email addresses are valid

### "RESEND_API_KEY environment variable is required"
- Set your Resend API key: `export RESEND_API_KEY="your_key"`
- Or add it to your `.env` file

## Benefits of This Approach

1. **Never Lose Signups**: Even when Resend is rate-limited
2. **Cost Effective**: Use Resend when available, manual processing when needed
3. **User Experience**: Users always see success message
4. **Flexible**: Can process emails in batches or individually
5. **Audit Trail**: All submissions are logged in Netlify Forms
