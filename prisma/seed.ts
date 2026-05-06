import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.monthlyInsight.deleteMany();
  await prisma.user.deleteMany();

  // 1.5 Create Demo User
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123', // Not hashed here for simplicity in seed
    }
  });

  // 2. Create Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Infrastructure', icon: 'HardDrive', color: '#3b82f6', userId: demoUser.id } }),
    prisma.category.create({ data: { name: 'Marketing', icon: 'Megaphone', color: '#8b5cf6', userId: demoUser.id } }),
    prisma.category.create({ data: { name: 'Human Resources', icon: 'Users', color: '#10b981', userId: demoUser.id } }),
    prisma.category.create({ data: { name: 'R&D', icon: 'FlaskConical', color: '#f59e0b', userId: demoUser.id } }),
    prisma.category.create({ data: { name: 'Operations', icon: 'Settings', color: '#ef4444', userId: demoUser.id } }),
    prisma.category.create({ data: { name: 'Sales Revenue', icon: 'TrendingUp', color: '#10b981', userId: demoUser.id } }),
  ]);

  const salesCategory = categories.find(c => c.name === 'Sales Revenue')!;
  const expenseCategories = categories.filter(c => c.name !== 'Sales Revenue');

  // 3. Generate 6 months of data
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = month.toLocaleString('default', { month: 'short' });
    
    // Generate Sales for the month (10-20 transactions)
    const salesCount = 10 + Math.floor(Math.random() * 10);
    let totalMonthlySales = 0;
    for (let j = 0; j < salesCount; j++) {
      const amount = 2000 + Math.floor(Math.random() * 5000);
      totalMonthlySales += amount;
      await prisma.transaction.create({
        data: {
          amount,
          type: 'SALE',
          description: `Sale ${monthName}-${j+1}`,
          date: new Date(month.getFullYear(), month.getMonth(), 1 + Math.floor(Math.random() * 28)),
          categoryId: salesCategory.id,
          userId: demoUser.id
        }
      });
    }

    // Generate Expenses for the month (15-25 transactions)
    const expenseCount = 15 + Math.floor(Math.random() * 10);
    let totalMonthlyExpenses = 0;
    for (let j = 0; j < expenseCount; j++) {
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const amount = 500 + Math.floor(Math.random() * 2000);
      totalMonthlyExpenses += amount;
      await prisma.transaction.create({
        data: {
          amount,
          type: 'EXPENSE',
          description: `Expense ${monthName}-${j+1} - ${category.name}`,
          date: new Date(month.getFullYear(), month.getMonth(), 1 + Math.floor(Math.random() * 28)),
          categoryId: category.id,
          userId: demoUser.id
        }
      });
    }

    // 4. Create a Monthly Insight
    const profit = totalMonthlySales - totalMonthlyExpenses;
    await prisma.monthlyInsight.create({
      data: {
        month: month.getMonth() + 1,
        year: month.getFullYear(),
        content: `Summary for ${monthName}: Your business generated $${totalMonthlySales.toLocaleString()} in revenue with expenses totaling $${totalMonthlyExpenses.toLocaleString()}. Net profit is $${profit.toLocaleString()}. The largest expense category was ${expenseCategories[0].name}.`,
        userId: demoUser.id
      }
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
