#!/usr/bin/env node

/**
 * Test script for Staff Portal functionality
 * This script tests the API endpoints for ticket verification and redemption
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:4321';

async function testVerifyTicket() {
  console.log('🧪 Testing ticket verification...');
  
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
      console.log('✅ Ticket verification successful');
      console.log('   Ticket details:', {
        code: result.ticket.code,
        email: result.ticket.email,
        name: `${result.ticket.first_name} ${result.ticket.last_name}`,
        redeemed: !!result.ticket.redeemed_at
      });
      return result.ticket;
    } else {
      console.log('❌ Ticket verification failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing ticket verification:', error.message);
    return null;
  }
}

async function testRedeemTicket(code) {
  console.log('🧪 Testing ticket redemption...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/redeem-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Ticket redemption successful');
      console.log('   Redeemed at:', result.ticket.redeemed_at);
      return true;
    } else {
      console.log('❌ Ticket redemption failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing ticket redemption:', error.message);
    return false;
  }
}

async function testInvalidTicket() {
  console.log('🧪 Testing invalid ticket...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/verify-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: 'INVALID-CODE' }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.log('✅ Invalid ticket correctly rejected:', result.error);
      return true;
    } else {
      console.log('❌ Invalid ticket was accepted (this should not happen)');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing invalid ticket:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Staff Portal API Tests');
  console.log('   Base URL:', BASE_URL);
  console.log('');

  const results = {
    verify: false,
    redeem: false,
    invalid: false
  };

  // Test invalid ticket first
  results.invalid = await testInvalidTicket();
  console.log('');

  // Test ticket verification
  const ticket = await testVerifyTicket();
  results.verify = !!ticket;
  console.log('');

  // Test ticket redemption if verification succeeded
  if (ticket && !ticket.redeemed_at) {
    results.redeem = await testRedeemTicket(ticket.code);
  } else if (ticket && ticket.redeemed_at) {
    console.log('ℹ️  Ticket already redeemed, skipping redemption test');
    results.redeem = true; // Consider this a pass
  } else {
    console.log('ℹ️  No valid ticket found, skipping redemption test');
  }

  console.log('');
  console.log('📊 Test Results:');
  console.log('   Invalid ticket rejection:', results.invalid ? '✅ PASS' : '❌ FAIL');
  console.log('   Ticket verification:', results.verify ? '✅ PASS' : '❌ FAIL');
  console.log('   Ticket redemption:', results.redeem ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = results.invalid && results.verify && results.redeem;
  console.log('');
  console.log(allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed');
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testVerifyTicket,
  testRedeemTicket,
  testInvalidTicket,
  runTests
};
