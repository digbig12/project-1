'use server';

import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { prisma } from './prisma';
import { aggregateByMonth, computeBusinessMetrics, forecastNextMonths, confidenceIntervals, formatMetricsForPrompt, categoryTrends } from './analytics-engine';

import { auth } from '@/auth';

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

/**
 * PROFILE MANAGEMENT
 */
export async function getProfile() {
  const user = await getSessionUser();
  
  try {
    // Attempt to fetch with new AI fields
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        companyName: true,
        phone: true,
        role: true,
        industry: true,
        businessType: true,
        companySize: true,
        gstNumber: true,
        panNumber: true,
        financialYearStart: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        pinCode: true,
        country: true,
        createdAt: true,
        isTwoFactorEnabled: true,
        aiContext: true,
        aiTone: true,
        targetRevenue: true,
        maxExpenseRatio: true,
        businessGoals: true,
      }
    });
    return profile;
  } catch (error) {
    console.warn('[Prisma] Falling back to standard profile fetch. Run prisma db push to enable AI fields.');
    // Fallback query without the new fields
    return await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        companyName: true,
        phone: true,
        role: true,
        industry: true,
        businessType: true,
        companySize: true,
        gstNumber: true,
        panNumber: true,
        financialYearStart: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        pinCode: true,
        country: true,
        createdAt: true,
        isTwoFactorEnabled: true,
      }
    });
  }
}

export async function updateProfile(data: {
  name?: string;
  companyName?: string;
  phone?: string;
  role?: string;
  industry?: string;
  businessType?: string;
  companySize?: string;
  gstNumber?: string;
  panNumber?: string;
  financialYearStart?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
  aiContext?: string;
  aiTone?: string;
  targetRevenue?: number;
  maxExpenseRatio?: number;
  businessGoals?: string;
}) {
  try {
    const user = await getSessionUser();
    
    // Convert numeric fields if they come as strings
    const processedData = {
      ...data,
      targetRevenue: data.targetRevenue ? Number(data.targetRevenue) : undefined,
      maxExpenseRatio: data.maxExpenseRatio ? Number(data.maxExpenseRatio) : undefined,
    };

    await prisma.user.update({
      where: { id: user.id },
      data: processedData,
    });
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const user = await getSessionUser();
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.password) {
      return { success: false, error: 'No password set for this account' };
    }
    
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Failed to change password' };
  }
}

/**
 * CORE DASHBOARD STATS
 */
export async function getDashboardStats() {
  const user = await getSessionUser();

  // Fetch full user record to get name/companyName
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, companyName: true }
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id }
  });
  
  const totalRevenue = transactions
    .filter(t => t.type === 'SALE')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const salesCount = transactions.filter(t => t.type === 'SALE').length;
  const netProfit = totalRevenue - totalExpenses;
  
  const conversion = 3.2;

  // Priority: companyName > user first name > email prefix
  const displayName = fullUser?.companyName
    ? fullUser.companyName
    : fullUser?.name
    ? fullUser.name.split(' ')[0]
    : fullUser?.email?.split('@')[0] ?? 'there';

  return {
    revenue: totalRevenue,
    salesCount,
    netProfit,
    conversion,
    displayName,
  };
}

/**
 * MONTHLY PERFORMANCE DATA
 */
export async function getMonthlyPerformance() {
  const user = await getSessionUser();
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: 'asc' }
  });

  const monthlyData: Record<string, { month: string; sales: number; profit: number; expenses: number }> = {};

  transactions.forEach(t => {
    const month = t.date.toLocaleString('default', { month: 'short' });
    if (!monthlyData[month]) {
      monthlyData[month] = { month, sales: 0, profit: 0, expenses: 0 };
    }
    
    if (t.type === 'SALE') {
      monthlyData[month].sales += t.amount;
    } else {
      monthlyData[month].expenses += t.amount;
    }
  });

  return Object.values(monthlyData).map(d => ({
    ...d,
    profit: d.sales - d.expenses
  }));
}

/**
 * EXPENSE BREAKDOWN BY CATEGORY (Enhanced)
 * Returns: percentage, actual amount, icon, and month-over-month trend
 */
