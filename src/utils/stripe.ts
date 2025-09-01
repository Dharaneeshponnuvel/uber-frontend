import { loadStripe } from '@stripe/stripe-js';

// Use environment variable for Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef');

export default stripePromise;