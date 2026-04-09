import { createClient } from '@supabase/supabase-js';
import { findTicketByCode, redeemTicket as mockRedeemTicket } from './mock-tickets.js';

export type Ticket = {
  id: string | number;
  code: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  quantity: number;
  stripe_payment_intent: string;
  stripe_checkout_session: string;
  amount_total: number | null;
  currency: string | null;
  payment_status: string | null;
  address: unknown | null;
  redeemed_at: string | null;
  issued_at: string;
  city: string | null;
};

const supabase = import.meta.env.SUPABASE_URL
  ? createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function getTicketByCode(code: string): Promise<Ticket | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('code', code)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
  return findTicketByCode(code) ?? null;
}

export async function markTicketRedeemed(code: string): Promise<Ticket | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('tickets')
      .update({ redeemed_at: new Date().toISOString() })
      .eq('code', code)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  return mockRedeemTicket(code);
}
