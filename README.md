# StockWise AI — Distribution Intelligence & Inventory Optimization Platform

> *"Smarter Inventory. Better Distribution."*

StockWise AI is an enterprise-grade, AI-assisted Distribution Intelligence and Inventory Optimization Platform designed to eliminate stockouts, minimize deadweight excess inventory, and optimize freight route costs across multi-echelon supply networks.

---

## 🎨 Design System: Precision Logistics

StockWise AI is built upon the **Precision Logistics** design specification:

- **Typography**: Inter across all navigation, dense data grids, and telemetry cards. Numeric telemetry, stock volume counts, and currency metrics leverage tabular lining figures (`tabular-nums`) for vertical column alignment.
- **Color Governance**:
  - **Interactive Primary**: `#2563EB` (Hover: `#1D4ED8`, Active: `#1E40AF`)
  - **Base Canvas**: `#F7F9FC`
  - **Elevated Data Containers**: `#FFFFFF` with 1px solid `#E2E8F0` borders and soft ambient shadows (`0 1px 3px 0 rgba(0, 0, 0, 0.05)`).
  - **Primary Ink**: `#172033` (Secondary annotations: `#64748B`)
  - **Semantic Status Pills**:
    - **Healthy Stock / Active**: `#16A34A` over `#DCFCE7`
    - **Low Stock Warning**: `#D97706` over `#FEF3C7`
    - **Critical Stockout Exception**: `#DC2626` over `#FEE2E2`
    - **In-Transit / Allocation Info**: `#0891B2` over `#CFFAFE`
- **Application Shell**:
  - Persistent 240px desktop navigation rail.
  - Collapsible on tablet, responsive drawer sheet on mobile.
  - Persistent 64px header with breadcrumbs, command palette (`⌘K`), AI Copilot assistant, notifications, and instant demo data reset.

---

## ⚡ The 5 Connected Core Features

### 1. Smart Distribution Engine
Determines what inventory should be moved, from which warehouse or store, to which destination, and in what quantity. Evaluates uncommitted source inventory above safety buffers, destination deficits, and transport route economics.

### 2. Stockout Prevention Telemetry
Calculates transparent days of supply remaining for all retail store locations:
$$\text{Estimated Days Remaining} = \frac{\text{Available Stock}}{\text{Average Daily Demand}}$$
- **Guarded Division**: If average daily demand is zero or negative, the engine safely guards against division by zero and falls back to comparing available stock directly against safety buffers.
- **Severity Ranking**:
  - **Critical**: $\le 2.0$ days remaining or zero stock.
  - **High**: $\le 4.0$ days remaining.
  - **Moderate**: $\le 7.0$ days remaining.
  - **Low / None**: $> 7.0$ days remaining.
- Links directly to the distribution planner to auto-resolve deficits.

### 3. Excess Inventory Redistribution
Calculates surplus inventory beyond configured target coverage days (default 21 days) and evaluates holding cost liabilities ($22\%$ annual carrying rate). Automatically identifies candidate destination stores requiring replenishment and computes feasible route transit costs.

### 4. Cost-Aware Inventory Optimization Solver
A deterministic multi-echelon linear solver that evaluates 24 regional transportation lanes across 3 central warehouses and 8 stores. Supports configurable objectives:
- **Balanced Strategy (Recommended)**: Solves stockout deficits while consolidating freight costs.
- **Prevent Stockouts First**: Maximizes service level and minimizes transit days.
- **Minimize Freight Cost**: Minimizes landed freight expenses per unit.
Guarantees source warehouse safety buffers are never breached.

### 5. Before-and-After Scenario Simulation
Stress-tests network resilience under multi-variable operational shocks:
- Demand multipliers ($-30\%$ slump to $+60\%$ holiday surge).
- Transportation fuel inflation surcharges ($+15\%$ to $+60\%$).
- Freight budget ceilings ($\$15,000$ to $\$90,000$).
- Facility outage modeling (e.g. West Coast Fulfillment Hub Reno offline).
Recalculates the deterministic solver in real time without hardcoding outcomes. Preserves saved scenarios for audits and comparisons.

---

## 🤖 AI Integration Architecture (Hybrid Approach)

StockWise AI enforces a responsible, fault-tolerant hybrid AI architecture:

