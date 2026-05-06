import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_1234567890", {
  // @ts-ignore - Ignore type error for apiVersion if it mismatch
  apiVersion: "2023-10-16",
  typescript: true,
});