export async function getExpenseBreakdown() {
  const user = await getSessionUser();
  const expenses = await prisma.transaction.findMany({
    where: { type: 'EXPENSE', userId: user.id },
    include: { 
      category: true 
    }
  });

  // Separate current month vs previous month
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const breakdown: Record<string, { name: string; value: number; amount: number; color: string; icon: string; currentMonth: number; prevMonth: number }> = {};
  let totalExpensesForBreakdown = 0;

  expenses.forEach(e => {
    const categoryToGroup = e.category.parent || e.category;
    const groupName = categoryToGroup.name;
    
    totalExpensesForBreakdown += e.amount;
    
    if (!breakdown[groupName]) {
      breakdown[groupName] = { 
        name: groupName, 
        value: 0, 
        amount: 0,
        color: categoryToGroup.color || '#3b82f6',
        icon: categoryToGroup.icon || 'Tag',
        currentMonth: 0,
        prevMonth: 0
      };
    }
    breakdown[groupName].amount += e.amount;

    // Track monthly amounts for trend
    const txDate = new Date(e.date);
    if (txDate >= currentMonthStart) {
      breakdown[groupName].currentMonth += e.amount;
    } else if (txDate >= prevMonthStart && txDate < currentMonthStart) {
      breakdown[groupName].prevMonth += e.amount;
    }
  });

  if (totalExpensesForBreakdown === 0) return [];

  // Return enriched data sorted by amount descending
  return Object.values(breakdown)
    .map(b => {
      const pct = Math.round((b.amount / totalExpensesForBreakdown) * 100);
      // Calculate MoM trend
      let trend: 'up' | 'down' | 'flat' = 'flat';
      let trendPct = 0;
      if (b.prevMonth > 0) {
        trendPct = Math.round(((b.currentMonth - b.prevMonth) / b.prevMonth) * 100);
        trend = trendPct > 5 ? 'up' : trendPct < -5 ? 'down' : 'flat';
      }
      return {
        name: b.name,
        value: pct,
        amount: Math.round(b.amount),
        color: b.color,
        icon: b.icon,
        trend,
        trendPct,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

/**
 * TRANSACTIONS
 */
export async function getTransactions() {
  const user = await getSessionUser();
  return await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: 'desc' }
  });
}

/**
 * AI BUSINESS SUMMARY (STRUCTURED)
 */
export async function getAISummaryInsights() {
  try {
    const user = await getSessionUser();
    
    // 1. Gather all necessary data
    const [stats, performance, breakdown] = await Promise.all([
      getDashboardStats(),
      getMonthlyPerformance(),
      getExpenseBreakdown()
    ]);

    // 2. Compute statistical metrics from raw transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { date: 'asc' }
    });

    let dbUser = null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { aiContext: true, aiTone: true, targetRevenue: true, maxExpenseRatio: true, businessGoals: true }
      });
    } catch (e) {
      console.warn('[Prisma] AI fields not yet available. Run prisma db push.');
    }

    const aggregates = aggregateByMonth(transactions);
    const metrics = computeBusinessMetrics(transactions, aggregates, breakdown);
    const forecast = forecastNextMonths(aggregates, 3);

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const hasValidKey = apiKey && !apiKey.includes('XXXX') && apiKey.length > 20;

    if (!hasValidKey) {
      // Return data-driven fallback using statistical engine
      const marginTrend = metrics.revenueGrowthMoM > metrics.expenseGrowthMoM ? 'up' : metrics.revenueGrowthMoM < metrics.expenseGrowthMoM ? 'down' : 'neutral';
      
      const anomalies: { type: 'Warning' | 'Critical' | 'Info'; message: string }[] = [];
      if (stats.revenue === 0) anomalies.push({ type: 'Critical', message: 'No revenue data detected yet.' });
      if (metrics.topExpensePct > 50) anomalies.push({ type: 'Warning', message: `${metrics.topExpenseCategory} accounts for ${metrics.topExpensePct}% of expenses — high concentration risk.` });
      
      // Use user-defined expense ratio threshold
      const maxExpRatio = dbUser?.maxExpenseRatio || 70;
      if (metrics.expenseToRevenueRatio > maxExpRatio) {
        anomalies.push({ 
          type: 'Critical', 
          message: `Expense-to-revenue ratio is ${metrics.expenseToRevenueRatio}% — exceeds your ${maxExpRatio}% healthy threshold.` 
        });
      }
      
      if (metrics.fastestGrowingCostRate > 20) anomalies.push({ type: 'Warning', message: `${metrics.fastestGrowingCost} costs growing ${metrics.fastestGrowingCostRate}% MoM — exceeds healthy threshold.` });
      if (anomalies.length === 0) anomalies.push({ type: 'Info', message: 'No significant anomalies detected in current cycle.' });

      const strategy: { priority: 'High' | 'Medium' | 'Low'; advice: string }[] = [];
      
      // Use user-defined target revenue
      const targetRev = dbUser?.targetRevenue || 100000;
      if (stats.revenue < targetRev) {
        strategy.push({ 
          priority: 'High', 
          advice: `Revenue (₹${stats.revenue.toLocaleString()}) is below your ₹${targetRev.toLocaleString()} target. Focus on client acquisition to bridge the ₹${(targetRev - stats.revenue).toLocaleString()} gap.` 
        });
      }

      if (metrics.profitMargin < 15) strategy.push({ priority: 'Medium', advice: `Profit margin is ${metrics.profitMargin}%. Target 20%+ by reducing ${metrics.topExpenseCategory} costs.` });
      strategy.push({ priority: 'Low', advice: `Next quarter forecast: ₹${forecast.reduce((s, f) => s + f.profit, 0).toLocaleString()} projected profit.` });

      return {
        success: true,
        isLocal: true,
        data: {
          overview: {
            title: "Business Intelligence Report",
            status: stats.netProfit > 0 ? "Profitable" : "Attention Required",
            summary: `Revenue is ${metrics.revenueDirection} at ${metrics.revenueGrowthMoM > 0 ? '+' : ''}${metrics.revenueGrowthMoM}% MoM. Profit margin stands at ${metrics.profitMargin}%. Expenses are ${metrics.expenseDirection} at ${metrics.expenseGrowthMoM > 0 ? '+' : ''}${metrics.expenseGrowthMoM}% MoM.`,
            kpis: [
              { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, trend: metrics.revenueDirection === 'growing' ? 'up' : metrics.revenueDirection === 'declining' ? 'down' : 'neutral' },
              { label: "Profit Margin", value: `${metrics.profitMargin}%`, trend: marginTrend as any },
              { label: "MoM Growth", value: `${metrics.revenueGrowthMoM > 0 ? '+' : ''}${metrics.revenueGrowthMoM}%`, trend: metrics.revenueGrowthMoM > 0 ? 'up' : 'down' }
            ]
          },
          growth: {
            analysis: `Revenue has ${metrics.revenueDirection === 'growing' ? 'grown' : metrics.revenueDirection === 'declining' ? 'declined' : 'remained stable'} over the past ${metrics.monthsOfData} months. Average monthly revenue is ₹${metrics.avgMonthlyRevenue.toLocaleString()}.`,
            milestones: [
              `Processed ${metrics.totalTransactions} transactions`,
              `Quarterly growth rate: ${metrics.revenueGrowthQoQ > 0 ? '+' : ''}${metrics.revenueGrowthQoQ}%`,
              `Average monthly profit: ₹${metrics.avgMonthlyProfit.toLocaleString()}`
            ]
          },
          anomalies,
          strategy
        }
      };
    }

    // 2b. Call AI with COMPUTED metrics + TRAINED context
    const metricsPrompt = formatMetricsForPrompt(metrics, forecast);

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        overview: z.object({
          title: z.string(),
          status: z.string(),
          summary: z.string(),
          kpis: z.array(z.object({
            label: z.string(),
            value: z.string(),
            trend: z.enum(['up', 'down', 'neutral'])
          }))
        }),
        growth: z.object({
          analysis: z.string(),
          milestones: z.array(z.string())
        }),
        anomalies: z.array(z.object({
          type: z.enum(['Warning', 'Critical', 'Info']),
          message: z.string()
        })),
        strategy: z.array(z.object({
          priority: z.enum(['High', 'Medium', 'Low']),
          advice: z.string()
        }))
      }),
      prompt: `Act as a Senior ${dbUser?.aiTone || 'CFO'} for this business. You have been TRAINED with the following business context:

BUSINESS CONTEXT:
${dbUser?.aiContext || 'Standard Indian business operation.'}

FINANCIAL GOALS:
- Target Monthly Revenue: ₹${(dbUser?.targetRevenue || 100000).toLocaleString()}
- Max Healthy Expense Ratio: ${dbUser?.maxExpenseRatio || 70}%
- Specific Goals: ${dbUser?.businessGoals || 'Continuous growth and profitability.'}

STATISTICALLY VERIFIED METRICS:
${metricsPrompt}

Additional Real-time Data:
- Total Revenue: ₹${stats.revenue.toLocaleString()}
- Net Profit: ₹${stats.netProfit.toLocaleString()}
- Top Expense Categories: ${JSON.stringify(breakdown.slice(0, 5).map(b => ({ name: b.name, pct: b.value + '%', amount: '₹' + (b.amount || 0).toLocaleString() })))}

Generate a professional intelligence summary. Evaluate the current performance STRICTLY against the FINANCIAL GOALS provided. Adopt a ${dbUser?.aiTone || 'CFO'} personality in your writing.`
    });

    return { success: true, isLocal: false, data: object };
  } catch (error) {
    console.error('AI Summary Insights error:', error);
    return { success: false, error: 'Failed to generate financial analysis' };
  }
}

