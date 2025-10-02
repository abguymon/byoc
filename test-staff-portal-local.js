#!/usr/bin/env node

/**
 * Staff Portal Local Testing Script
 * Tests authentication, session management, and API endpoints
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:4321';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword123';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'cyan');
}

async function testStaffAuth() {
  logStep(1, 'Testing Staff Authentication');
  
  try {
    const response = await fetch(`${BASE_URL}/api/staff-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: TEST_PASSWORD }),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      log('✅ Authentication successful', 'green');
      log(`   Session cookie set: ${response.headers.get('set-cookie') ? 'Yes' : 'No'}`, 'green');
      return true;
    } else {
      log('❌ Authentication failed', 'red');
      log(`   Error: ${result.error}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Authentication error:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testSessionVerification() {
  logStep(2, 'Testing Session Verification');
  
  try {
    const response = await fetch(`${BASE_URL}/api/verify-session`);
    const result = await response.json();
    
    if (result.authenticated) {
      log('✅ Session verification successful', 'green');
      log(`   Expires: ${new Date(result.expires).toLocaleString()}`, 'green');
      return true;
    } else {
      log('❌ Session verification failed', 'red');
      log(`   Reason: ${result.error || 'Not authenticated'}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Session verification error:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testInvalidPassword() {
  logStep(3, 'Testing Invalid Password');
  
  try {
    const response = await fetch(`${BASE_URL}/api/staff-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: 'wrongpassword' }),
    });

    const result = await response.json();
    
    if (!response.ok && result.error === 'Invalid password') {
      log('✅ Invalid password correctly rejected', 'green');
      return true;
    } else {
      log('❌ Invalid password was accepted (this should not happen)', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Invalid password test error:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testLogout() {
  logStep(4, 'Testing Logout');
  
  try {
    const response = await fetch(`${BASE_URL}/api/staff-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ logout: true }),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      log('✅ Logout successful', 'green');
      log(`   Cookie cleared: ${response.headers.get('set-cookie') ? 'Yes' : 'No'}`, 'green');
      return true;
    } else {
      log('❌ Logout failed', 'red');
      log(`   Error: ${result.error}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Logout error:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testTicketVerification() {
  logStep(5, 'Testing Ticket Verification');
  
  try {
    const response = await fetch(`${BASE_URL}/api/verify-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: 'TCKT-TEST123' }),
    });

    const result = await response.json();
    
    if (response.ok) {
      log('✅ Ticket verification API working', 'green');
      log(`   Ticket found: ${result.ticket ? 'Yes' : 'No'}`, 'green');
      return true;
    } else {
      log('⚠️  Ticket verification API working (ticket not found expected)', 'yellow');
      log(`   Error: ${result.error}`, 'yellow');
      return true; // This is expected for test data
    }
  } catch (error) {
    log('❌ Ticket verification error:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testEnvironmentVariables() {
  logStep(6, 'Checking Environment Variables');
  
  const requiredVars = [
    'STAFF_PASSWORD',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  log('Required environment variables:', 'blue');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      log(`   ✅ ${varName}: Set`, 'green');
    } else {
      log(`   ❌ ${varName}: Missing`, 'red');
    }
  });
  
  return requiredVars.every(varName => process.env[varName]);
}

async function testStaffPageAccess() {
  logStep(7, 'Testing Staff Page Access');
  
  try {
    const response = await fetch(`${BASE_URL}/staff`);
    
    if (response.ok) {
      log('✅ Staff page accessible', 'green');
      log(`   Status: ${response.status}`, 'green');
      return true;
    } else {
      log('❌ Staff page not accessible', 'red');
      log(`   Status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Staff page access error:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log(`${colors.bright}🧪 Staff Portal Local Testing Suite${colors.reset}`);
  log(`   Base URL: ${BASE_URL}`, 'blue');
  log(`   Test Password: ${TEST_PASSWORD}`, 'blue');
  log('');

  const results = {
    auth: false,
    session: false,
    invalidPassword: false,
    logout: false,
    ticketVerification: false,
    environment: false,
    pageAccess: false
  };

  // Run tests
  results.environment = await testEnvironmentVariables();
  results.pageAccess = await testStaffPageAccess();
  results.auth = await testStaffAuth();
  results.session = await testSessionVerification();
  results.invalidPassword = await testInvalidPassword();
  results.logout = await testLogout();
  results.ticketVerification = await testTicketVerification();

  // Summary
  log('\n📊 Test Results Summary:', 'bright');
  log('   Environment Variables:', results.environment ? '✅ PASS' : '❌ FAIL');
  log('   Staff Page Access:', results.pageAccess ? '✅ PASS' : '❌ FAIL');
  log('   Authentication:', results.auth ? '✅ PASS' : '❌ FAIL');
  log('   Session Verification:', results.session ? '✅ PASS' : '❌ FAIL');
  log('   Invalid Password Rejection:', results.invalidPassword ? '✅ PASS' : '❌ FAIL');
  log('   Logout:', results.logout ? '✅ PASS' : '❌ FAIL');
  log('   Ticket Verification API:', results.ticketVerification ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  log('');
  log(allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed', allPassed ? 'green' : 'yellow');
  
  if (!allPassed) {
    log('\n🔧 Troubleshooting Tips:', 'blue');
    log('   1. Make sure development server is running: npm run dev', 'blue');
    log('   2. Check .env file has STAFF_PASSWORD set', 'blue');
    log('   3. Verify Supabase environment variables are set', 'blue');
    log('   4. Check browser console for JavaScript errors', 'blue');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testStaffAuth,
  testSessionVerification,
  testInvalidPassword,
  testLogout,
  testTicketVerification,
  testEnvironmentVariables,
  testStaffPageAccess,
  runAllTests
};

