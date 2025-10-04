// Mock ticket data for development testing
export const mockTickets = [
  {
    id: 1,
    code: "TCKT-JANE2024",
    email: "jane.smith@example.com",
    first_name: "Jane",
    last_name: "Smith",
    quantity: 2,
    stripe_payment_intent: "pi_test_123456789",
    stripe_checkout_session: "cs_test_123456789",
    amount_total: 4000,
    currency: "usd",
    payment_status: "paid",
    address: null,
    redeemed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    code: "TCKT-JOHN2024",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    quantity: 1,
    stripe_payment_intent: "pi_test_234567890",
    stripe_checkout_session: "cs_test_234567890",
    amount_total: 2000,
    currency: "usd",
    payment_status: "paid",
    address: null,
    redeemed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    code: "TCKT-MARY2024",
    email: "mary.johnson@example.com",
    first_name: "Mary",
    last_name: "Johnson",
    quantity: 3,
    stripe_payment_intent: "pi_test_345678901",
    stripe_checkout_session: "cs_test_345678901",
    amount_total: 6000,
    currency: "usd",
    payment_status: "paid",
    address: null,
    redeemed_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    code: "TCKT-BOB2024",
    email: "bob.wilson@example.com",
    first_name: "Bob",
    last_name: "Wilson",
    quantity: 1,
    stripe_payment_intent: "pi_test_456789012",
    stripe_checkout_session: "cs_test_456789012",
    amount_total: 2000,
    currency: "usd",
    payment_status: "paid",
    address: null,
    redeemed_at: null,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    code: "TCKT-SARAH2024",
    email: "sarah.brown@example.com",
    first_name: "Sarah",
    last_name: "Brown",
    quantity: 2,
    stripe_payment_intent: "pi_test_567890123",
    stripe_checkout_session: "cs_test_567890123",
    amount_total: 4000,
    currency: "usd",
    payment_status: "paid",
    address: null,
    redeemed_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Export a mutable version for development testing
export let developmentTickets = [...mockTickets];

// Helper function to find ticket by code
export function findTicketByCode(code: string) {
  return developmentTickets.find(t => t.code === code);
}

// Helper function to update ticket redemption
export function redeemTicket(code: string) {
  const ticketIndex = developmentTickets.findIndex(t => t.code === code);
  if (ticketIndex === -1) return null;
  
  const now = new Date().toISOString();
  developmentTickets[ticketIndex] = {
    ...developmentTickets[ticketIndex],
    redeemed_at: now,
    updated_at: now
  };
  
  return developmentTickets[ticketIndex];
}
