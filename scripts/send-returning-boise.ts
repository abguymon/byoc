/**
 * One-time send script for returning Boise attendees.
 *
 * Usage:
 *   node --experimental-strip-types scripts/send-returning-boise.ts --list emails.txt
 *   node --experimental-strip-types scripts/send-returning-boise.ts --list emails.txt --send
 *
 * --list  Path to a plain text file with one email address per line (# comments ok)
 * --send  Actually send. Without this flag the script is a dry run.
 *
 * Requires RESEND_API_KEY in environment (or a .env file).
 */

import { readFileSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';
import { Resend } from 'resend';
import { returningBoiseEmailHtml } from '../src/emails/returning-boise.ts';

// --- config ---
const FROM = process.env.MAIL_FROM ?? 'BYO Cake Club <noreply@bringyourowncake.com>';
const SUBJECT = "We're bringing the cake picnic back to Boise 🎂";
const DELAY_MS = 200; // be gentle with the API

// --- args ---
const args = process.argv.slice(2);
const listFlag = args.indexOf('--list');
const isDryRun = !args.includes('--send');

if (listFlag === -1 || !args[listFlag + 1]) {
  console.error('Usage: node --experimental-strip-types scripts/send-returning-boise.ts --list <emails.txt> [--send]');
  process.exit(1);
}

// --- load emails ---
const listPath = args[listFlag + 1];
const emails = readFileSync(listPath, 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#') && line.includes('@'));

if (emails.length === 0) {
  console.error('No valid email addresses found in', listPath);
  process.exit(1);
}

// --- send ---
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('RESEND_API_KEY is not set');
  process.exit(1);
}

const resend = new Resend(apiKey);
const html = returningBoiseEmailHtml({
  checkoutUrlBoise: process.env.STRIPE_CHECKOUT_URL_BOISE,
  checkoutUrlSlc: process.env.STRIPE_CHECKOUT_URL_SLC,
});

console.log(`\n${isDryRun ? '🔍 DRY RUN — pass --send to actually send' : '🚀 SENDING'}`);
console.log(`From:    ${FROM}`);
console.log(`Subject: ${SUBJECT}`);
console.log(`To:      ${emails.length} recipient(s)\n`);

let sent = 0;
let failed = 0;

for (const email of emails) {
  if (isDryRun) {
    console.log(`  [dry run] → ${email}`);
    continue;
  }

  try {
    await resend.emails.send({ from: FROM, to: [email], subject: SUBJECT, html });
    console.log(`  ✓ ${email}`);
    sent++;
  } catch (err) {
    console.error(`  ✗ ${email}:`, err instanceof Error ? err.message : err);
    failed++;
  }

  await setTimeout(DELAY_MS);
}

if (!isDryRun) {
  console.log(`\nDone. ${sent} sent, ${failed} failed.`);
}
