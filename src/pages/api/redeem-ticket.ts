import { createClient } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';
import { findTicketByCode, redeemTicket } from '../../lib/mock-tickets.js';

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

    console.log('Redeeming ticket code:', cleanCode);

    // Determine whether to use Supabase (production) or mock data (development)
    const isProduction = hasSupabase;
    console.log(`Environment: ${isProduction ? 'Production (Supabase)' : 'Development (Mock Data)'}`);

    if (isProduction && supabase) {
      // Production: Use Supabase database
      const { data: existingTicket, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('code', cleanCode)
        .single();

      if (fetchError) {
        console.error('Database error fetching ticket:', fetchError);
        
        if (fetchError.code === 'PGRST116') {
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

      if (!existingTicket) {
        return new Response(
          JSON.stringify({ error: 'Ticket not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Check if ticket is already redeemed
      if (existingTicket.redeemed_at) {
        return new Response(
          JSON.stringify({ 
            error: 'Ticket has already been redeemed',
            redeemed_at: existingTicket.redeemed_at
          }),
          {
            status: 409, // Conflict
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Update the ticket to mark it as redeemed
      const now = new Date().toISOString();
      const { data: updatedTicket, error: updateError } = await supabase
        .from('tickets')
        .update({
          redeemed_at: now
        })
        .eq('code', cleanCode)
        .select()
        .single();

      if (updateError) {
        console.error('Database error updating ticket:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to redeem ticket' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Return production redemption response
      console.log('Ticket successfully redeemed (production):', {
        code: updatedTicket.code,
        email: updatedTicket.email,
        name: `${updatedTicket.first_name} ${updatedTicket.last_name}`,
        redeemed_at: updatedTicket.redeemed_at
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Ticket successfully redeemed',
          ticket: {
            id: updatedTicket.id,
            code: updatedTicket.code,
            email: updatedTicket.email,
            first_name: updatedTicket.first_name,
            last_name: updatedTicket.last_name,
            quantity: updatedTicket.quantity,
            stripe_payment_intent: updatedTicket.stripe_payment_intent,
            stripe_checkout_session: updatedTicket.stripe_checkout_session,
            amount_total: updatedTicket.amount_total,
            currency: updatedTicket.currency,
            payment_status: updatedTicket.payment_status,
            address: updatedTicket.address,
            redeemed_at: updatedTicket.redeemed_at,
            issued_at: updatedTicket.issued_at
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Development: Use mock data
      const existingTicket = findTicketByCode(cleanCode);

      if (!existingTicket) {
        return new Response(
          JSON.stringify({ error: 'Ticket not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Check if ticket is already redeemed
      if (existingTicket.redeemed_at) {
        return new Response(
          JSON.stringify({ 
            error: 'Ticket has already been redeemed',
            redeemed_at: existingTicket.redeemed_at
          }),
          {
            status: 409, // Conflict
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Update the ticket to mark it as redeemed
      const updatedTicket = redeemTicket(cleanCode);
      
      if (!updatedTicket) {
        return new Response(
          JSON.stringify({ error: 'Failed to redeem ticket' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      console.log('Ticket successfully redeemed (development):', {
        code: updatedTicket.code,
        email: updatedTicket.email,
        name: `${updatedTicket.first_name} ${updatedTicket.last_name}`,
        redeemed_at: updatedTicket.redeemed_at
      });

      // Return development redemption response
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Ticket successfully redeemed',
          ticket: {
            id: updatedTicket.id,
            code: updatedTicket.code,
            email: updatedTicket.email,
            first_name: updatedTicket.first_name,
            last_name: updatedTicket.last_name,
            quantity: updatedTicket.quantity,
            stripe_payment_intent: updatedTicket.stripe_payment_intent,
            stripe_checkout_session: updatedTicket.stripe_checkout_session,
            amount_total: updatedTicket.amount_total,
            currency: updatedTicket.currency,
            payment_status: updatedTicket.payment_status,
            address: updatedTicket.address,
            redeemed_at: updatedTicket.redeemed_at,
            issued_at: updatedTicket.issued_at
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Unexpected error in redeem-ticket:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