/**
 * EXPORT DATA TO CSV
 */
export async function exportTransactionsToCSV() {
  const user = await getSessionUser();
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: 'desc' }
  });

  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const rows = transactions.map(t => [
    t.date.toISOString().split('T')[0],
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.category.name,
    t.type,
    t.amount
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * CATEGORY MANAGEMENT
 */
export async function getCategories() {
  const user = await getSessionUser();
  return await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' }
  });
}

export async function createCategory(name: string, color: string, icon: string = 'Circle', parentId?: string) {
  try {
    const user = await getSessionUser();
    const category = await prisma.category.create({
      data: { 
        name, 
        color, 
        icon, 
        userId: user.id as string
      }
    });
    revalidatePath('/settings');
    revalidatePath('/');
    return { success: true, category };
  } catch (error) {
    console.error('Create category error:', error);
    return { success: false, error: 'Failed to create category' };
  }
}

export async function deleteCategory(id: string) {
  try {
    if (!id) return { success: false, error: 'Category ID is required' };
    
    const user = await getSessionUser();
    
    // Find the category to check if it's the default "General" category
    const categoryToDelete = await prisma.category.findUnique({
      where: { id, userId: user.id }
    });

    if (!categoryToDelete) {
      return { success: false, error: 'Category not found' };
    }

    if (categoryToDelete.name === 'General') {
      return { success: false, error: 'Cannot delete the default General category' };
    }

    // Find or create the "General" category for reassignment
    let generalCategory = await prisma.category.findFirst({
      where: { name: 'General', userId: user.id }
    });

    if (!generalCategory) {
      generalCategory = await prisma.category.create({
        data: { name: 'General', color: '#64748b', icon: 'Circle', userId: user.id }
      });
    }

    // Use a transaction to reassign data and then delete
    await prisma.$transaction([
      // 1. Reassign transactions to General
      prisma.transaction.updateMany({
        where: { categoryId: id, userId: user.id },
        data: { categoryId: generalCategory.id }
      }),
      // 2. Finally delete the category
      prisma.category.delete({
        where: { id, userId: user.id }
      })
    ]);

    revalidatePath('/settings');
    revalidatePath('/cfo-report');
    revalidatePath('/');
    revalidatePath('/transactions');
    return { success: true };
  } catch (error) {
    console.error('Delete category error:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}

/**
 * AI RECEIPT SCANNING (OCR)
 * Uses Gemini 1.5 Flash Vision to extract data from an image buffer
 */
export async function processReceipt(base64Image: string, mimeType: string) {
  try {
    const user = await getSessionUser();
    const categories = await prisma.category.findMany({
      where: { userId: user.id as string },
      select: { name: true }
    });
    
    const categoryList = categories.map(c => c.name).join(', ');
    
    console.log('[OCR] Processing receipt for user:', user.email);
    
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      output: 'object',
      schema: z.object({
        merchant: z.string().describe('Store or company name'),
        amount: z.number().describe('Total amount of the receipt'),
        date: z.string().describe('Date of purchase in YYYY-MM-DD format'),
        category: z.string().describe(`Best matching category from: ${categoryList || 'Food, Travel, Rent, Utilities, Salaries, Marketing, Legal, Software, Supplies, Taxes'}`),
        description: z.string().describe('Brief 2-3 word description of the purchase'),
        isTaxDeductible: z.boolean().describe('True if this expense is likely tax deductible for a business.'),
        taxReason: z.string().describe('Short reason why this is or isn\'t tax deductible (Max 5 words).')
      }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `Extract receipt details accurately. PICK THE MOST RELEVANT CATEGORY FROM THIS LIST: [${categoryList || 'Food, Travel, Rent, Utilities, Salaries, Marketing, Legal, Software, Supplies, Taxes'}]. If uncertain, pick the closest match.` },
            { 
              type: 'image', 
              image: base64Image,
              mediaType: mimeType
            }
          ]
        }
      ]
    });

    console.log('[OCR] Successfully extracted data:', object.merchant);
    return { success: true, data: object };
  } catch (error: any) {
    console.error('[OCR] Error:', error);
    return { 
      success: false, 
      error: error.message?.includes('429') ? 'API Quota Exceeded' : 'Failed to process receipt' 
    };
  }
}

