import { prisma } from './prisma';

export async function generateSampleData(userId: string) {
  // 1. Create industry-standard categories with icons
  const categories = [
    { name: 'Marketing', color: '#ec4899', icon: 'Megaphone' },
    { name: 'SaaS & Software', color: '#3b82f6', icon: 'Cpu' },
    { name: 'Salaries', color: '#10b981', icon: 'Users' },
    { name: 'Office & Rent', color: '#f59e0b', icon: 'Home' },
    { name: 'Travel', color: '#8b5cf6', icon: 'Plane' },
    { name: 'Legal & Compliance', color: '#64748b', icon: 'Briefcase' },
    { name: 'Utilities', color: '#06b6d4', icon: 'Zap' },
    { name: 'Client Projects', color: '#22c55e', icon: 'Target' },
    { name: 'R&D', color: '#a855f7', icon: 'Lightbulb' },
    { name: 'Logistics', color: '#f97316', icon: 'Truck' },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId }
    });
    if (!existing) {
      const newCat = await prisma.category.create({
        data: { ...cat, userId }
      });
      createdCategories.push(newCat);
    } else {
      createdCategories.push(existing);
    }
  }

  // 2. Map categories for quick access
  const catMap = Object.fromEntries(createdCategories.map(c => [c.name, c.id]));

  // 3. Generate Transactions for 12 months
  const months = 12;
  const transactions: any[] = [];
  const now = new Date();

  // Vendor names for realism
  const saasVendors = ['AWS Cloud Services', 'Vercel Pro', 'Figma Enterprise', 'Slack Business+', 'GitHub Team', 'Notion Workspace'];
  const marketingVendors = ['Google Ads', 'Meta Ads Manager', 'LinkedIn Campaign', 'SEMrush Pro'];
  const clientNames = ['Reliance Digital', 'Tata Consultancy', 'Infosys Ltd', 'Wipro Tech', 'HCL Technologies', 'Mahindra Group', 'Bharti Airtel', 'Adani Enterprises'];

  for (let m = 0; m < months; m++) {
    const baseGrowth = 1 + (months - m) * 0.02; // Simulate gradual growth

    // ── EXPENSES ──

    // SaaS & Software (2-3 per month)
    const saasCount = 2 + Math.floor(Math.random() * 2);
    for (let s = 0; s < saasCount; s++) {
      transactions.push({
        date: new Date(now.getFullYear(), now.getMonth() - m, 3 + s * 8),
        description: saasVendors[s % saasVendors.length],
        amount: Math.round((800 + Math.random() * 1200) * 100) / 100,
        type: 'EXPENSE',
        categoryId: catMap['SaaS & Software'],
        userId
      });
    }

    // Salaries (bi-weekly payroll)
    const salaryBase = 85000 + Math.random() * 15000;
    transactions.push({
      date: new Date(now.getFullYear(), now.getMonth() - m, 1),
      description: 'Employee Payroll - 1st Half',
      amount: Math.round(salaryBase),
      type: 'EXPENSE',
      categoryId: catMap['Salaries'],
      userId
    });
    transactions.push({
      date: new Date(now.getFullYear(), now.getMonth() - m, 15),
      description: 'Employee Payroll - 2nd Half',
      amount: Math.round(salaryBase),
      type: 'EXPENSE',
      categoryId: catMap['Salaries'],
      userId
    });

    // Marketing (ad spend)
    transactions.push({
      date: new Date(now.getFullYear(), now.getMonth() - m, 10),
      description: marketingVendors[m % marketingVendors.length],
      amount: Math.round(15000 + Math.random() * 25000),
      type: 'EXPENSE',
      categoryId: catMap['Marketing'],
      userId
    });

    // Office & Rent (monthly fixed)
    transactions.push({
      date: new Date(now.getFullYear(), now.getMonth() - m, 1),
      description: 'Office Lease - Sector 62, Noida',
      amount: 45000,
      type: 'EXPENSE',
      categoryId: catMap['Office & Rent'],
      userId
    });

    // Utilities (electricity, internet)
    transactions.push({
      date: new Date(now.getFullYear(), now.getMonth() - m, 20),
      description: 'Electricity + Internet Bundle',
      amount: Math.round(4500 + Math.random() * 2000),
      type: 'EXPENSE',
      categoryId: catMap['Utilities'],
      userId
    });

    // R&D (some months)
    if (Math.random() > 0.3) {
      transactions.push({
        date: new Date(now.getFullYear(), now.getMonth() - m, 18),
        description: 'R&D Tools & Prototyping',
        amount: Math.round(8000 + Math.random() * 12000),
        type: 'EXPENSE',
        categoryId: catMap['R&D'],
        userId
      });
    }

    // Travel (some months)
    if (Math.random() > 0.4) {
      transactions.push({
        date: new Date(now.getFullYear(), now.getMonth() - m, 22),
        description: 'Client Visit - ' + ['Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Delhi'][m % 5],
        amount: Math.round(8000 + Math.random() * 15000),
        type: 'EXPENSE',
        categoryId: catMap['Travel'],
        userId
      });
    }

    // Legal (quarterly)
    if (m % 3 === 0) {
      transactions.push({
        date: new Date(now.getFullYear(), now.getMonth() - m, 25),
        description: 'Legal Retainer & GST Filing',
        amount: Math.round(12000 + Math.random() * 8000),
        type: 'EXPENSE',
        categoryId: catMap['Legal & Compliance'],
        userId
      });
    }

    // Logistics (some months)
    if (Math.random() > 0.5) {
      transactions.push({
        date: new Date(now.getFullYear(), now.getMonth() - m, 12),
        description: 'Courier & Logistics - BlueDart',
        amount: Math.round(3000 + Math.random() * 5000),
        type: 'EXPENSE',
        categoryId: catMap['Logistics'],
        userId
      });
    }

    // ── REVENUE (Sales) ──
    // Client project invoices (4-7 per month, growing over time)
    const salesCount = 4 + Math.floor(Math.random() * 4);
    for (let s = 0; s < salesCount; s++) {
      const client = clientNames[(m * 3 + s) % clientNames.length];
      transactions.push({
        date: new Date(now.getFullYear(), now.getMonth() - m, 3 + s * 4),
        description: `Invoice #INV-${2026}${String(12 - m).padStart(2, '0')}-${String(s + 1).padStart(3, '0')} | ${client}`,
        amount: Math.round((45000 + Math.random() * 80000) * baseGrowth),
        type: 'SALE',
        categoryId: catMap['Client Projects'],
        userId
      });
    }
  }

  // 4. Batch Create
  await prisma.transaction.createMany({
    data: transactions
  });

  return { 
    success: true, 
    transactionCount: transactions.length, 
    categoryCount: createdCategories.length 
  };
}

