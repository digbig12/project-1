import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 90);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startDate, lte: now },
    },
    select: { date: true, amount: true, type: true },
  });

  // Build daily map
  const dailyMap = new Map<string, { revenue: number; expenses: number }>();

  // Initialize all 90 days
  for (let i = 0; i < 90; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, { revenue: 0, expenses: 0 });
  }

  // Fill with actual data
  for (const t of transactions) {
    const key = t.date.toISOString().split("T")[0];
    const entry = dailyMap.get(key);
    if (entry) {
      if (t.type === "SALE") entry.revenue += t.amount;
      else entry.expenses += t.amount;
    }
  }

  const days = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));

  return NextResponse.json({ days });
}