// Combined and enhanced saveOCRTransaction
export async function saveOCRTransaction(data: {
  merchant: string;
  amount: number;
  date: string;
  category: string;
  categoryId?: string;
  description?: string;
  isTaxDeductible?: boolean;
  taxReason?: string;
}) {
  try {
    const user = await getSessionUser();
    
    // 1. Prioritize categoryId from the UI selection
    let categoryId = data.categoryId;

    // 2. Fallback to finding category by name if ID is missing
    if (!categoryId) {
      let category = await prisma.category.findFirst({
        where: { 
          name: { contains: data.category },
          userId: user.id as string
        }
      });

      // 3. Fallback to "General"
      if (!category) {
        category = await prisma.category.findFirst({
          where: { name: 'General', userId: user.id as string }
        });
      }
      
      categoryId = category?.id;
    }

    if (!categoryId) {
      throw new Error('No valid category found for this transaction.');
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        description: data.description ? `${data.merchant} - ${data.description}` : data.merchant,
        type: 'EXPENSE',
        date: new Date(data.date),
        categoryId: categoryId,
        userId: user.id as string,
        isTaxDeductible: data.isTaxDeductible || false,
        taxReason: data.taxReason || null
      }
    });

    revalidatePath('/transactions');
    revalidatePath('/cfo-report');
    revalidatePath('/');
    return { success: true, transaction };
  } catch (error) {
    console.error('Save OCR error:', error);
    return { success: false, error: 'Failed to save scanned transaction' };
  }
}

export async function createTransaction(data: {
  amount: number;
  type: 'SALE' | 'EXPENSE';
  description: string;
  categoryId: string;
  date: Date;
}) {
  try {
    const user = await getSessionUser();
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId: user.id
      }
    });

    revalidatePath('/transactions');
    revalidatePath('/cfo-report');
    revalidatePath('/');
    return { success: true, transaction };
  } catch (error) {
    console.error('Create transaction error:', error);
    return { success: false, error: 'Failed to create transaction' };
  }
}

/**
 * AI FINANCIAL FORECASTING
 * Project the next 3 months based on existing data
 */
