"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getRecurringTransactions() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.recurringTransaction.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { nextDueDate: "asc" },
  });
}

export async function createRecurringTransaction(data: {
  amount: number;
  type: string;
  description: string;
  categoryId: string;
  frequency: string;
  nextDueDate: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.recurringTransaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        description: data.description,
        categoryId: data.categoryId,
        frequency: data.frequency,
        nextDueDate: new Date(data.nextDueDate),
        userId: session.user.id,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Create recurring error:", error);
    return { success: false, error: "Failed to create recurring transaction" };
  }
}

export async function toggleRecurring(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  const existing = await prisma.recurringTransaction.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) return { success: false };

  await prisma.recurringTransaction.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });
  return { success: true, isActive: !existing.isActive };
}

export async function deleteRecurring(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  await prisma.recurringTransaction.delete({
    where: { id, userId: session.user.id },
  });
  return { success: true };
}

export async function processRecurringTransactions() {
  const session = await auth();
  if (!session?.user?.id) return { processed: 0 };

  const now = new Date();
  const due = await prisma.recurringTransaction.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
      nextDueDate: { lte: now },
    },
  });

  let processed = 0;

  for (const rec of due) {
    // Create the actual transaction
    await prisma.transaction.create({
      data: {
        amount: rec.amount,
        type: rec.type,
        description: `[Auto] ${rec.description}`,
        categoryId: rec.categoryId,
        userId: session.user.id,
        date: now,
      },
    });

    // Calculate next due date
    let nextDate = new Date(rec.nextDueDate);
    switch (rec.frequency) {
      case "DAILY": nextDate.setDate(nextDate.getDate() + 1); break;
      case "WEEKLY": nextDate.setDate(nextDate.getDate() + 7); break;
      case "MONTHLY": nextDate.setMonth(nextDate.getMonth() + 1); break;
      case "YEARLY": nextDate.setFullYear(nextDate.getFullYear() + 1); break;
    }

    await prisma.recurringTransaction.update({
      where: { id: rec.id },
      data: { nextDueDate: nextDate, lastProcessed: now },
    });

    processed++;
  }

  return { processed };
}
