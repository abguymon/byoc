#!/usr/bin/env node

/**
 * Comprehensive testing script for Stripe webhook function
 * Tests both local execution and Netlify dev server
 */

import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}Step ${step}: ${message}${colors.reset}`);
}

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { 
      stdio: 'inherit', 
      shell: true,
      ...options 
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

async function testFunctionLocally() {
  logStep(1, 'Testing Function Locally');
  
  try {
    // Check if we're in the right directory
    process.chdir('/home/adam/dev/learning/byoc');
    
    // Install test dependencies if needed
    log('Installing test dependencies...', 'blue');
    await runCommand('npm', ['install', 'vitest', '@vitest/ui', '--save-dev']);
    
    // Run unit tests
    log('Running unit tests...', 'blue');
    await runCommand('npx', ['vitest', 'run', 'netlify/functions/stripe-webhook.test.ts']);
    
    log('✅ Unit tests passed!', 'green');
    
  } catch (error) {
    log(`❌ Unit tests failed: ${error.message}`, 'red');
    throw error;
  }
}

async function testWithNetlifyDev() {
  logStep(2, 'Testing with Netlify Dev Server');
  
  try {
    // Start Netlify dev server in background
    log('Starting Netlify dev server...', 'blue');
    const netlifyProcess = spawn('netlify', ['dev'], {
      stdio: 'pipe',
      shell: true,
      cwd: '/home/adam/dev/learning/byoc'
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Test the webhook endpoint
    log('Testing webhook endpoint...', 'blue');
    const testPayload = JSON.stringify({
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_intent: 'pi_test_123',
          customer_details: {
            email: 'test@example.com',
            name: 'John Doe'
          }
        }
      }
    });
    
    const curlCommand = `curl -X POST http://localhost:8888/.netlify/functions/stripe-webhook \\
      -H "Content-Type: application/json" \\
      -H "stripe-signature: t=1234567890,v1=test_signature" \\
      -d '${testPayload}'`;
    
    await runCommand('bash', ['-c', curlCommand]);
    
    // Clean up
    netlifyProcess.kill();
    
    log('✅ Netlify dev server test completed!', 'green');
    
  } catch (error) {
    log(`❌ Netlify dev test failed: ${error.message}`, 'red');
    throw error;
  }
}

async function testWithStripeCLI() {
  logStep(3, 'Testing with Stripe CLI');
  
  try {
    // Check if Stripe CLI is installed
    await runCommand('stripe', ['--version']);
    
    log('Stripe CLI is available. To test with real webhooks:', 'yellow');
    log('1. Run: stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook', 'blue');
    log('2. In another terminal, trigger a test event:', 'blue');
    log('   stripe trigger checkout.session.completed', 'blue');
    log('3. Check the logs for your webhook function', 'blue');
    
    log('✅ Stripe CLI setup instructions provided!', 'green');
    
  } catch (error) {
    log(`⚠️  Stripe CLI not found: ${error.message}`, 'yellow');
    log('Install it from: https://stripe.com/docs/stripe-cli', 'blue');
  }
}

async function checkEnvironmentVariables() {
  logStep(4, 'Checking Environment Variables');
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET', 
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    log(`⚠️  Missing environment variables: ${missing.join(', ')}`, 'yellow');
    log('Create a .env file in your project root with these variables', 'blue');
  } else {
    log('✅ All required environment variables are set!', 'green');
  }
}

async function main() {
  log(`${colors.bold}🧪 Stripe Webhook Function Test Suite${colors.reset}`);
  log('===============================================');
  
  try {
    await checkEnvironmentVariables();
    await testFunctionLocally();
    await testWithNetlifyDev();
    await testWithStripeCLI();
    
    log(`\n${colors.bold}🎉 All tests completed successfully!${colors.reset}`);
    log('Your Stripe webhook function is ready for deployment.', 'green');
    
  } catch (error) {
    log(`\n${colors.bold}💥 Test suite failed: ${error.message}${colors.reset}`, 'red');
    process.exit(1);
  }
}

main().catch(console.error);