export async function getBusinessForecast() {
  try {
    const user = await getSessionUser();
    console.log('[Forecast] Generating projections for user:', user.email);
    
    // 1. Get raw transactions for statistical computation
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { date: 'asc' }
    });

    const aggregates = aggregateByMonth(transactions);
    
    // 2. Compute statistical forecast baseline
    const statForecast = forecastNextMonths(aggregates, 3);
    const intervals = confidenceIntervals(aggregates, 3);
    const metrics = computeBusinessMetrics(transactions, aggregates, []);

    console.log('[Forecast] Statistical baseline:', JSON.stringify(statForecast));

    // 3. Try AI refinement if API key available
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const hasValidKey = apiKey && !apiKey.includes('XXXX') && apiKey.length > 20;

    if (!hasValidKey) {
      // Return pure statistical forecast
      console.log('[Forecast] No API key — returning statistical forecast');
      return { success: true, forecast: statForecast, source: 'statistical' };
    }

    // 4. AI refinement: give Gemini the statistical baseline to refine
    const metricsPrompt = formatMetricsForPrompt(metrics, statForecast);

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      output: 'array',
      schema: z.object({
        month: z.string().describe('Month name (e.g., Apr, May)'),
        revenue: z.number().describe('Predicted revenue in INR'),
        expenses: z.number().describe('Predicted expenses in INR'),
        profit: z.number().describe('Predicted net profit in INR')
      }),
      system: 'You are a Senior FP&A Consultant. You are given a STATISTICAL BASELINE forecast computed from real transaction data. Your job is to REFINE it with qualitative insights (seasonality, market trends), NOT replace it with arbitrary numbers. Your output should be within ±15% of the baseline.',
      prompt: `Here is the statistically computed forecast baseline and business metrics:

${metricsPrompt}

Confidence Intervals:
${intervals.map(i => `${i.month}: Low ₹${i.low.toLocaleString()} | Mid ₹${i.mid.toLocaleString()} | High ₹${i.high.toLocaleString()}`).join('\n')}

Refine these 3-month projections. You may adjust within ±15% of the baseline if you have strong reasoning (e.g., seasonal effects, typical Indian business cycles for Q${Math.ceil((new Date().getMonth() + 2) / 3)}). Return exactly 3 forecast objects.`,
    });

    console.log('[Forecast] AI-refined projection generated');
    return { success: true, forecast: object, source: 'ai-refined' };
  } catch (error: any) {
    console.error('[Forecast] Error:', error);
    
    // Fallback: try returning statistical forecast even on AI error
    try {
      const user = await getSessionUser();
      const txns = await prisma.transaction.findMany({
        where: { userId: user.id },
        include: { category: true },
        orderBy: { date: 'asc' }
      });
      const agg = aggregateByMonth(txns);
      const fallback = forecastNextMonths(agg, 3);
      return { success: true, forecast: fallback, source: 'statistical-fallback' };
    } catch {
      return { 
        success: false, 
        error: error.message?.includes('429') ? 'API Quota Exceeded' : 'Failed to generate forecast' 
      };
    }
  }
}

/**
 * BUSINESS UTILITY: TAX ESTIMATION
 */
/**
 * BUSINESS UTILITY: ADVANCED TAX INTELLIGENCE
 */
export async function getTaxEstimation() {
  try {
    const user = await getSessionUser();
    
    // 1. Gather historical data & context
    const [stats, transactions] = await Promise.all([
      getDashboardStats(),
      prisma.transaction.findMany({
        where: { userId: user.id },
        include: { category: true },
        orderBy: { date: 'asc' }
      })
    ]);

    let dbUser = null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { industry: true, aiContext: true, targetRevenue: true }
      });
    } catch (e) {
       console.warn('[Prisma] AI fields not yet available for tax estimation.');
    }

    const netProfit = stats.netProfit;
    const totalSales = stats.revenue;
    const totalExpenses = stats.revenue - netProfit;

    // 2. GST Estimation (Standard Indian B2B IT/SaaS Context)
    // Output GST (18%) on sales - Input GST (18%) on eligible expenses
    const outputGst = totalSales * 0.18;
    const inputGstEligible = transactions
      .filter(t => t.type === 'EXPENSE' && t.category.name.toLowerCase().match(/software|cloud|rent|legal|marketing|supplies/))
      .reduce((sum, t) => sum + t.amount, 0);
    const inputGst = inputGstEligible * 0.18;
    const netGstLiability = Math.max(0, outputGst - inputGst);

    // 3. Income Tax Slabs (Simplified New Regime 2024-25)
    let estimatedIncomeTax = 0;
    const taxableIncome = netProfit;
    
    if (taxableIncome > 1500000) {
      estimatedIncomeTax = 150000 + (taxableIncome - 1500000) * 0.30;
    } else if (taxableIncome > 1200000) {
      estimatedIncomeTax = 90000 + (taxableIncome - 1200000) * 0.20;
    } else if (taxableIncome > 900000) {
      estimatedIncomeTax = 45000 + (taxableIncome - 900000) * 0.15;
    } else if (taxableIncome > 600000) {
      estimatedIncomeTax = 15000 + (taxableIncome - 600000) * 0.10;
    } else if (taxableIncome > 300000) {
      estimatedIncomeTax = (taxableIncome - 300000) * 0.05;
    }

    // 4. Identify Potential Deductions using Statistical Engine logic
    const deductibleTransactions = transactions.filter(t => t.isTaxDeductible);
    const totalDeductions = deductibleTransactions.reduce((s, t) => s + t.amount, 0);

    // 5. AI Tax Strategy (Refined based on context)
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const hasValidKey = apiKey && !apiKey.includes('XXXX') && apiKey.length > 20;
    
    let aiStrategy = "Maintain detailed records of all business-related travel and software subscriptions to maximize Section 37(1) deductions.";

    if (hasValidKey) {
      try {
        const { text } = await generateText({
          model: google('gemini-1.5-flash'),
          prompt: `Act as a Senior Tax Consultant for an Indian business in the ${dbUser?.industry || 'Service'} industry.
          
          BUSINESS CONTEXT:
          ${dbUser?.aiContext || 'General business operation'}
          
          FINANCIAL SNAPSHOT:
          - Annualized Profit: ₹${netProfit.toLocaleString()}
          - Total Deductions Claimed: ₹${totalDeductions.toLocaleString()}
          - Top Expense Categories: ${transactions.slice(-5).map(t => t.category.name).join(', ')}
          
          Provide 3 concise, actionable tax-saving strategies specifically for this business. Mention relevant sections of the Indian Income Tax Act (e.g., Section 37, 80C, 80D, or GST ITC). Keep it under 60 words.`
        });
        aiStrategy = text;
      } catch (e) {
        console.error('AI Tax Strategy error:', e);
      }
    }

    return {
      netProfit,
      totalSales,
      gst: {
        output: outputGst,
        input: inputGst,
        liability: netGstLiability
      },
      incomeTax: {
        estimated: estimatedIncomeTax,
        taxableIncome: taxableIncome,
        deductions: totalDeductions
      },
      estimatedTax: estimatedIncomeTax + netGstLiability,
      quarterlyInstallment: (estimatedIncomeTax + netGstLiability) / 4,
      suggestedReserve: (estimatedIncomeTax + netGstLiability) * 1.15,
      taxRate: taxableIncome > 0 ? ((estimatedIncomeTax / taxableIncome) * 100).toFixed(1) : 0,
      aiStrategy
    };
  } catch (error) {
    console.error('Tax estimation error:', error);
    return { 
      netProfit: 0, 
      estimatedTax: 0, 
      gst: { liability: 0 }, 
      incomeTax: { estimated: 0 }, 
      aiStrategy: "Data unavailable." 
    };
  }
}

