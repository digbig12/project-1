# TYPOGRAPHY & STYLING INSTRUCTIONS (PLEASE READ)
> [!IMPORTANT]
> To comply with Image 3 of your guidelines, please apply these settings when converting this to Word/PDF:
> - **Font:** Times New Roman
> - **Heading 1:** Font Size 18, Bold, Centered
> - **Subheadings:** Font Size 16, Bold, Left Aligned
> - **Body Paragraphs:** Font Size 16, Justified
> - **References:** Font Size 12, Left Aligned
> - **Line Spacing:** 1.5 (Standard for academic documents)

---

<div align="center">
  <h3>A Synopsis</h3>
  <h3>on</h3>
  <h1>BizAnalytics: AI-Driven Financial Intelligence System</h1>
  <br>
  <p><i>in partial fulfillment of the requirement for the degree of</i></p>
  <h3>Bachelor of Technology</h3>
  <p>In</p>
  <h3>COMPUTER SCIENCE AND ENGINEERING</h3>
  <br>
  <h4>Submitted by</h4>
  <p><b>Anjali</b> (Roll No: 2201331560009)</p>
  <p><b>Shiva</b> (Roll No: 2201331560059)</p>
  <p><b>Aayushi</b> (Roll No: 2201331560003)</p>
  <br>
  <h4>Under the supervision of</h4>
  <h3>Mr. Sanny</h3>
  <p>(Designation: Assistant Professor, CSE)</p>
  <h3>Mrs. Bandana</h3>
  <p>(Designation: Assistant Professor, CSE)</p>
  <br>
  <img src="https://niet.co.in/images/niet-logo.png" width="120" alt="NIET Logo">
  <h3>NIET Greater Noida</h3>
  <p>Autonomous Institute</p>
</div>

---

## NOIDA INSTITUTE OF ENGINEERING AND TECHNOLOGY GREATER NOIDA

# INDEX

| Sr.No. | Topics | Page No. |
|:---:|:--- |:---:|
| 1 | Introduction | 1 |
| 2 | Survey of Existing Systems | 4 |
| 3 | Problem Statement | 6 |
| 4 | Proposed Methodology | 7 |
| 5 | Feasibility Study | 13 |
| 6 | Facilities Required | 14 |
| 7 | Conclusion | 15 |
| 8 | References | 16 |

<br><br><br>
**Supervisor Sign:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
*(Sign of supervisor on synopsis is mandatory while submission)*

---

# 1. INTRODUCTION

The financial landscape for small and medium-sized enterprises (SMEs) is undergoing a significant transformation. Traditional accounting methods, which once relied heavily on manual ledger entries and physical receipt stacks, are becoming obsolete in the face of rapid digitalization. However, many SMEs still find current digital solutions either too complex (ERP systems) or too basic (static expense trackers). **BizAnalytics** is a state-of-the-art AI-driven financial intelligence platform designed to bridge this gap.

### Project Background
BizAnalytics leverages a **Hybrid Intelligence Architecture** that combines rigorous statistical modeling with Large Language Models (LLMs), specifically the Google Gemini 1.5 Flash API. The system overcomes traditional AI "hallucinations" by establishing a **Local Statistical Grounding Layer** before applying generative intelligence for strategic oversight.

### Technology Used
The system is built on a modern full-stack architecture:
- **Next.js 16 (App Router):** For a high-performance, React 19-powered frontend.
- **TypeScript:** Ensuring type safety and code reliability.
- **Prisma ORM & SQLite:** For efficient, relational data management.
- **Statistical Analytics Engine:** A custom-built TypeScript library for WMA, Seasonality, and Growth Trend analysis.
- **Google Gemini 1.5 Flash:** Used for both Computer Vision (OCR) and Refined Predictive Forecasting.
- **Framer Motion:** To create a premium, "Board-Ready" data visualization experience.

### Key Technical Terms
- **Statistical Grounding:** The practice of anchoring AI outputs in deterministic mathematical computations to ensure accuracy.
- **WMA (Weighted Moving Average):** A time-series forecasting method that assigns higher significance to recent data points.
- **Context-Aware Intelligence:** A system design where the AI is "trained" on user-defined business goals and benchmarks.
- **RAG (Retrieval-Augmented Generation):** A technique to make AI responses more accurate by providing specific context from user data.

---

# 2. SURVEY OF EXISTING SYSTEMS

In the current scenario, businesses use a variety of legacy approaches to manage their finances. The survey below highlights the primary limitations of existing systems compared to the proposed BizAnalytics model.

### Tabular Survey of Existing Systems

| Feature | Manual Ledger / Excel | Legacy Software (Tally/QuickBooks) | **BizAnalytics (Proposed)** |
|:--- |:---:|:---:|:---:|
| **Data Entry** | Manual | Manual / CSV Only | **Automated AI OCR** |
| **Grounding** | Pure Math (Static) | Rule-Based | **Hybrid Statistical + AI** |
| **Analysis** | None / Pivot Tables | Retrospective Reports | **Grounded Forecasting** |
| **User Interface** | Grid (Complex) | Technical / Tabular | **Premium Visualization** |
| **Consultation** | Requires Accountant | Requires Analyst | **"Context-Aware" AI CFO** |
| **Error Rate** | High (Human Error) | Medium (Input Error) | **Deterministic Accuracy** |

