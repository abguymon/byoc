#!/bin/bash

# BYOC Staff Testing Setup Script

echo "🍰 BYOC Staff Testing Setup"
echo "================================"

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

echo "📱 Starting dev server for main app..."
cd /home/adambg/workspace/byoc
npm run dev &
DEV_PID=$!

echo "Waiting for dev server to start..."
sleep 3

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🚀 Available URLs:"
echo "   Main App:          http://localhost:4321/"
echo "   Staff Portal:      http://localhost:4321/staff"
echo "   Sample Tickets:    http://localhost:8080/sample-tickets.html"
echo ""
echo "🔑 Staff Password:    cake2024"
echo ""
echo "🎫 Sample Ticket Codes:"
echo "   TCKT-JANE2024     (Jane Smith)      - VALID"
echo "   TCKT-JOHN2024     (John Doe)        - VALID" 
echo "   TCKT-MARY2024     (Mary Johnson)    - REDEEMED"
echo "   TCKT-BOB2024      (Bob Wilson)      - VALID"
echo "   TCKT-SARAH2024    (g Sarah Brown)   - REDEEMED"
echo ""
echo "🧪 Testing:"
echo "   1. Open staff portal: http://localhost:4321/staff"
echo "   2. Login with password: cake2024"
echo "   3. Open sample tickets: http://localhost:8080/sample-tickets.html (on phone for QR scanning)"
echo "   4. Scan QR codes or manually enter ticket codes"
echo ""
echo "Press Ctrl+C to stop all servers"

wait $DEV_PID