/**
 * BUSINESS UTILITY: SUBSCRIPTION DETECTION
 */
export async function getSubscriptions() {
  const user = await getSessionUser();
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: 'desc' },
    take: 100
  });

  // Group by description to find recurring items
  const frequencyMap: Record<string, any> = {};
  
  transactions.forEach(t => {
    const desc = t.description || 'Unknown';
    if (!frequencyMap[desc]) {
      frequencyMap[desc] = { count: 0, amounts: [], lastDate: t.date, category: t.category };
    }
    frequencyMap[desc].count += 1;
    frequencyMap[desc].amounts.push(t.amount);
    if (t.date > frequencyMap[desc].lastDate) {
      frequencyMap[desc].lastDate = t.date;
    }
  });

  const subscriptions = Object.entries(frequencyMap)
    .filter(([_, data]) => data.count >= 2) // Appears at least twice in 100 transactions
    .map(([desc, data]) => ({
      name: desc,
      amount: data.amounts[0], // Assuming consistent billing
      category: data.category.name,
      lastBilled: data.lastDate,
      status: 'Active'
    }));

  return subscriptions;
}

/**
 * BATCH DATA IMPORT: AI HEADER MAPPING
 */
export async function mapCSVHeaders(headers: string[], sampleData: any[]) {
  try {
    const user = await getSessionUser(); // Check auth
    console.log('[Import] Mapping headers for user:', user.email);
    
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      output: 'object',
      schema: z.object({
        mapping: z.object({
          date: z.string().describe('CSV header name for Transaction Date'),
          description: z.string().describe('CSV header name for Description/Merchant'),
          amount: z.string().describe('CSV header name for Amount/Total'),
          type: z.string().optional().describe('CSV header name for Type (Income/Expense)')
        })
      }),
      prompt: `Match these CSV headers: ${JSON.stringify(headers)} to my database fields. 
      Database fields: ['date', 'description', 'amount', 'type'].
      Use this sample data for context: ${JSON.stringify(sampleData)}.
      Return only the JSON mapping.`
    });

    return { success: true, mapping: object.mapping };
  } catch (error: any) {
    console.error('[Import] Mapping Error:', error);
    return { 
      success: false, 
      error: error.message?.includes('429') ? 'API Quota Exceeded' : 'Failed to map headers' 
    };
  }
}

/**
 * BATCH DATA IMPORT: EXECUTION
 */
export async function importTransactionsBatch(rows: any[]) {
  try {
    const user = await getSessionUser();
    const categories = await getCategories();
    const defaultCategory = categories[0] || { id: 1 }; // Fallback

    const data = await Promise.all(rows.map(async (row) => {
      // Find matching category by name OR create it for this user if it doesn't exist
      let category = categories.find(c => 
        row.category?.toLowerCase() === c.name.toLowerCase()
      );

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: row.category || 'General',
            userId: user.id as string,
            color: '#3b82f6',
            icon: 'Circle'
          }
        });
      }

      const amountValue = parseFloat(row.amount.toString().replace(/[^0-9.-]+/g,""));

      return {
        date: new Date(row.date),
        description: row.description || 'Imported Transaction',
        amount: Math.abs(amountValue),
        type: row.type?.toUpperCase().includes('SALE') || (amountValue >= 0) ? 'SALE' : 'EXPENSE',
        categoryId: category.id,
        userId: user.id as string
      };
    }));

    const result = await prisma.transaction.createMany({ data });
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/cfo-report');
    return { success: true, count: result.count };
  } catch (error) {
    console.error('Import Error:', error);
    return { success: false, error: 'Failed to import transactions' };
  }
}

