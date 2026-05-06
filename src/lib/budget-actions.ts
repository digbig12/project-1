"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getBudgets(month?: number, year?: number) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id, month: m, year: y },
    include: { category: true },
  });

  // Get actual spending for each budget category
  const startDate = new Date(y, m - 1, 1);
  const endDate = new Date(y, m, 0, 23, 59, 59);

  const spending = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId: session.user.id,
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  const spendingMap = new Map(spending.map((s) => [s.categoryId, s._sum.amount || 0]));

  return budgets.map((b) => ({
    id: b.id,
    categoryId: b.categoryId,
    categoryName: b.category.name,
    categoryColor: b.category.color || "#3b82f6",
    categoryIcon: b.category.icon || "Tag",
    monthlyLimit: b.monthlyLimit,
    spent: spendingMap.get(b.categoryId) || 0,
    percentage: Math.min(((spendingMap.get(b.categoryId) || 0) / b.monthlyLimit) * 100, 100),
    isOverBudget: (spendingMap.get(b.categoryId) || 0) > b.monthlyLimit,
    month: b.month,
    year: b.year,
  }));
}

export async function setBudget(categoryId: string, monthlyLimit: number, month: number, year: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: session.user.id,
          categoryId,
          month,
          year,
        },
      },
      update: { monthlyLimit },
      create: {
        monthlyLimit,
        month,
        year,
        categoryId,
        userId: session.user.id,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Set budget error:", error);
    return { success: false, error: "Failed to set budget" };
  }
}

export async function deleteBudget(budgetId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  await prisma.budget.delete({
    where: { id: budgetId, userId: session.user.id },
  });
  return { success: true };
}

export async function getBudgetSummary() {
  const session = await auth();
  if (!session?.user?.id) return { totalBudget: 0, totalSpent: 0, overBudgetCount: 0 };

  const now = new Date();
  const budgets = await getBudgets(now.getMonth() + 1, now.getFullYear());

  return {
    totalBudget: budgets.reduce((s, b) => s + b.monthlyLimit, 0),
    totalSpent: budgets.reduce((s, b) => s + b.spent, 0),
    overBudgetCount: budgets.filter((b) => b.isOverBudget).length,
    budgetCount: budgets.length,
  };
}
