import { google } from '@ai-sdk/google';
import { 
  streamText, 
  convertToModelMessages, 
  createUIMessageStream, 
  createUIMessageStreamResponse,
  stepCountIs 
} from 'ai';
import { z } from 'zod';
import { getDashboardStats, getMonthlyPerformance, getTransactions, getExpenseBreakdown, getBusinessForecast } from '@/lib/actions';
import { aggregateByMonth, computeBusinessMetrics, forecastNextMonths, confidenceIntervals, formatMetricsForPrompt } from '@/lib/analytics-engine';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const maxDuration = 60;

// ─── Local Fallback AI Engine ───
// When no API key is configured, this provides intelligent rule-based responses
// with rich markdown tables and structured data formatting
async function generateLocalResponse(userMessage: string) {
  const msg = userMessage.toLowerCase();
  
  let stats: any = { revenue: 0, salesCount: 0, netProfit: 0, conversion: 0 };
  let expenses: any[] = [];
  let monthly: any[] = [];
  
  try { stats = await getDashboardStats(); } catch {}
  try { expenses = await getExpenseBreakdown(); } catch {}
  try { monthly = await getMonthlyPerformance(); } catch {}

  const totalExpenses = stats.revenue - stats.netProfit;
  const margin = stats.revenue > 0 ? ((stats.netProfit / stats.revenue) * 100).toFixed(1) : '0';

  // Revenue related
  if (msg.includes('revenue') || msg.includes('income') || msg.includes('earning')) {
    if (stats.revenue === 0) {
      return `📊 **Revenue Analysis**\n\nYour account currently shows ₹0 in revenue. This likely means you haven't imported any transaction data yet.\n\n### Quick Start\n1. Go to **Settings → Data Management** and click "Generate Data" to populate sample data\n2. Or navigate to **Transactions** and scan a receipt or import a CSV\n\nOnce data is loaded, I can provide detailed revenue breakdowns, growth trends, and forecasting.`;
    }
    return `📊 **Revenue Overview**\n\n| Metric | Value | Status |\n|---|---|---|\n| Total Revenue | ₹${stats.revenue.toLocaleString()} | 📈 |\n| Total Sales | ${stats.salesCount} transactions | ✅ |\n| Total Expenses | ₹${totalExpenses.toLocaleString()} | 💸 |\n| Net Profit | ₹${stats.netProfit.toLocaleString()} | ${stats.netProfit > 0 ? '🟢' : '🔴'} |\n| Profit Margin | ${margin}% | ${parseFloat(margin) > 15 ? '🟢' : '🟡'} |\n| Conversion Rate | ${stats.conversion}% | 📊 |\n\n${stats.netProfit > 0 ? '✅ Your business is currently **profitable**. Revenue is healthy with a positive bottom line.' : '⚠️ Your expenses exceed revenue — an immediate review of your cost structure is recommended.'}\n\n💡 **Pro Tip:** Ask me "Show monthly performance" to visualize trends over time, or "What's my forecast?" for a 3-month projection.`;
  }

  // Expense related
  if (msg.includes('expense') || msg.includes('cost') || msg.includes('spend') || msg.includes('breakdown')) {
    if (expenses.length === 0) {
      return `💰 **Expense Analysis**\n\nNo expense data found. Import your transactions first to get a detailed breakdown by category.\n\n### How to Get Started\n1. Navigate to **Transactions** and click **Bulk Import**\n2. Or use the **OCR Scanner** to scan receipts directly\n3. Or go to **Settings → Generate Sample Data** for a demo\n\n> Once imported, I'll show you category-wise spending distribution and optimization opportunities.`;
    }
    const tableRows = expenses.map(e => {
      const bar = '█'.repeat(Math.round(e.value / 5)) + '░'.repeat(20 - Math.round(e.value / 5));
      return `| ${e.name} | ${e.value}% | ${bar} |`;
    }).join('\n');
    return `💰 **Expense Breakdown by Category**\n\n| Category | Share | Distribution |\n|---|---|---|\n${tableRows}\n\n### Key Insights\n${expenses[0] ? `- **Highest spend:** ${expenses[0].name} at ${expenses[0].value}% — this is your primary cost driver` : ''}\n${expenses.length >= 2 ? `- **Second highest:** ${expenses[1].name} at ${expenses[1].value}%` : ''}\n- **Total expense categories:** ${expenses.length}\n\n💡 **Pro Tip:** If your top category exceeds 40%, it may signal over-concentration risk. Diversifying suppliers or renegotiating contracts could help reduce this.`;
  }

  // Monthly / performance / trend
  if (msg.includes('month') || msg.includes('trend') || msg.includes('performance') || msg.includes('growth')) {
    if (monthly.length === 0) {
      return `📈 **Performance Trends**\n\nNo monthly data available yet. Once you have at least 2 months of data, I can show you:\n\n- Revenue growth trajectory\n- Profit margin trends\n- Seasonal spending patterns\n\n> Add transactions to unlock this feature.`;
    }
    const recentMonths = monthly.slice(-6);
    const tableRows = recentMonths.map(m => {
      const profit = (m.profit || 0);
      const indicator = profit > 0 ? '🟢' : profit < 0 ? '🔴' : '⚪';
      return `| ${m.month} | ₹${(m.sales || 0).toLocaleString()} | ₹${(m.expenses || 0).toLocaleString()} | ₹${profit.toLocaleString()} | ${indicator} |`;
    }).join('\n');
    
    const lastTwo = recentMonths.slice(-2);
    const trend = lastTwo.length >= 2 
      ? (lastTwo[1].sales > lastTwo[0].sales ? 'upward 📈' : 'downward 📉')
      : 'insufficient data';

    return `📈 **Monthly Performance Report**\n\n| Month | Revenue | Expenses | Profit | Status |\n|---|---|---|---|---|\n${tableRows}\n\n### Trend Analysis\n- **Direction:** Revenue is trending **${trend}**\n${lastTwo.length >= 2 ? `- **Revenue change:** ₹${Math.abs(lastTwo[1].sales - lastTwo[0].sales).toLocaleString()} ${lastTwo[1].sales > lastTwo[0].sales ? 'increase' : 'decrease'}` : ''}\n- **Best month:** ${recentMonths.reduce((a: any, b: any) => (a.sales || 0) > (b.sales || 0) ? a : b).month}\n\n💡 **Pro Tip:** Consistent month-over-month growth above 5% indicates strong business momentum. Aim to maintain this trajectory while controlling expense growth.`;
  }

  // Profit
  if (msg.includes('profit') || msg.includes('margin') || msg.includes('bottom line')) {
    const healthIndicator = parseFloat(margin) > 20 ? '🟢 Excellent' : parseFloat(margin) > 10 ? '🟡 Good' : parseFloat(margin) > 0 ? '🟠 Needs Attention' : '🔴 Critical';
    return `💵 **Profit & Margin Analysis**\n\n| Metric | Value |\n|---|---|\n| Gross Revenue | ₹${stats.revenue.toLocaleString()} |\n| Total Expenses | ₹${totalExpenses.toLocaleString()} |\n| **Net Profit** | **₹${stats.netProfit.toLocaleString()}** |\n| **Profit Margin** | **${margin}%** |\n| Health Rating | ${healthIndicator} |\n\n### Margin Benchmarks\n| Rating | Range | Your Position |\n|---|---|---|\n| 🟢 Excellent | > 20% | ${parseFloat(margin) > 20 ? '← You are here' : ''} |\n| 🟡 Good | 10-20% | ${parseFloat(margin) > 10 && parseFloat(margin) <= 20 ? '← You are here' : ''} |\n| 🟠 Low | 5-10% | ${parseFloat(margin) > 5 && parseFloat(margin) <= 10 ? '← You are here' : ''} |\n| 🔴 Critical | < 5% | ${parseFloat(margin) <= 5 ? '← You are here' : ''} |\n\n${parseFloat(margin) > 20 ? '✅ Outstanding! You\'re performing well above the 15-20% benchmark for healthy SMBs in India.' : parseFloat(margin) > 10 ? '🟡 Solid performance. Focus on scaling revenue while keeping costs flat to push toward the 20% sweet spot.' : '⚠️ Low margin detected. I strongly recommend an expense audit — ask me "Where can I cut costs?"'}\n\n💡 **Pro Tip:** To improve margin by 5%, either increase revenue by ~${Math.round(stats.revenue * 0.05).toLocaleString()} or reduce expenses by the same amount.`;
  }

  // Forecast
  if (msg.includes('forecast') || msg.includes('predict') || msg.includes('future') || msg.includes('next quarter')) {
    if (stats.revenue === 0) {
      return `🔮 **Forecast Unavailable**\n\nI need historical data to generate accurate predictions. Please import your transactions first.\n\n### Quick Start\n1. Navigate to **Settings → Data Management → Generate Data**\n2. Or import a CSV file with your transaction history`;
    }
    
    // Use statistical engine for accurate forecasting
    let statForecast;
    try {
      const session = await auth();
      if (session?.user?.id) {
        const txns = await prisma.transaction.findMany({
          where: { userId: session.user.id },
          include: { category: true },
          orderBy: { date: 'asc' }
        });
        const aggregates = aggregateByMonth(txns);
        statForecast = forecastNextMonths(aggregates, 3);
        const intervals = confidenceIntervals(aggregates, 3);
        const localMetrics = computeBusinessMetrics(txns, aggregates, []);

        const tableRows = statForecast.map((f, i) => {
          const interval = intervals[i];
          return `| ${f.month} | ₹${f.revenue.toLocaleString()} | ₹${f.expenses.toLocaleString()} | ₹${f.profit.toLocaleString()} | ${f.confidence} | ₹${interval.low.toLocaleString()} – ₹${interval.high.toLocaleString()} |`;
        }).join('\n');

        return `🔮 **3-Month Statistical Forecast**\n\n| Month | Revenue | Expenses | Profit | Confidence | Range |\n|---|---|---|---|---|---|\n${tableRows}\n\n### Methodology\n- **Algorithm:** Weighted Moving Average × Growth Trend × Seasonal Adjustment\n- **Revenue Growth Rate:** ${localMetrics.revenueGrowthMoM > 0 ? '+' : ''}${localMetrics.revenueGrowthMoM}% MoM (computed from ${localMetrics.monthsOfData} months)\n- **Expense Growth Rate:** ${localMetrics.expenseGrowthMoM > 0 ? '+' : ''}${localMetrics.expenseGrowthMoM}% MoM\n- **Data Points:** ${localMetrics.totalTransactions} transactions\n\n### Key Assumptions\n- Growth trend continues at current velocity\n- No major capital expenditures or market shifts\n- Seasonal patterns from historical data applied\n\n> ⚠️ *This is a statistical projection. Configure your Gemini API key for AI-refined analysis.*\n\n💡 **Pro Tip:** Reserve ₹${Math.round(statForecast.reduce((s, f) => s + f.revenue, 0) * 0.15).toLocaleString()} (15% of projected revenue) as a cash buffer.`;
      }
    } catch (e) {
      console.error('[Chat Forecast] Statistical engine error:', e);
    }
    
    // Minimal fallback if engine fails
    return `🔮 **Forecast**\n\nUnable to compute forecast — please ensure you have transaction data loaded. Go to **Settings → Generate Data** first.`;
  }

  // Tax
  if (msg.includes('tax') || msg.includes('gst') || msg.includes('deduct')) {
    const estimatedTax = Math.round(stats.netProfit * 0.25);
    const quarterly = Math.round(estimatedTax / 4);
    return `🏛️ **Tax Estimation — India (FY 2025-26)**\n\n| Component | Amount |\n|---|---|\n| Net Profit (Tax Base) | ₹${stats.netProfit.toLocaleString()} |\n| Estimated Tax Rate | 25% (Presumptive) |\n| **Estimated Annual Tax** | **₹${estimatedTax.toLocaleString()}** |\n| Quarterly Advance Tax | ₹${quarterly.toLocaleString()} |\n| Suggested Reserve (+10% buffer) | ₹${Math.round(estimatedTax * 1.1).toLocaleString()} |\n\n### Advance Tax Schedule\n| Quarter | Due Date | Amount |\n|---|---|---|\n| Q1 | June 15 | ₹${quarterly.toLocaleString()} |\n| Q2 | September 15 | ₹${quarterly.toLocaleString()} |\n| Q3 | December 15 | ₹${quarterly.toLocaleString()} |\n| Q4 | March 15 | ₹${quarterly.toLocaleString()} |\n\n💡 **Pro Tip:** Mark your tax-deductible expenses (rent, software, travel) in the Transactions page. I can then calculate your effective tax rate more accurately.`;
  }

  // Hire / can I afford
  if (msg.includes('hire') || msg.includes('afford') || msg.includes('salary') || msg.includes('employee')) {
    const monthlyProfit = stats.netProfit / 12;
    const monthlyRevenue = stats.revenue / 12;

    const tiers = [
      { role: 'Intern', cost: 15000 },
      { role: 'Junior Developer', cost: 35000 },
      { role: 'Mid-Level Hire', cost: 50000 },
      { role: 'Senior Engineer', cost: 80000 },
      { role: 'Manager', cost: 100000 },
    ];

    const tableRows = tiers.map(t => {
      const pct = monthlyProfit > 0 ? ((t.cost / monthlyProfit) * 100).toFixed(0) : '∞';
      const feasible = monthlyProfit > t.cost * 1.5;
      return `| ${t.role} | ₹${t.cost.toLocaleString()} | ${pct}% | ${feasible ? '✅ Feasible' : '⚠️ Risk'} |`;
    }).join('\n');

    return `👥 **Hiring Capacity Analysis**\n\n| Metric | Value |\n|---|---|\n| Monthly Revenue | ₹${Math.round(monthlyRevenue).toLocaleString()} |\n| Monthly Profit | ₹${Math.round(monthlyProfit).toLocaleString()} |\n\n### Salary Affordability Matrix\n| Role | Monthly Cost | % of Profit | Feasibility |\n|---|---|---|---|\n${tableRows}\n\n> **Rule of thumb:** A hire is comfortable when their salary is **under 30%** of monthly profit, leaving room for taxes and contingencies.\n\n${monthlyProfit > 50000 ? `✅ With ₹${Math.round(monthlyProfit).toLocaleString()}/mo profit, you can support mid-level hires. Consider starting with a cost-effective role and scaling as revenue grows.` : `⚠️ Current monthly profit of ₹${Math.round(monthlyProfit).toLocaleString()} is tight for full-time hires. Focus on growing revenue by 30-50% before expanding the team.`}\n\n💡 **Pro Tip:** Consider contract/freelance arrangements first — they provide flexibility without long-term salary commitments.`;
  }

  // Help / general
  if (msg.includes('help') || msg.includes('what can') || msg.includes('features')) {
    return `🤖 **BI Assistant — Full Capabilities**\n\n| Feature | Command | What You Get |\n|---|---|---|\n| 📊 Revenue | "Show revenue overview" | Total income, margins, trends |\n| 💰 Expenses | "Expense breakdown" | Category-wise cost analysis |\n| 📈 Performance | "Monthly performance" | Month-over-month comparison |\n| 💵 Profits | "Profit margin analysis" | Health rating & benchmarks |\n| 🔮 Forecast | "3-month forecast" | Projected revenue & profit |\n| 🏛️ Tax | "Tax estimate" | India tax liability & schedule |\n| 👥 Hiring | "Can I afford to hire?" | Salary affordability matrix |\n\n### Quick Tips\n- Press **/** to quickly focus the input\n- Ask follow-up questions — I remember context\n- All data comes from your **live transaction database**\n\n> Start with any question above or type your own!`;
  }

  // Cost cutting / reduce
  if (msg.includes('cut') || msg.includes('reduce') || msg.includes('save') || msg.includes('optim')) {
    if (expenses.length === 0) {
      return `💡 **Cost Optimization**\n\nNo expense data found. Import your transactions first so I can analyze where you can save.`;
    }
    return `✂️ **Cost Optimization Strategies**\n\nBased on your expense distribution:\n\n${expenses.slice(0, 3).map((e, i) => `### ${i + 1}. ${e.name} (${e.value}% of expenses)\n- Review vendor contracts for better rates\n- Benchmark against industry averages\n- Consider ${e.name === 'Software' ? 'open-source alternatives' : e.name === 'Marketing' ? 'organic growth channels' : e.name === 'Rent' ? 'hybrid/remote work arrangements' : 'bulk purchasing or annual plans'}`).join('\n\n')}\n\n### General Recommendations\n| Action | Potential Savings | Difficulty |\n|---|---|---|\n| Negotiate vendor rates | 10-20% | Medium |\n| Eliminate unused subscriptions | 5-15% | Easy |\n| Automate manual processes | 15-30% | Hard |\n| Switch to annual billing | 10-20% | Easy |\n\n💡 **Pro Tip:** Start with the "Easy" actions — they have the fastest ROI. Ask me about any specific category for deeper analysis.`;
  }

  // Default
  return `Thanks for your question! Here's your current financial snapshot:\n\n| Metric | Value |\n|---|---|\n| Revenue | ₹${stats.revenue.toLocaleString()} |\n| Sales Count | ${stats.salesCount} |\n| Net Profit | ₹${stats.netProfit.toLocaleString()} |\n| Profit Margin | ${margin}% |\n| Conversion | ${stats.conversion}% |\n\nI'm running in **local analysis mode**. I can answer questions about:\n- 📊 Revenue, expenses, and profit margins\n- 🔮 Forecasting and cash flow projection\n- 🏛️ Tax estimation and advance tax schedule\n- 👥 Hiring capacity and salary analysis\n\n> To unlock **AI-powered analysis** with Gemini, add a valid \`GOOGLE_GENERATIVE_AI_API_KEY\` to your \`.env\` file.\n\n💡 **Pro Tip:** Try asking "Show my revenue overview" or "Can I afford to hire?" for detailed analysis.`;
}