/**
 * SECURITY: TWO-FACTOR AUTHENTICATION
 */
export async function generateTwoFactorToken(email: string) {
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  // Delete existing tokens
  await prisma.twoFactorToken.deleteMany({
    where: { userId: user.id }
  });

  const twoFactorToken = await prisma.twoFactorToken.create({
    data: {
      token,
      expires,
      userId: user.id,
    }
  });

  return twoFactorToken;
}

export async function getTwoFactorTokenByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const twoFactorToken = await prisma.twoFactorToken.findFirst({
      where: { userId: user.id },
      orderBy: { expires: 'desc' }
    });

    return twoFactorToken;
  } catch {
    return null;
  }
}

/**
 * UTILITY: POPULATE SAMPLE DATA
 */
import { generateSampleData } from './sampleData';
import { revalidatePath } from 'next/cache';

export async function injectSampleDataAction() {
  try {
    const user = await getSessionUser();
    const result = await generateSampleData(user.id as string);
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/cfo-report');
    return result;
  } catch (error) {
    console.error('Data Injection Error:', error);
    return { success: false, error: 'Failed to inject sample data' };
  }
}


/**
 * AI CFO: ANOMALY DETECTION ("WATCHDOG")
 * Scans recent transactions for duplicates, spikes, and missed trends.
 */
export async function getAIInsights() {
  let transactions: any[] = [];
  try {
    const user = await getSessionUser();
    
    // Fetch last 40 transactions to find patterns
    transactions = await prisma.transaction.findMany({
      where: { userId: user.id as string },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 40
    });

    if (transactions.length < 5) {
      return { 
        success: true, 
        insights: [
          {
            type: 'info',
            title: 'Learning Your Habits',
            description: 'Add more transactions so I can start detecting anomalies and financial trends for you.'
          }
        ] 
      };
    }

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        insights: z.array(z.object({
          type: z.enum(['warning', 'info', 'success']),
          title: z.string(),
          description: z.string(),
          deepLink: z.string().describe('A question the user might ask to learn more about this insight')
        }))
      }),
      prompt: `Analyze these recent transactions for a business and identify significant financial anomalies, duplicates, or trends. 
      Transactions: ${JSON.stringify(transactions.map(t => ({
        desc: t.description,
        amt: t.amount,
        date: t.date,
        cat: t.category.name,
        type: t.type
      })))}
      
      Focus on:
      1. Duplicate charges (same merchant/amount within 3 days).
      2. Unusual spikes in a category compared to others.
      3. Positive trends (e.g. Sales growing).
      4. Missing typical monthly charges (e.g. Rent not paid yet).
      
      Return max 4 high-impact insights.`
    });

    return { success: true, insights: object.insights };
  } catch (error: any) {
    console.warn('[AI Watchdog] API failed, triggering Local Fallback Engine:', error.message);
    
    // PERMANENT FIX: Local Fallback Engine
    // If API is missing or quota exceeded, fallback to deterministic data analysis
    const insights: any[] = [];
    
    // 1. DUPLICATE DETECTION — flag transactions with same description + amount within 3 days
    const txnList = transactions || [];
    for (let i = 0; i < txnList.length; i++) {
      for (let j = i + 1; j < txnList.length; j++) {
        const a = txnList[i];
        const b = txnList[j];
        if (
          a.description && b.description &&
          a.description.toLowerCase() === b.description.toLowerCase() &&
          Math.abs(a.amount - b.amount) < 1 &&
          Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) < 3 * 24 * 60 * 60 * 1000
        ) {
          insights.push({
            type: 'warning',
            title: `Potential Duplicate: ${a.description}`,
            description: `₹${a.amount.toLocaleString()} was charged twice within 3 days. Verify this is not a duplicate invoice.`,
            deepLink: `Is the charge for "${a.description}" a duplicate?`
          });
          break; // Only flag once per pair
        }
      }
      if (insights.filter(i => i.title.includes('Duplicate')).length >= 2) break;
    }

    // 2. CATEGORY SPIKE DETECTION — flag categories where spending is >200% of average
    const categoryByMonth: Record<string, Record<string, number>> = {};
    for (const t of txnList) {
      if (t.type === 'EXPENSE') {
        const catName = t.category?.name || 'General';
        const monthKey = new Date(t.date).toISOString().slice(0, 7);
        if (!categoryByMonth[catName]) categoryByMonth[catName] = {};
        categoryByMonth[catName][monthKey] = (categoryByMonth[catName][monthKey] || 0) + t.amount;
      }
    }

    for (const [catName, months] of Object.entries(categoryByMonth)) {
      const values = Object.values(months);
      if (values.length >= 2) {
        const avg = values.slice(0, -1).reduce((a, b) => a + b, 0) / (values.length - 1);
        const latest = values[values.length - 1];
        if (avg > 0 && latest > avg * 2) {
          insights.push({
            type: 'warning',
            title: `${catName} Spending Spike`,
            description: `${catName} expenses this month (₹${latest.toLocaleString()}) are ${((latest / avg) * 100).toFixed(0)}% above average (₹${avg.toLocaleString()}).`,
            deepLink: `Why is my ${catName} spend so high this month?`
          });
        }
      }
    }

    // 3. Highest Expense Category
    const categoryTotals: Record<string, number> = {};
    let topCategory = { name: '', amount: 0 };
    
    for (const t of txnList) {
      if (t.type === 'EXPENSE') {
        const catName = t.category?.name || 'General';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
        if (categoryTotals[catName] > topCategory.amount) {
          topCategory = { name: catName, amount: categoryTotals[catName] };
        }
      }
    }
    
    if (topCategory.amount > 0 && !insights.some(i => i.title.includes(topCategory.name))) {
      insights.push({
        type: 'warning',
        title: `High ${topCategory.name} Spend`,
        description: `You have spent ₹${topCategory.amount.toLocaleString()} on ${topCategory.name} recently. Monitor this carefully.`,
        deepLink: `Why is my ${topCategory.name} spend so high?`
      });
    }

    // 4. Sales Volume / Revenue Health
    const sales = txnList.filter((t: any) => t.type === 'SALE');
    const expenses = txnList.filter((t: any) => t.type === 'EXPENSE');
    const totalSales = sales.reduce((s: number, t: any) => s + t.amount, 0);
    const totalExp = expenses.reduce((s: number, t: any) => s + t.amount, 0);

    if (totalSales > 0 && totalExp > 0) {
      const ratio = totalExp / totalSales;
      if (ratio > 0.85) {
        insights.push({
          type: 'warning',
          title: 'High Burn Rate',
          description: `Your expense-to-revenue ratio is ${(ratio * 100).toFixed(0)}%. A ratio above 85% signals thin margins. Review cost structure.`,
          deepLink: 'How can I reduce my burn rate?'
        });
      } else if (ratio < 0.6) {
        insights.push({
          type: 'success',
          title: 'Strong Profit Margins',
          description: `Expense-to-revenue ratio is ${(ratio * 100).toFixed(0)}%. Your margins are healthy and sustainable.`,
          deepLink: 'How can I maintain my profit margins?'
        });
      }
    }

    if (sales.length >= 3) {
      insights.push({
        type: 'success',
        title: 'Consistent Revenue Stream',
        description: `You have recorded ${sales.length} recent sales. Your cash flow is maintaining a healthy velocity.`,
        deepLink: 'How can I accelerate my sales velocity?'
      });
    } else if (txnList.length > 0) {
      insights.push({
        type: 'info',
        title: 'Sales Volume Alert',
        description: 'Recent sales volume is relatively low. Consider reviewing your top-funnel marketing metrics.',
        deepLink: 'What marketing strategies could improve my sales?'
      });
    }

    return { 
      success: true,
      insights: insights.slice(0, 4) 
    };
  }
}