- **Part A: Deterministic Engine**: Core mathematical optimizations, stockout indicators, and route costs are computed by testable algorithms.
- **Part B: AI-Powered Decision Explanations**: Natural language business rationales utilize OpenAI models (configured via `OPENAI_MODEL` e.g. `gpt-4o-mini`). Includes an immediate verified deterministic fallback ensuring 100% functionality even when offline or unconfigured.
- **Part C: AI Assistant Copilot**: Slide-over inventory copilot grounded strictly in live application data. Answers questions like *"Which stores have the highest stockout risk?"*, *"Where is our excess inventory?"*, and *"Why was this transfer recommended?"*.
- **Part D: Security & Privacy**: API keys are masked, never committed, and configurable through environment variables or the settings dashboard.

---

## 🌐 Multi-Echelon Network Topology

- **3 Central Warehouses**:
  1. `WH-CHI-01`: Central Logistics Hub (Chicago, IL) — Capacity 150,000 units
  2. `WH-NWK-02`: East Coast Distribution Center (Newark, NJ) — Capacity 110,000 units
  3. `WH-RNO-03`: West Coast Fulfillment Hub (Reno, NV) — Capacity 130,000 units
- **8 Regional Retail Stores & Distributors**:
  1. `STR-NYC-101`: Metro Flagship Store (New York, NY)
  2. `STR-BOS-102`: Downtown Express Store (Boston, MA)
  3. `STR-PHL-103`: Suburban MegaStore (Philadelphia, PA)
  4. `STR-CHI-104`: Northside Retail Hub (Chicago, IL)
  5. `STR-SJC-105`: South Bay Outlet (San Jose, CA)
  6. `STR-ATL-106`: Airport Express Outlet (Atlanta, GA)
  7. `STR-SEA-107`: Harbor Retail Center (Seattle, WA)
  8. `STR-DEN-108`: West End Superstore (Denver, CO)
- **26 Multicategory SKUs**: Electronics, Pharmaceuticals (perishables with shelf life/expiry dates), Apparel, Consumer Goods, and Industrial Supplies.
- **24 Complete Route Corridors**: Fixed base costs, per-unit freight rates, and transit days.

---

## 🚀 Quickstart & Setup Instructions

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24.13.0)
- **npm** or **pnpm**

### 2. Installation
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Run Verification Unit Tests
To verify all deterministic mathematical formulas and solver constraints:
```bash
npm test
```
Outputs:
```text
====================================================
STOCKWISE AI: VERIFICATION & UNIT TEST SUITE
====================================================
--- 1. Testing Days of Stock Remaining Formula ---
[PASS] Normal demand: 100 stock / 10 demand = 10.0 days
[PASS] NYC Flagship ANC Headphones: 6 stock / 14.2 demand = 0.4 days
[PASS] Boston Insulin: 4 stock / 8.0 demand = 0.5 days
[PASS] Guards against division by zero (demand = 0 returns null)
...
====================================================
SUMMARY: 22 PASSED, 0 FAILED
ALL ENGINE FORMULAS COMPLIANT WITH SPECIFICATION
====================================================
```

### 5. Build for Production
```bash
npm run build
```
Builds the optimized production bundle in `/dist` with zero TypeScript errors.

---

## 📋 Canonical Navigation Map

- **OVERVIEW**: `Dashboard`
- **INVENTORY**: `Products`, `Stock Movements`, `Import Data`
- **LOCATIONS**: `Warehouses`, `Stores & Distributors`
- **INTELLIGENCE**: `Demand Analysis`, `Stockout Alerts`, `Excess Inventory`, `Redistribution Recommendations`
- **DISTRIBUTION**: `Distribution Planner`, `Optimization Results`, `Plan Comparison`, `Shipments`
- **SIMULATION**: `Run Simulation`, `Saved Scenarios`
- **REPORTS**: `Reports & Analytics`
- **SYSTEM**: `Notifications`, `Settings`, `Help & Support`
- **GETTING STARTED / AUTH**: `Onboarding Setup`, `Sign In`, `Register`

---

## 📄 License
MIT License. Built for the Hackathon: AI-assisted Distribution Intelligence and Inventory Optimization Platform.
