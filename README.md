# BizAnalytics AI Dashboard

A premium, AI-powered business analytics dashboard built with Next.js, Gemini AI, and Prisma.

##  Features

- **AI Executive Summary**: Get instant strategic insights from your dashboard data.
- **Financial Assistant**: A context-aware chat interface to query your business performance.
- **Smart OCR Scanner**: Upload receipts to automatically extract transaction details using Gemini Vision.
- **Predictive Forecasting**: Data-driven revenue and profit projections for the next 3 months.
- **Personalized Dashboard**: Greets you by your company name after registration.
- **Premium UI**: Modern glassmorphism design with responsive charts and animations.

###  AI Chat Assistant — Enhanced

The BI Assistant is a premium financial intelligence chatbot with:

| Feature | Description |
|---|---|
|  Rich Tables | Financial data rendered in structured markdown tables |
|  Persistent History | Chat threads saved to database, survives page refresh |
|  Quick Start Cards | 6 one-click suggestion tiles for common queries |
|  Dynamic Thinking | Animated indicator cycling through contextual status messages |
|  Follow-up Chips | Context-aware suggestions after each AI response |
|  Export Chat | Download entire conversation as a `.txt` file |
|  Keyboard Shortcuts | `/` to focus input, `Esc` to blur |
|  Conversation Management | Delete old threads, start new chats |
|  Fullscreen Mode | Expand chat to fill the viewport |
|  Copy Responses | One-click copy any AI response |

**Supported Queries**: Revenue overview, expense breakdown, monthly performance, profit margin analysis, 3-month forecast, tax estimation (India), hiring capacity analysis, cost optimization strategies.

##  Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI Engine**: Vercel AI SDK v6 & Google Gemini (with local fallback engine)
- **Database**: PostgreSQL with Prisma ORM (Neon / Supabase / Vercel Postgres)
- **UI & Animations**: Tailwind CSS 4, Framer Motion, Lucide React
- **Charts**: Recharts
- **Auth**: NextAuth v5 with 2FA support

##  Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your values:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/bizanalytics?sslmode=require"
   AUTH_SECRET="your-secret-key"
   GOOGLE_GENERATIVE_AI_API_KEY="your_api_key_here"
   ```
   > The AI chat works without a Gemini API key using the built-in fallback engine.
   >
   > Get a free PostgreSQL database at [neon.tech](https://neon.tech) — free tier is sufficient.

3. **Database Setup**:
   ```bash
   npx prisma db push
   ```

4. **Run Locally**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

##  Deploy to Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard (from `.env.example`)
4. Deploy — `prisma generate` runs automatically via `postinstall` script

##  Project Structure

- `src/app` — Application routes and pages
- `src/app/chat` — AI Chat Assistant with history sidebar
- `src/app/api/chat` — Chat API with Gemini + fallback engine
- `src/components` — Reusable UI and AI components
- `src/lib` — Database client, server actions, and utility functions
- `prisma` — Database schema (User, Transaction, Category, Conversation, ChatMessage)

##  Keyboard Shortcuts

| Key | Action |
|---|---|
| `/` | Focus chat input |
| `Esc` | Blur chat input |

---


