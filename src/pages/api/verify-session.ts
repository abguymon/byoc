import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Get session token from cookie
    const cookieHeader = request.headers.get('cookie');
    const sessionToken = cookieHeader
      ?.split(';')
      .find(c => c.trim().startsWith('staff_session='))
      ?.split('=')[1];

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ authenticated: false }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      // Decode and verify session token
      const sessionData = JSON.parse(atob(sessionToken));
      
      // Check if session is expired
      if (sessionData.expires < Date.now()) {
        return new Response(
          JSON.stringify({ authenticated: false, expired: true }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Check if session is valid
      if (!sessionData.authenticated) {
        return new Response(
          JSON.stringify({ authenticated: false }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          authenticated: true,
          expires: sessionData.expires
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );

    } catch (decodeError) {
      return new Response(
        JSON.stringify({ authenticated: false }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Unexpected error in verify-session:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};