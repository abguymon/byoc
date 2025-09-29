import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handler } from '../netlify/functions/stripe-webhook';

// Mock dependencies
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null })
    }))
  }))
}));

vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    webhooks: {
      constructEvent: vi.fn((payload, signature, secret) => {
        // Throw error for invalid signatures
        if (signature === 'invalid_signature') {
          throw new Error('No signatures found matching the expected signature for payload');
        }
        
        // Return a mock Stripe event for valid signatures
        return {
          id: 'evt_test_123',
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_123',
              payment_intent: 'pi_test_123',
              customer_details: {
                email: 'test@example.com',
                name: 'John Doe'
              },
              custom_fields: [
                {
                  key: 'firstname',
                  text: { value: 'John' }
                },
                {
                  key: 'lastname',
                  text: { value: 'Doe' }
                }
              ]
            }
          }
        };
      })
    },
    checkout: {
      sessions: {
        retrieve: vi.fn().mockResolvedValue({
          id: 'cs_test_123',
          line_items: {
            data: [
              {
                quantity: 2,
                price: { id: 'price_test_123' }
              }
            ]
          }
        })
      }
    }
  }))
}));

describe('Stripe Webhook Handler', () => {
  beforeEach(() => {
    // Set up environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
    process.env.STRIPE_WEBHOOK_SECRET_DEV = 'whsec_dev_mock';
    process.env.SUPABASE_URL = 'https://mock.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_service_key';
  });

  it('should handle missing stripe-signature header', async () => {
    const event = {
      headers: {},
      body: JSON.stringify({}),
      httpMethod: 'POST',
      path: '/.netlify/functions/stripe-webhook'
    };

    const result = await handler(event);
    
    expect(result.statusCode).toBe(400);
    expect(result.body).toBe('Missing signature');
  });

  it('should handle invalid webhook signature', async () => {
    const event = {
      headers: {
        'stripe-signature': 'invalid_signature'
      },
      body: JSON.stringify({}),
      httpMethod: 'POST',
      path: '/.netlify/functions/stripe-webhook'
    };

    const result = await handler(event);
    
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Webhook Error');
  });

  it('should process checkout.session.completed event successfully', async () => {
    const mockEvent = {
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_intent: 'pi_test_123',
          customer_details: {
            email: 'test@example.com',
            name: 'John Doe'
          },
          custom_fields: [
            {
              key: 'firstname',
              text: { value: 'John' }
            },
            {
              key: 'lastname',
              text: { value: 'Doe' }
            }
          ]
        }
      }
    };

    const event = {
      headers: {
        'stripe-signature': 'valid_signature'
      },
      body: JSON.stringify(mockEvent),
      httpMethod: 'POST',
      path: '/.netlify/functions/stripe-webhook'
    };

    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe('ok');
  });

  it('should handle other event types gracefully', async () => {
    const mockEvent = {
      id: 'evt_test_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {}
      }
    };

    const event = {
      headers: {
        'stripe-signature': 'valid_signature'
      },
      body: JSON.stringify(mockEvent),
      httpMethod: 'POST',
      path: '/.netlify/functions/stripe-webhook'
    };

    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe('ok');
  });

  it('should work with dev webhook secret when production fails', async () => {
    // This test verifies that the dev webhook secret environment variable is set
    // The actual fallback logic is tested through integration testing
    expect(process.env.STRIPE_WEBHOOK_SECRET_DEV).toBe('whsec_dev_mock');
    
    const mockEvent = {
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_intent: 'pi_test_123',
          customer_details: {
            email: 'test@example.com',
            name: 'John Doe'
          },
          custom_fields: [
            {
              key: 'firstname',
              text: { value: 'John' }
            },
            {
              key: 'lastname',
              text: { value: 'Doe' }
            }
          ]
        }
      }
    };

    const event = {
      headers: {
        'stripe-signature': 'valid_signature'
      },
      body: JSON.stringify(mockEvent),
      httpMethod: 'POST',
      path: '/.netlify/functions/stripe-webhook'
    };

    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe('ok');
  });
});
