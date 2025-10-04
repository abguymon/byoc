import { createClient } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';
import { findTicketByCode } from '../../lib/mock-tickets.js';

// Check if we have Supabase credentials (production)
const hasSupabase = import.meta.env.SUPABASE_URL && import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = hasSupabase ? createClient(
  import.meta.env.SUPABASE_URL!,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY!
) : null;


export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if request has body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse JSON
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { code } = body;

    // Validate ticket code
    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Ticket code is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Clean the code (remove any whitespace)
    const cleanCode = code.trim().toUpperCase();

    // Validate code format (should start with TCKT-)
    if (!cleanCode.startsWith('TCKT-')) {
      return new Response(
        JSON.stringify({ error: 'Invalid ticket code format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Verifying ticket code:', cleanCode);

    // Determine whether to use Supabase (production) or mock data (development)
    const isProduction = hasSupabase;
    console.log(`Environment: ${isProduction ? 'Production (Supabase)' : 'Development (Mock Data)'}`);

    if (isProduction && supabase) {
      // Production: Query the real database
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('code', cleanCode)
        .single();

      if (error) {
        console.error('Database error:', error);
        
        if (error.code === 'PGRST116') {
          // No rows returned
          return new Response(
            JSON.stringify({ error: 'Ticket not found' }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'Database error occurred' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (!ticket) {
        return new Response(
          JSON.stringify({ error: 'Ticket not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Return production ticket data
      console.log('Ticket found (production):', {
        code: ticket.code,
        email: ticket.email,
        name: `${ticket.first_name} ${ticket.last_name}`,
        redeemed: !!ticket.redeemed_at
      });

      return new Response(
        JSON.stringify({
          success: true,
          ticket: {
            id: ticket.id,
            code: ticket.code,
            email: ticket.email,
            first_name: ticket.first_name,
            last_name: ticket.last_name,
            quantity: ticket.quantity,
        stripe_payment_intent: ticket.stripe_payment_intent,
            stripe_checkout_session: ticket.stripe_checkout_session,
            amount_total: ticket.amount_total,
            currency: ticket.currency,
            payment_status: ticket.payment_status,
            address: ticket.address,
            redeemed_at: ticket.redeemed_at,
            issued_at: ticket.issued_at
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Development: Use mock data
      const ticket = findTicketByCode(cleanCode);

      if (!ticket) {
        return new Response(
          JSON.stringify({ error: 'Ticket not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Ticket found (development):', {
        code: ticket.code,
        email: ticket.email,
        name: `${ticket.first_name} ${ticket.last_name}`,
        redeemed: !!ticket.redeemed_at
      });

      // Return development ticket information
      return new Response(
        JSON.stringify({
          success: true,
          ticket: {
            id: ticket.id,
            code: ticket.code,
            email: ticket.email,
            first_name: ticket.first_name,
            last_name: ticket.last_name,
            quantity: ticket.quantity,
            stripe_payment_intent: ticket.stripe_payment_intent,
            stripe_checkout_session: ticket.stripe_checkout_session,
            amount_total: ticket.amount_total,
            currency: ticket.currency,
            payment_status: ticket.payment_status,
            address: ticket.address,
            redeemed_at: ticket.redeemed_at,
            issued_at: ticket.issued_at
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Unexpected error in verify-ticket:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
