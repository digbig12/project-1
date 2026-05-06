import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const period = req.nextUrl.searchParams.get("period") || "current-quarter";
  const now = new Date();
  const DEFAULT_GST_RATE = 0.18;

  let startDate: Date;
  let endDate = new Date(now);

  switch (period) {
    case "current-month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "current-fy":
      const fyYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
      startDate = new Date(fyYear, 3, 1);
      break;
    case "current-quarter":
    default:
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), qMonth, 1);
      break;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startDate, lte: endDate },
    },
    include: { category: true },
    orderBy: { date: "asc" },
  });

  let totalSales = 0;
  let totalExpenses = 0;

  // Group by month
  const monthlyMap = new Map<string, { sales: number; expenses: number }>();

  for (const t of transactions) {
    const monthKey = t.date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { sales: 0, expenses: 0 });
    }

    const entry = monthlyMap.get(monthKey)!;

    if (t.type === "SALE") {
      totalSales += t.amount;
      entry.sales += t.amount;
    } else {
      totalExpenses += t.amount;
      entry.expenses += t.amount;
    }
  }

  // Calculate GST (estimated at default rate)
  const outputGST = Math.round(totalSales * DEFAULT_GST_RATE);
  const inputGST = Math.round(totalExpenses * DEFAULT_GST_RATE);

  const monthlyBreakdown = Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    sales: data.sales,
    expenses: data.expenses,
    outputGST: Math.round(data.sales * DEFAULT_GST_RATE),
    inputGST: Math.round(data.expenses * DEFAULT_GST_RATE),
    net: Math.round(data.sales * DEFAULT_GST_RATE) - Math.round(data.expenses * DEFAULT_GST_RATE),
  }));

  return NextResponse.json({
    totalSales,
    totalExpenses,
    outputGST,
    inputGST,
    netGST: outputGST - inputGST,
    monthlyBreakdown,
    gstRate: DEFAULT_GST_RATE * 100,
  });
}
