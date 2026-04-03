-- Migration to add redeemed_at field to tickets table
-- Run this SQL in your Supabase SQL editor

-- Add redeemed_at column to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster lookups on redeemed status
CREATE INDEX IF NOT EXISTS idx_tickets_redeemed_at ON tickets(redeemed_at);

-- Add index for faster lookups on code and redeemed status
CREATE INDEX IF NOT EXISTS idx_tickets_code_redeemed ON tickets(code, redeemed_at);

-- Update existing tickets to have NULL redeemed_at (they haven't been redeemed yet)
UPDATE tickets 
SET redeemed_at = NULL 
WHERE redeemed_at IS NULL;

-- Optional: Add a comment to document the field
COMMENT ON COLUMN tickets.redeemed_at IS 'Timestamp when the ticket was redeemed/used at the event';

-- Add city column for multi-city events (Spring 2026: boise, slc)
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS city TEXT;

COMMENT ON COLUMN tickets.city IS 'Event city the ticket is for (boise, slc)';

CREATE INDEX IF NOT EXISTS idx_tickets_city ON tickets(city);
