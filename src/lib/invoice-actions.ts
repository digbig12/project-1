"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getInvoices() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createInvoice(data: {
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  clientGST?: string;
  items: { name: string; qty: number; rate: number; amount: number }[];
  taxRate: number;
  dueDate?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * data.taxRate) / 100;
  const total = subtotal + taxAmount;

  // Generate invoice number: INV-YYYYMM-XXXX
  const count = await prisma.invoice.count({ where: { userId: session.user.id } });
  const now = new Date();
  const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(count + 1).padStart(4, "0")}`;

  try {
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientName: data.clientName,
        clientEmail: data.clientEmail || null,
        clientAddress: data.clientAddress || null,
        clientGST: data.clientGST || null,
        items: JSON.stringify(data.items),
        subtotal,
        taxRate: data.taxRate,
        taxAmount,
        total,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes || null,
        userId: session.user.id,
      },
    });
    return { success: true, invoice };
  } catch (error) {
    console.error("Create invoice error:", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  await prisma.invoice.update({
    where: { id: invoiceId, userId: session.user.id },
    data: { status },
  });
  return { success: true };
}

export async function deleteInvoice(invoiceId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  await prisma.invoice.delete({
    where: { id: invoiceId, userId: session.user.id },
  });
  return { success: true };
}
