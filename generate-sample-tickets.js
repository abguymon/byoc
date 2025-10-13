#!/usr/bin/env node
// Sample ticket generator for BYOC staff testing

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample ticket data
const sampleTickets = [
  {
    code: "TCKT-JANE2024",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    quantity: 2,
    issued_at: new Date().toISOString(),
    redeemed_at: null // Not redeemed
  },
  {
    code: "TCKT-JOHN2024", 
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    quantity: 1,
    issued_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    redeemed_at: null // Not redeemed
  },
  {
    code: "TCKT-MARY2024",
    firstName: "Mary",
    lastName: "Johnson", 
    email: "mary.johnson@example.com",
    quantity: 3,
    issued_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    redeemed_at: new Date().toISOString() // Already redeemed
  },
  {
    code: "TCKT-BOB2024",
    firstName: "Bob",
    lastName: "Wilson",
    email: "bob.wilson@example.com", 
    quantity: 1,
    issued_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    redeemed_at: null // Not redeemed
  },
  {
    code: "TCKT-SARAH2024",
    firstName: "Sarah",
    lastName: "Brown",
    email: "sarah.brown@example.com",
    quantity: 2,
    issued_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    redeemed_at: new Date(Date.now() - 86400000).toISOString() // Redeemed yesterday
  }
];

// Create HTML test page with QR codes
function generateTestPage() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BYOC Sample Tickets - Testing</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            margin-bottom: 30px;
        }
        .tickets-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .ticket-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        .ticket-code {
            font-size: 18px;
            font-weight: 600;
            color: #e91e63;
            margin-bottom: 10px;
            font-family: 'Courier New', monospace;
        }
        .qr-code {
            margin: 15px 0;
            display: inline-block;
        }
        .ticket-info {
            font-size: 14px;
            color: #666;
            margin: 10px 0;
        }
        .status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
        }
        .status.redeemed {
            background: #fee;
            color: #c53030;
        }
        .status.valid {
            background: #efe;
            color: #2f855a;
        }
        .instructions {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .instructions h2 {
            color: #e91e63;
            margin-top: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍰 BYOC Sample Tickets for Testing</h1>
        
        <div class="instructions">
            <h2>How to Test:</h2>
            <ol>
                <li>Go to <strong>http://localhost:4321/staff</strong> and login with password: <code>cake2024</code></li>
                <li>Click "Start Scanner" to use your camera, OR use manual entry</li>
                <li>Scan any QR code below, or manually type the ticket code</li>
                <li>Verify the ticket information displays correctly</li>
                <li>Test marking redeemed/valid tickets as redeemed</li>
            </ol>
        </div>

        <div class="tickets-grid">
            ${sampleTickets.map(ticket => `
                <div class="ticket-card">
                    <div class="ticket-code">${ticket.code}</div>
                    <div class="qr-code" id="qr-${ticket.code}"></div>
                    <div class="ticket-info">
                        <strong>${ticket.firstName} ${ticket.lastName}</strong><br>
                        ${ticket.email}<br>
                        Quantity: ${ticket.quantity}<br>
                        <span class="status ${ticket.redeemed_at ? 'redeemed' : 'valid'}">
                            ${ticket.redeemed_at ? 'Already Redeemed' : 'Valid - Not Redeemed'}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        // Generate QR codes for each ticket
        ${sampleTickets.map(ticket => `
            QRCode.toCanvas(document.getElementById('qr-${ticket.code}'), '${ticket.code}', {
                width: 150,
                margin: 1,
                color: {
                    dark: '#e91e63',
                    light: '#ffffff'
                }
            }, function (error) {
                if (error) console.error('QR Code generation error for ${ticket.code}:', error);
            });
        `).join('')}
    </script>
</body>
</html>`;

  return html;
}

// Generate the test page
const testPageContent = generateTestPage();
fs.writeFileSync(path.join(__dirname, 'sample-tickets.html'), testPageContent);

console.log(`
✅ Sample tickets generated successfully!

📁 Files created:
- sample-tickets.html (Test page with QR codes)

🎫 Sample Ticket Codes:
${sampleTickets.map(ticket => `- ${ticket.code} (${ticket.firstName} ${ticket.lastName}) - ${ticket.redeemed_at ? 'REDEEMED' : 'VALID'}`).join('\n')}

🌐 Open sample-tickets.html in your browser to see QR codes:
- file://${path.join(__dirname, 'sample-tickets.html').replace(/\\/g, '/')}

🧪 Testing Steps:
1. Start staff page: http://localhost:4321/staff
2. Login with password: cake2024  
3. Scan QR codes or manually enter ticket codes
4. Test verification and redemption features

📱 For mobile testing: Serve the HTML file over HTTP, not file://
`);

// Also create a simple text list for reference
const textList = sampleTickets.map(ticket => 
  `${ticket.code} | ${ticket.firstName} ${ticket.lastName} | ${ticket.email} | Qty: ${ticket.quantity} | Status: ${ticket.redeemed_at ? 'REDEEMED' : 'VALID'}`
).join('\n');

fs.writeFileSync(path.join(__dirname, 'sample-tickets.txt'), textList);
console.log('\n📝 Also created: sample-tickets.txt (text version)');
