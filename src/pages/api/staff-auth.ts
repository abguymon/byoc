import type { APIRoute } from 'astro';

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

    const { password, logout } = body;

    // Handle logout
    if (logout) {
      return new Response(
        JSON.stringify({ success: true, message: 'Logged out successfully' }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Set-Cookie': 'staff_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
          },
        }
      );
    }

    // Validate password
    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get staff password from environment variable (server-side only)
    const staffPassword = import.meta.env.STAFF_PASSWORD;
    
    if (!staffPassword) {
      console.error('STAFF_PASSWORD environment variable not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify password (server-side comparison)
    if (password === staffPassword) {
      // Generate a session token
      const sessionToken = btoa(JSON.stringify({
        authenticated: true,
        timestamp: Date.now(),
        expires: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
      }));

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Authentication successful'
        }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Set-Cookie': `staff_session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=28800; Path=/`
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Unexpected error in staff-auth:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};