export async function POST(req: Request) {
  console.log('[Chat API] Received request');
  try {
    const body = await req.json();
    const { messages, conversationId } = body;

    // Helper to save messages if conversationId is provided
    const saveMessage = async (role: string, content: string) => {
      if (conversationId) {
        try {
          const { saveChatMessage } = await import('@/lib/actions');
          await saveChatMessage(conversationId, role, content);
        } catch (e) {
          console.error('[Chat API] Failed to save message:', e);
        }
      }
    };

    // Check API Key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const hasValidKey = apiKey && !apiKey.includes('XXXX') && apiKey.length > 20;

    // ── Fallback Mode: No API Key ──
    if (!hasValidKey) {
      console.log('[Chat API] No valid API key — using local fallback engine');
      
      // Extract last user message
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
      const userText = lastUserMsg?.parts?.find((p: any) => p.type === 'text')?.text 
                    || lastUserMsg?.content 
                    || 'help';
      
      // Save user message
      await saveMessage('user', userText);
      
      const response = await generateLocalResponse(userText);
      
      // Save assistant response
      await saveMessage('assistant', response);
      
      // Use correct AI SDK v6 UIMessageStream part format
      const textId = crypto.randomUUID();
      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          writer.write({ type: 'start' });
          writer.write({ type: 'start-step' });
          writer.write({ type: 'text-start', id: textId });
          // Stream in chunks for a realistic typing effect
          const chunkSize = 80;
          for (let i = 0; i < response.length; i += chunkSize) {
            writer.write({ type: 'text-delta', id: textId, delta: response.slice(i, i + chunkSize) });
          }
          writer.write({ type: 'text-end', id: textId });
          writer.write({ type: 'finish-step' });
          writer.write({ type: 'finish' });
        },
      });

      return createUIMessageStreamResponse({ stream });
    }

    // ── Full AI Mode: Valid API Key ──
    let dbUser = null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, aiContext: true, aiTone: true, targetRevenue: true, maxExpenseRatio: true, businessGoals: true }
      });
    } catch (e) {
      console.warn('[Prisma] AI fields not yet available for chat route.');
    }

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model: google('gemini-1.5-flash'),
          messages: await convertToModelMessages(messages),
          system: `You are "BI Assistant", a senior ${dbUser?.aiTone || 'CFO'} for "BizAnalytics".
          Your goal is to help the user deeply understand their financial data and make smarter business decisions.
          
          USER PROFILE & CONTEXT:
          - Business: ${dbUser?.aiContext || 'Standard business operations'}
          - Tone Preference: ${dbUser?.aiTone || 'Professional CFO'}
          - Target Monthly Revenue: ₹${(dbUser?.targetRevenue || 100000).toLocaleString()}
          - Max Healthy Expense Ratio: ${dbUser?.maxExpenseRatio || 70}%
          - Key Goals: ${dbUser?.businessGoals || 'Profitability and growth'}
          
          Current Date: ${new Date().toLocaleDateString()}
          Currency: Indian Rupees (₹). Always format numbers with ₹ and toLocaleString.
          
          You have access to several tools to query the live business database:
          1. getGeneralStats: High-level revenue, profit, sales counts.
          2. getMonthlyPerformance: Analyze trends over the last 6-12 months.
          3. getDetailedTransactions: Specific categories, recent activity.
          4. getExpenseBreakdown: Expense distribution by category.
          5. simulateCashFlow: Predict revenue/expenses/profit for the next 3 months using statistical modeling.
          
          Behavioral Rules:
          - ALWAYS use the appropriate tool(s) before answering questions about specific numbers or data. Never guess.
          - When presenting forecasts, explain the methodology (weighted moving average + growth trend + seasonality).
          - Act as a proactive CFO: If someone asks "Can I hire an employee for ₹50,000?", use forecast data to evaluate if future profit margins can absorb the cost.
          - Use markdown formatting: bold for emphasis, bullet points for lists, emojis for visual appeal.
          - Provide actionable recommendations, not just data.
          - If a tool fails, explain clearly and suggest alternatives.
          - Be concise but thorough. Use tables when comparing data.
          - NEVER hallucinate numbers. If a tool returns data, use those exact figures.
          - Add a "💡 Pro Tip" at the end of each response with an actionable insight.`,
          tools: {
            getGeneralStats: {
              description: 'Get high-level business stats including total revenue, sales count, and net profit.',
              inputSchema: z.object({}),
              execute: async () => {
                try {
                  console.log('[Chat Tool] getGeneralStats executed');
                  const stats = await getDashboardStats();
                  return stats;
                } catch (err: any) {
                  console.error('[Chat Tool] getGeneralStats Error:', err);
                  return { error: 'Failed to fetch business stats.' };
                }
              },
            },
            getMonthlyPerformance: {
              description: 'Get monthly performance data for charts (revenue and profit).',
              inputSchema: z.object({}),
              execute: async () => {
                try {
                  console.log('[Chat Tool] getMonthlyPerformance executed');
                  const data = await getMonthlyPerformance();
                  return data;
                } catch (err: any) {
                  console.error('[Chat Tool] getMonthlyPerformance Error:', err);
                  return { error: 'Failed to fetch performance data.' };
                }
              },
            },
            getDetailedTransactions: {
              description: 'Get a list of all recent transactions with their categories, dates, and amounts.',
              inputSchema: z.object({
                limit: z.number().optional().default(10),
              }),
              execute: async ({ limit }: { limit: number }) => {
                try {
                  console.log('[Chat Tool] getDetailedTransactions executed');
                  const txs = await getTransactions();
                  return (txs as any[]).slice(0, limit).map((t: any) => ({
                    id: t.id,
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    date: t.date,
                    category: t.category.name
                  }));
                } catch (err: any) {
                  console.error('[Chat Tool] getDetailedTransactions Error:', err);
                  return { error: 'Failed to fetch transaction details' };
                }
              },
            },
            getExpenseBreakdown: {
              description: 'Get a breakdown of expenses by category.',
              inputSchema: z.object({}),
              execute: async () => {
                try {
                  console.log('[Chat Tool] getExpenseBreakdown executed');
                  const data = await getExpenseBreakdown();
                  return data;
                } catch (err: any) {
                  console.error('[Chat Tool] getExpenseBreakdown Error:', err);
                  return { error: 'Failed to fetch expense breakdown.' };
                }
              },
            },
            simulateCashFlow: {
              description: 'Generate a predictive forecast of revenue, expenses, and profit for the upcoming three months.',
              inputSchema: z.object({}),
              execute: async () => {
                try {
                  console.log('[Chat Tool] simulateCashFlow executed');
                  const result = await getBusinessForecast();
                  if (result.success) {
                    return result.forecast;
                  }
                  return { error: result.error };
                } catch (err: any) {
                  console.error('[Chat Tool] simulateCashFlow Error:', err);
                  return { error: 'Failed to simulate cash flow forecast.' };
                }
              },
            },
          },
          stopWhen: stepCountIs(5),
        });

        writer.merge(result.toUIMessageStream());
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error: any) {
    console.error('[Chat API] Critical Backend Error:', error);
    
    const errorMessage = error.message || 'AI Chat failed to respond';
    const isQuotaExceeded = errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota');
    
    return new Response(JSON.stringify({ 
      error: isQuotaExceeded ? 'API Quota Exceeded' : 'AI Analysis Error', 
      details: isQuotaExceeded 
        ? 'The Gemini API quota has been reached. Please try again in a moment.' 
        : errorMessage 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
