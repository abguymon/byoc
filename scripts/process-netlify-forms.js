#!/usr/bin/env node

/**
 * Netlify Forms Recovery Script
 * 
 * This script helps you process Netlify Forms submissions when you need to
 * send emails manually after hitting Resend limits.
 * 
 * Usage:
 * 1. Export your Netlify Forms data as CSV from your Netlify dashboard
 * 2. Save it as 'netlify-forms-export.csv' in this directory
 * 3. Run: node scripts/process-netlify-forms.js
 * 
 * The script will:
 * - Parse the CSV data
 * - Generate email content for each submission
 * - Create a batch email script you can run
 */

const fs = require('fs');
const path = require('path');

// Email template (matches your Resend API template)
function generateEmailHTML(email, eventDate, eventLocation, eventTime, contactEmail, ticketPrice) {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #E6397F; text-align: center;">Welcome to BYO Cake Club! 🎂</h1>
  
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #E6397F; margin-top: 0;">Event Details</h2>
    <p><strong>Date:</strong> ${eventDate}</p>
    <p><strong>Location:</strong> ${eventLocation}</p>
    <p><strong>Time:</strong> ${eventTime}</p>
    <p><strong>Cost:</strong> ${ticketPrice}</p>
  </div>
  
  <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #856404; margin-top: 0;">What to Bring</h3>
    <p>Please bring your own cake creation to share! Homemade and decorated cakes are encouraged.</p>
  </div>
  
  <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #0c5460; margin-top: 0;">RSVP Required</h3>
    <p>Please email us at <a href="mailto:${contactEmail}" style="color: #E6397F;">${contactEmail}</a> to confirm your attendance so we can plan for numbers!</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <p>We're excited to see your delicious creations!</p>
    <p>Questions? Email us at <a href="mailto:${contactEmail}" style="color: #E6397F;">${contactEmail}</a></p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; font-size: 14px;">Made with love and lots of sugar 🍰</p>
    <p style="color: #666; font-size: 12px;">© 2025 BYO Cake Club</p>
  </div>
</div>`;
}

// Parse CSV data
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const submissions = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const submission = {};
    
    headers.forEach((header, index) => {
      submission[header] = values[index] || '';
    });
    
    submissions.push(submission);
  }
  
  return submissions;
}

// Generate batch email script
function generateBatchScript(submissions) {
  const eventDetails = {
    event_date: 'October 4th, 2025',
    event_location: "Camel's Back Park",
    event_time: '11:00 AM - 1:00 PM',
    contact_email: 'bringyourowncake@gmail.com',
    ticket_price: '$5 per person'
  };

  let script = `#!/usr/bin/env node

/**
 * Batch Email Script for BYO Cake Club
 * Generated from Netlify Forms data
 * 
 * Run this script to send emails to all collected addresses
 * Make sure you have RESEND_API_KEY set in your environment
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY environment variable is required');
  process.exit(1);
}

const emails = [
`;

  submissions.forEach((submission, index) => {
    const email = submission.email || submission.Email;
    if (email && email.includes('@')) {
      script += `  '${email}',\n`;
    }
  });

  script += `];

const eventDetails = ${JSON.stringify(eventDetails, null, 2)};

async function sendBatchEmails() {
  console.log(\`📧 Starting batch email send to \${emails.length} addresses...\`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(\`[\${i + 1}/\${emails.length}] Sending to: \${email}\`);
    
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${RESEND_API_KEY}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'BYO Cake Club <noreply@bringyourowncake.com>',
          to: [email],
          subject: 'Welcome to BYO Cake Club! 🎂',
          html: \`${generateEmailHTML('${email}', '${eventDetails.event_date}', '${eventDetails.event_location}', '${eventDetails.event_time}', '${eventDetails.contact_email}', '${eventDetails.ticket_price}')}\`,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(\`✅ Sent successfully: \${result.id}\`);
        successCount++;
      } else {
        const error = await response.json();
        console.error(\`❌ Failed to send to \${email}:`, error);
        errorCount++;
      }
      
      // Add delay to avoid rate limiting
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(\`❌ Error sending to \${email}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(\`\\n📊 Batch email complete!\`);
  console.log(\`✅ Successful: \${successCount}\`);
  console.log(\`❌ Failed: \${errorCount}\`);
  console.log(\`📧 Total processed: \${emails.length}\`);
}

sendBatchEmails().catch(console.error);
`;

  return script;
}

// Main execution
function main() {
  const csvPath = path.join(__dirname, 'netlify-forms-export.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('❌ CSV file not found!');
    console.log('');
    console.log('📋 Instructions:');
    console.log('1. Go to your Netlify dashboard');
    console.log('2. Navigate to Forms → [Your Site] → signup');
    console.log('3. Click "Export" and download as CSV');
    console.log('4. Save the file as "netlify-forms-export.csv" in this directory');
    console.log('5. Run this script again');
    console.log('');
    console.log('💡 The CSV should have columns like: email, submitted_at, etc.');
    return;
  }
  
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const submissions = parseCSV(csvContent);
    
    console.log(`📊 Found ${submissions.length} form submissions`);
    
    // Filter valid emails
    const validEmails = submissions.filter(sub => {
      const email = sub.email || sub.Email;
      return email && email.includes('@');
    });
    
    console.log(`📧 Found ${validEmails.length} valid email addresses`);
    
    if (validEmails.length === 0) {
      console.log('❌ No valid email addresses found in the CSV');
      return;
    }
    
    // Generate batch script
    const batchScript = generateBatchScript(validEmails);
    const scriptPath = path.join(__dirname, 'send-batch-emails.js');
    
    fs.writeFileSync(scriptPath, batchScript);
    fs.chmodSync(scriptPath, '755'); // Make executable
    
    console.log('');
    console.log('✅ Batch email script generated!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Set your RESEND_API_KEY environment variable');
    console.log('2. Run: node scripts/send-batch-emails.js');
    console.log('');
    console.log('⚠️  Note: The script includes a 1-second delay between emails');
    console.log('   to avoid rate limiting. Adjust as needed.');
    console.log('');
    console.log('📧 Emails to be sent:');
    validEmails.forEach((sub, index) => {
      const email = sub.email || sub.Email;
      const date = sub.submitted_at || sub['Submitted at'] || 'Unknown date';
      console.log(`   ${index + 1}. ${email} (submitted: ${date})`);
    });
    
  } catch (error) {
    console.error('❌ Error processing CSV:', error.message);
  }
}

main();
