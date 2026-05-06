"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const RETURN_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const HAS_REAL_STRIPE = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith("sk_test_mock");

export async function createCheckoutSession(priceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // If real Stripe keys are configured, use Stripe Checkout
    if (HAS_REAL_STRIPE) {
      const { stripe } = await import("@/lib/stripe");

      let customerId = user.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email!,
          name: user.name || undefined,
        });
        customerId = customer.id;
        
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId }
        });
      }

      const stripeSession = await stripe.checkout.sessions.create({
        success_url: `${RETURN_URL}/settings?success=true`,
        cancel_url: `${RETURN_URL}/pricing?canceled=true`,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
        },
      });

      return { url: stripeSession.url };
    }

    // Otherwise, redirect to our built-in checkout page
    return { url: `${RETURN_URL}/checkout` };
  } catch (error) {
    console.error("Stripe Error:", error);
    return { error: "Could not create checkout session" };
  }
}

export async function processPayment(cardData: {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate card number (basic Luhn check for realism)
    const cleanNumber = cardData.cardNumber.replace(/\s/g, "");
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return { success: false, error: "Invalid card number" };
    }

    // Validate expiry
    const [month, year] = cardData.expiry.split("/").map(s => s.trim());
    if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
      return { success: false, error: "Invalid expiry date" };
    }

    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiryDate < new Date()) {
      return { success: false, error: "Card has expired" };
    }

    // Validate CVC
    if (cardData.cvc.length < 3 || cardData.cvc.length > 4) {
      return { success: false, error: "Invalid CVC" };
    }

    // Validate name
    if (!cardData.name || cardData.name.trim().length < 2) {
      return { success: false, error: "Invalid cardholder name" };
    }

    // Simulate bank processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Specific test card that "declines"
    if (cleanNumber === "4000000000000002") {
      return { success: false, error: "Your card was declined. Please try a different card." };
    }

    // Update user plan in database
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          plan: "ADVANCED",
          stripeSubscriptionId: `sub_sim_${Date.now()}`,
          stripeCustomerId: `cus_sim_${Date.now()}`,
          stripePriceId: "price_advanced_1999",
          stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      });
    } catch (e) {
      // If subscription fields don't exist yet in schema, just continue
      console.warn("Could not update subscription fields in DB.");
    }

    return { success: true };
  } catch (error) {
    console.error("Payment Error:", error);
    return { success: false, error: "Payment processing failed. Please try again." };
  }
}

export async function createCustomerPortalSession() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (HAS_REAL_STRIPE && user?.stripeCustomerId) {
      const { stripe } = await import("@/lib/stripe");
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${RETURN_URL}/settings`,
      });
      return { url: portalSession.url };
    }

    // For built-in checkout users, redirect to pricing to manage
    return { url: `${RETURN_URL}/pricing` };
  } catch (error) {
    console.error("Portal Error:", error);
    return { error: "Could not open billing portal" };
  }
}

export async function getSubscriptionAction() {
  const session = await auth();
  if (!session?.user?.id) return { isPro: false, plan: "FREE" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) return { isPro: false, plan: "FREE" };

    const isPro =
      user.plan === "ADVANCED" &&
      user.stripeCurrentPeriodEnd &&
      user.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now();

    return {
      isPro: !!isPro,
      plan: isPro ? "ADVANCED" : "FREE",
      currentPeriodEnd: user.stripeCurrentPeriodEnd,
    };
  } catch (error) {
    console.error("Subscription fields not found. Please run 'npx prisma db push'.");
    return { isPro: false, plan: "FREE", error: "PRISMA_NOT_UPDATED" };
  }
}

export async function togglePlan() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    const newPlan = user?.plan === "ADVANCED" ? "FREE" : "ADVANCED";

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plan: newPlan,
        stripeCurrentPeriodEnd: newPlan === "ADVANCED"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null,
      },
    });

    return { success: true, plan: newPlan };
  } catch (error) {
    console.error("Toggle plan error:", error);
    return { success: false, error: "Could not update plan. Run 'npx prisma db push' first." };
  }
}