// ─── Chat History Actions ───

export async function getConversations() {
  try {
    const user = await getSessionUser();
    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id as string },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { messages: true } }
      }
    });
    return conversations;
  } catch {
    return [];
  }
}

export async function getChatMessages(conversationId: string) {
  try {
    const user = await getSessionUser();
    // Verify ownership
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: user.id as string }
    });
    if (!conversation) return [];
    
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });
    return messages;
  } catch {
    return [];
  }
}

export async function createConversation(title?: string) {
  try {
    const user = await getSessionUser();
    const conversation = await prisma.conversation.create({
      data: {
        title: title || 'New Chat',
        userId: user.id as string
      }
    });
    return { success: true, conversation };
  } catch (error) {
    console.error('Create conversation error:', error);
    return { success: false, error: 'Failed to create conversation' };
  }
}

export async function saveChatMessage(conversationId: string, role: string, content: string) {
  try {
    const user = await getSessionUser();
    // Verify ownership
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: user.id as string }
    });
    if (!conversation) return { success: false, error: 'Conversation not found' };

    const message = await prisma.chatMessage.create({
      data: {
        role,
        content,
        conversationId
      }
    });

    // Auto-update conversation title from first user message
    if (role === 'user' && conversation.title === 'New Chat') {
      const title = content.length > 40 ? content.substring(0, 40) + '...' : content;
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { title }
      });
    }

    // Touch updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return { success: true, message };
  } catch (error) {
    console.error('Save message error:', error);
    return { success: false, error: 'Failed to save message' };
  }
}

export async function deleteConversation(conversationId: string) {
  try {
    const user = await getSessionUser();
    // Verify ownership
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: user.id as string }
    });
    if (!conversation) return { success: false, error: 'Not found' };

    await prisma.conversation.delete({
      where: { id: conversationId }
    });

    revalidatePath('/chat');
    return { success: true };
  } catch (error) {
    console.error('Delete conversation error:', error);
    return { success: false, error: 'Failed to delete conversation' };
  }
}
