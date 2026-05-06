import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const period = req.nextUrl.searchParams.get("period") || "current-fy";
  const now = new Date();

  // Calculate date range based on period
  let startDate: Date;
  let endDate = new Date(now);
  let periodLabel = "";

  switch (period) {
    case "current-month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      periodLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      break;
    case "current-quarter":
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), qMonth, 1);
      periodLabel = `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
      break;
    case "last-fy":
      const lastFyYear = now.getMonth() < 3 ? now.getFullYear() - 2 : now.getFullYear() - 1;
      startDate = new Date(lastFyYear, 3, 1); // April 1
      endDate = new Date(lastFyYear + 1, 2, 31); // March 31
      periodLabel = `FY ${lastFyYear}-${lastFyYear + 1}`;
      break;
    case "current-fy":
    default:
      const fyYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
      startDate = new Date(fyYear, 3, 1); // April 1
      periodLabel = `FY ${fyYear}-${fyYear + 1}`;
      break;
  }

  // Fetch transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startDate, lte: endDate },
    },
    include: { category: true },
  });

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyName: true },
  });

  // Calculate revenue by category
  const revenueMap = new Map<string, number>();
  const expenseMap = new Map<string, number>();
  let totalRevenue = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    const catName = t.category?.name || "Uncategorized";
    if (t.type === "SALE") {
      totalRevenue += t.amount;
      revenueMap.set(catName, (revenueMap.get(catName) || 0) + t.amount);
    } else {
      totalExpenses += t.amount;
      expenseMap.set(catName, (expenseMap.get(catName) || 0) + t.amount);
    }
  }

  const revenueBreakdown = Array.from(revenueMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const expenseBreakdown = Array.from(expenseMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return NextResponse.json({
    totalRevenue,
    totalExpenses,
    revenueBreakdown,
    expenseBreakdown,
    transactionCount: transactions.length,
    periodLabel,
    companyName: user?.companyName || "BizAnalytics",
  });
}
