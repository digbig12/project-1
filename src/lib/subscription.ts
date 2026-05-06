import { prisma } from "@/lib/prisma";

export async function getUserSubscriptionPlan(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return {
        isPro: false,
        plan: "FREE",
      };
    }

    // Check if they are on ADVANCED plan AND the subscription hasn't expired
    const isPro =
      user.plan === "ADVANCED" &&
      user.stripeCurrentPeriodEnd &&
      user.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now();

    return {
      ...user,
      isPro: !!isPro,
      plan: isPro ? "ADVANCED" : "FREE",
    };
  } catch (error) {
    console.error("Subscription fields not found in Prisma client.");
    return {
      isPro: false,
      plan: "FREE",
      error: "PRISMA_NOT_UPDATED"
    };
  }
}