### Current Scenario Limitations
Current systems primarily focus on *what happened in the past*. Businesses can see their expenses last month, but they cannot easily see where they will be three months from now without a dedicated financial analyst. Furthermore, the barrier to entry for professional software is often high, requiring specialized training to navigate complex accounting menus. BizAnalytics aims to move from a "Backward-Looking" recorder to a "Forward-Looking" strategic partner.

---

# 3. PROBLEM STATEMENT

Small business owners and startup founders often find themselves "working IN the business rather than ON the business." This is largely due to the administrative burden of financial management.

### The Core Problem
The fundamental challenge addressed by BizAnalytics is the lack of affordable, real-time, and **verifiable** financial intelligence. 
1. **The Entry Gap:** Manual data entry is time-consuming and prone to human error.
2. **The Reliability Gap:** Pure AI-generated financial forecasts often suffer from "hallucinations," making them dangerous for actual business planning.
3. **The Strategy Gap:** Traditional tools provide snapshots of the past but do not offer guidance adapted to specific user-defined business targets.

### Project Objective
BizAnalytics resolves these issues by implementing a **Grounded Analytics Engine** that first computes mathematical truths and then utilizes AI to interpret them into actionable business strategies.

---

# 4. PROPOSED METHODOLOGY

The development of BizAnalytics follows a strict **Modular Software Development Lifecycle**. The methodology is centered around four primary engine modules that work in synchrony to deliver financial intelligence.

### Module 1: AI Data Extraction Engine (Vision)
Utilizes Gemini 1.5 Flash's computer vision to transform physical receipts into structured JSON data, automatically identifying merchant, tax, and deductible status.

### Module 2: Deterministic Analytics Engine (Math)
A pure-TypeScript computation layer that establishes the "Ground Truth." It calculates MoM Growth, Profit Margins, and detects anomalies using statistically significant thresholds (e.g., 20% cost spikes).

### Module 3: Hybrid Forecasting Engine (Prediction)
Combines **Weighted Moving Averages** and **Seasonality Indexing** with LLM refinement. The AI is provided with the statistical baseline and is restricted to refining it within a ±15% "Safety Corridor" to ensure realistic projections.

### Module 4: Context-Aware Chat Interface (Cognition)
A personalized "Conversational CFO" that is trained on the user's specific business context (e.g., Target Revenue, Max Expense Ratio). The assistant adopts a user-selected personality (CFO, Advisor, or Cost-Cutter) to deliver tailored advice.

---

### USE CASE DIAGRAM
![Use Case](file:///C:/Users/Satendra%20Singh/.gemini/antigravity/brain/7232fa51-c0b2-499b-9c5f-a5cfbf1b2977/synopsis_use_case_diagram_1776795581307.png)
*Description: The diagram illustrates the interaction between the User, the AI System, and the Database. Key actions include Scanning Receipts, Managing Categories, and Consulting the AI Forecast.*

### E-R DIAGRAM (ENTITY RELATIONSHIP)
![ER Diagram](file:///C:/Users/Satendra%20Singh/.gemini/antigravity/brain/7232fa51-c0b2-499b-9c5f-a5cfbf1b2977/synopsis_er_diagram_1776795589391.png)
*Description: Shows the relationships between Users, Transactions, Categories, and AI Insights. A many-to-one relationship exists between Transactions and Users, and a self-relation for Categories.*

---

# 5. FEASIBILITY STUDY

### Technical Feasibility
The BizAnalytics tech stack is highly feasible as it relies on established, secure, and well-maintained frameworks (Next.js, Prisma). The availability of low-latency AI models (Gemini 1.5 Flash) ensures that the OCR and Chat features are responsive enough for real-world business use.

### Operational Feasibility
Operationally, the system is designed to be intuitive. By removing complex accounting menus and replacing them with a dashboard and a chat interface, we ensure that users with zero accounting background can effectively manage their business finances.

### Economic Feasibility
The development cost is primarily focused on API utilization. By using specialized "Flash" models, the cost-per-scan is kept significantly lower than hiring a junior accountant, making the system highly economically viable for small businesses.

---

# 6. FACILITIES REQUIRED

### Software Requirements
- **Development Interface:** VS Code
- **Language:** JavaScript/TypeScript (Node.js/Next.js)
- **Database Server:** SQLite (Development) / PostgreSQL (Production)
- **AI Infrastructure:** Google AI Studio / Gemini API
- **Deployment Platform:** Vercel

### Hardware Requirements
- **Processor:** Intel Core i5 or higher (for development)
- **RAM:** 8GB Minimum
- **Storage:** 256GB SSD
- **Network:** High-speed internet for API communication

---

# 7. CONCLUSION

BizAnalytics: AI-Driven Financial Intelligence System is more than just an expense tracker; it is a strategic paradigm shift for SMEs. By automating the administrative burden of data entry and providing advanced, forward-looking insights through AI, we empower business owners to make decisions backed by data rather than intuition. The project successfully demonstrates the practical application of Large Language Models in the domain of Computational Finance.

---

# 8. REFERENCES

[1] Vercel. "Next.js Documentation." [Online] https://nextjs.org/docs

[2] Google DeepMind. "Gemini 1.5 Flash: Efficient and Accurate Vision-Language Processing." [Online] https://ai.google.dev/docs

[3] Prisma Team. "Modern Relational Data Management with Prisma." [Online] https://www.prisma.io/docs

[4] D. Du, X. Hu, "Steiner Tree Problems In Computer Communication Networks", World Scientific Publishing Company, 2008.

[5] G. I. Miller, "A CFO's Guide to Business Intelligence Systems", Financial Times Press, 2021.
