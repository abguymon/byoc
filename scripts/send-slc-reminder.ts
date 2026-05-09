/**
 * One-time broadcast of the SLC event reminder to all ticket holders.
 *
 * Usage:
 *   node --experimental-strip-types scripts/send-slc-reminder.ts --csv path/to/emails.csv
 *   node --experimental-strip-types scripts/send-slc-reminder.ts --csv path/to/emails.csv --send
 *
 * --csv   Path to a CSV file with an "email" header column (exported from Supabase).
 * --send  Actually send. Without this flag the script is a dry run.
 *
 * Requires RESEND_API_KEY in environment.
 */

import { readFileSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';
import { Resend } from 'resend';
import { slcReminderEmailHtml } from '../src/emails/slc-reminder.ts';

const FROM = process.env.MAIL_FROM ?? 'BYO Cake Club <noreply@bringyourowncake.com>';
const SUBJECT = 'See you Saturday, Salt Lake! 🎂 Event Reminder';
const DELAY_MS = 200;

const args = process.argv.slice(2);
const csvFlag = args.indexOf('--csv');
const isDryRun = !args.includes('--send');

if (csvFlag === -1 || !args[csvFlag + 1]) {
  console.error('Usage: node --experimental-strip-types scripts/send-slc-reminder.ts --csv <emails.csv> [--send]');
  process.exit(1);
}

const csvPath = args[csvFlag + 1];
const lines = readFileSync(csvPath, 'utf-8').split('\n').map(l => l.trim());

// Find the index of the "email" column from the header row
const header = lines[0].split(',').map(h => h.trim().toLowerCase());
const emailCol = header.indexOf('email');
if (emailCol === -1) {
  console.error('CSV must have an "email" column header');
  process.exit(1);
}

const emails = lines
  .slice(1)
  .map(line => line.split(',')[emailCol]?.trim() ?? '')
  .filter(e => e && e.includes('@'));

if (emails.length === 0) {
  console.error('No valid email addresses found in', csvPath);
  process.exit(1);
}

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey && !isDryRun) {
  console.error('RESEND_API_KEY is not set');
  process.exit(1);
}

const resend = apiKey ? new Resend(apiKey) : null;
const html = slcReminderEmailHtml();

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
    await resend!.emails.send({ from: FROM, to: [email], subject: SUBJECT, html });
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
