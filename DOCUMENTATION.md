# Atiq CRM (MarginOS) — Complete System Documentation & Financial Manual

> **Purpose:** This document is a complete operational manual, financial formula reference, and mechanism walkthrough for the **Atiq Fashion Costing & Profitability Management System**. Use this document to onboard colleagues, factory managers, merchandisers, and accountants.

---

## 📑 Table of Contents
1. [Executive Summary & Background](#1-executive-summary--background)
2. [The Core Problem We Are Solving](#2-the-core-problem-we-are-solving)
3. [Financial Formulas & Mathematical Engine](#3-financial-formulas--mathematical-engine)
   - [BOM & Garment Making Cost (COGS)](#a-bom--garment-making-cost-cogs)
   - [Suggested MRP & Pricing Multiplier](#b-suggested-mrp--pricing-multiplier)
   - [The 20% COGS Benchmark Rule](#c-the-20-cogs-benchmark-rule)
   - [The 3-Stage Contribution Margin Hierarchy (CM1, CM2, CM3)](#d-the-3-stage-contribution-margin-hierarchy-cm1-cm2-cm3)
   - [Refund Loss Provision (Return Deduction)](#e-refund-loss-provision-return-deduction)
   - [Breakeven Production Units](#f-breakeven-production-units)
   - [Inventory Carrying Cost & Bleed](#g-inventory-carrying-cost--bleed)
4. [Multi-Marketplace Channel Profit Simulator](#4-multi-marketplace-channel-profit-simulator)
5. [Complete Module-by-Module Operational Guide](#5-complete-module-by-module-operational-guide)
   - [Module 1: Dashboard Overview](#module-1-dashboard-overview)
   - [Module 2: Costing & Pricing Studio](#module-2-costing--pricing-studio)
   - [Module 3: Revenue Timeline (Daily / Monthly / Yearly)](#module-3-revenue-timeline-daily--monthly--yearly)
   - [Module 4: SKU Profit & Loss Register](#module-4-sku-profit--loss-register)
   - [Module 5: Stock-Wise Overview (Top Items)](#module-5-stock-wise-overview-top-items)
   - [Module 6: Production Batch Register](#module-6-production-batch-register)
   - [Module 7: Dead Stock & Liquidation Manager](#module-7-dead-stock--liquidation-manager)
   - [Module 8: Returns & Quality Watch](#module-8-returns--quality-watch)
   - [Module 9: Logistics & Courier Watch](#module-9-logistics--courier-watch)
   - [Module 10: Factory Expenses & Overheads](#module-10-factory-expenses--overheads)
   - [Module 11: Garment Style Catalog](#module-11-garment-style-catalog)
   - [Module 12: Master Settings & Channel Rate Directory](#module-12-master-settings--channel-rate-directory)
6. [Non-Tech Hindi-English Glossary for Garment Teams](#6-non-tech-hindi-english-glossary-for-garment-teams)

---

## 1. Executive Summary & Background

This system was engineered based on the direct operational requirements from the 54-minute client meeting with **Atiq Studio**.

### The Primary Objective:
Replace static, fixed-formula Excel sheets with a centralized, reactive garment ERP that reveals the **true net pocket profit** of each garment style **before** cutting fabric, sampling, launching production batches, or committing marketing ad spend.

### Key Business Realities Addressed:
1. **Garment Costing is Priority #1**: Website redesign, social media, and advanced automations are secondary to ensuring that every manufactured piece makes genuine money.
2. **Preventing Failed Batches**: Stop loss-making batches from going into production by locking sample costs and batch economics upfront.
3. **Net Realization vs. Gross Revenue**: In fashion e-commerce, gross sales are an illusion. Margins must account for discounts, customer returns (8% to 35%), GST exclusion, marketplace commission cuts (20% to 25%), forward/reverse courier fees, and Meta ad CAC.
4. **Historical Data Integrity**: When fabric or karigar prices increase over time, changing master defaults applies **prospectively**. Historical batches preserve their locked manufacturing costs permanently.

---

## 2. The Core Problem We Are Solving

### The "Homewear Loss Batch" Scenario (ATQ-HW-014):
During the client meeting, the client described a real loss-making batch that highlighted the exact vulnerabilities of the business:
- **Production Batch Size**: 100 pieces manufactured.
- **Selling Price / MRP**: Assumed ~₹1,399 – ₹1,400.
- **Sales vs. Unsold Stock**: Only ~20 pieces sold; ~80 pieces remained stuck in the factory warehouse.
- **Capital Blocked**: Over **₹1,00,000** stuck in unsold, dead fabric inventory.
- **COGS Ratio**: Reached **30% to 40% of MRP** (violating the client's strict target limit of ≤ 20%).
- **Marketplace Friction**: Myntra experienced heavy customer returns (up to 32%).
- **Ad Spend**: ₹20,000 – ₹25,000 spent on Meta ads without knowing per-piece profitability.

**The Solution:** This CRM flags these exact traps in real time before production begins.

---

## 3. Financial Formulas & Mathematical Engine

### A. BOM & Garment Making Cost (COGS)
Every garment piece is broken down into its itemized Bill of Materials (BOM):

$$\text{Fabric Cost} = \text{Fabric Consumption (meters)} \times \text{Fabric Rate (₹ / meter)}$$

$$\text{Making Cost (COGS)} = \text{Fabric Cost} + \text{Trims} + \text{Cutting} + \text{Stitching (Silai)} + \text{Finishing/QC} + \text{Packaging} + \text{Other}$$

*Example (`ATQ-TEE-001`):*
- Fabric: $1.35\text{ m} \times ₹180 = ₹243$
- Trims (Labels, Thread): $₹24$
- Cutting: $₹18$
- Stitching: $₹42$
- Finishing & Ironing: $₹12$
- Polybag & Barcode: $₹14$
- Other: $₹8$
- **Total Making Cost (COGS) = ₹361 per piece**

---

### B. Suggested MRP & Pricing Multiplier
Garment industry pricing relies on a configurable markup multiplier (e.g., $2.0\times, 2.5\times, 4.0\times$):

$$\text{Recommended MRP} = \text{Total Making Cost (COGS)} \times \text{Pricing Multiplier}$$

*Example:* At $2.0\times$ multiplier on $₹361$ COGS, Recommended MRP = **₹722** (or calibrated higher for premium marketplace retail).

---

### C. The 20% COGS Benchmark Rule
The client's non-negotiable benchmark: **COGS should be at or below 20% of MRP**.

$$\text{COGS \% of MRP} = \left(\frac{\text{Total Making Cost (COGS)}}{\text{Selling MRP}}\right) \times 100$$

- **✅ Benchmark Pass (Green):** $\text{COGS \%} \le 20\%$ (e.g., ₹200 COGS on ₹1,000 MRP = 20.0%).
- **❌ Benchmark Fail (Red Alert):** $\text{COGS \%} > 20\%$ (e.g., ₹361 COGS on ₹1,499 MRP = 24.1% $\rightarrow$ Flags warning to review fabric rates or adjust MRP).

---

### D. The 3-Stage Contribution Margin Hierarchy (CM1, CM2, CM3)

The CRM follows the exact 3-part financial journey requested in the meeting:

```
[Selling MRP] 
      │ 
      ▼ (Less: Promo Discount & Customer Return Provision)
[Net Customer Sales] 
      │ 
      ▼ (Less: GST Tax - Tax is not company revenue)
┌───────────────────────────────────────────────┐
│  STAGE 1: CM1 — Net Realisation (ex-GST)      │
└───────────────────────────────────────────────┘
      │ 
      ▼ (Less: Platform Commission Cut + Making Cost/COGS)
┌───────────────────────────────────────────────┐
│  STAGE 2: CM2 — Gross Contribution            │
└───────────────────────────────────────────────┘
      │ 
      ▼ (Less: Forward & Reverse Courier + Meta Ad CAC)
┌───────────────────────────────────────────────┐
│  STAGE 3: CM3 — Net In-Hand Pocket Cash       │
└───────────────────────────────────────────────┘
```

#### Stage 1: CM1 (Net Realisation ex-GST)
1. **Discounted Selling Price:**
   $$\text{Discounted Price} = \text{MRP} \times \left(1 - \frac{\text{Discount \%}}{100}\right)$$
2. **Customer Return Provision:**
   $$\text{Net Revenue After Returns} = \text{Discounted Price} \times \left(1 - \frac{\text{Expected Returns \%}}{100}\right)$$
3. **Excluding GST (Tax):**
   $$\text{CM1} = \frac{\text{Net Revenue After Returns}}{1 + \frac{\text{GST \%}}{100}}$$

#### Stage 2: CM2 (Gross Contribution)
Does the product earn enough to pay the marketplace fee and recover its manufacturing cost?
1. **Platform Cut (Commission + Fee + 18% GST on fees):**
   $$\text{Commission} = \text{CM1} \times \left(\frac{\text{Commission \%}}{100}\right)$$
   $$\text{Total Platform Cut} = (\text{Commission} + \text{Fixed Closing Fee}) \times 1.18$$
2. **Gross Contribution:**
   $$\text{CM2} = \text{CM1} - \text{Total Platform Cut} - \text{Total COGS}$$

#### Stage 3: CM3 (Net In-Hand Pocket Cash)
What is actually left in the bank after delivery logistics and customer acquisition (CAC)?
1. **Logistics & Return Friction:**
   $$\text{Total Logistics} = \text{Forward Courier} + \left(\text{Reverse Courier} \times \frac{\text{Expected Returns \%}}{100}\right)$$
2. **Net Pocket Cash (CM3):**
   $$\text{CM3} = \text{CM2} - \text{Total Logistics} - \text{Marketing Ad CAC}$$
3. **Net Profit Margin %:**
   $$\text{Net Profit Margin \%} = \left(\frac{\text{CM3}}{\text{MRP}}\right) \times 100$$

---

### E. Refund Loss Provision (Return Deduction)
When logging sales on the **Revenue** screen, the system deducts the **Refund Loss Provision**:

$$\text{Return Deduction} = \text{Gross Sales Revenue} \times \left(\frac{\text{Expected Returns \%}}{100}\right)$$
$$\text{Net Revenue} = \text{Gross Sales Revenue} - \text{Return Deduction}$$

- **Why it matters:** On 10 pieces sold at ₹1,349 (Gross = ₹13,490) with an 8% expected return rate:
  - $\text{Return Deduction} = ₹13,490 \times 8\% = \mathbf{-₹1,079}$
  - $\text{Net Realized Revenue} = ₹13,490 - ₹1,079 = \mathbf{₹12,411}$
- This prevents recognizing "phantom revenue" that will be lost when items are returned.

---

### F. Breakeven Production Units
Calculates how many pieces of a batch must be sold before the entire batch's manufacturing cost is paid back:

$$\text{Breakeven Units} = \left\lceil \frac{\text{Total COGS} \times \text{Batch Size}}{\text{CM2}} \right\rceil$$

*Example:* In a 100-piece batch of ₹361 COGS (Total making cost = ₹36,100) with a CM2 of ₹463:
$$\text{Breakeven Units} = \frac{36,100}{463} = \mathbf{78\text{ pieces}}$$
- You must sell **78 pieces** just to cover making costs; profit only begins on unit 79.

---

### G. Inventory Carrying Cost & Bleed
Stock sitting in a warehouse is not free—it consumes capital interest and floor space:

$$\text{Carrying Cost Bleed (₹ / month)} = \text{Blocked Capital} \times \left(\frac{\text{Annual Carrying Rate \%}}{12 \times 100}\right)$$

*Example:* At an 18% annual carrying rate, **₹1,00,000** in stuck inventory burns **₹1,500 every single month** in lost interest and holding cost.

---

## 4. Multi-Marketplace Channel Profit Simulator

Different sales channels yield drastically different bank deposits for the exact same garment:

| Channel | Typical Commission | Closing Fee | Return Rate | Forward Courier | Net Pocket Cash (CM3) | Health Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Myntra** | 22.5% | ₹15 | 30% | ₹75 | Moderate / Tight | ⚠️ High return drag |
| **Amazon** | 18.0% | ₹25 | 18% | ₹70 | Healthy | ✅ Consistent volume |
| **Flipkart** | 19.5% | ₹20 | 22% | ₹70 | Healthy | ✅ Good margin |
| **Meesho** | 0.0% | ₹0 | 28% | ₹65 | High Margin | ✅ 0% commission |
| **Shopify / Web** | 2.5% (PG) | ₹0 | 12% | ₹60 | Maximum Profit | 🚀 Highest net cash |
| **Offline Retail** | 0.0% | ₹0 | 3% | ₹0 | Pure Profit | 💎 Zero channel fees |

### How to Use the Simulator in Costing Studio:
1. Select any garment style from the top dropdown.
2. In the **Multi-Marketplace Channel Profit Simulator**, drag the **Test Promo Discount Slider (0% – 50%)**.
3. Compare the side-by-side **Net Pocket Cash (CM3)** and **Net Margin %** across channels.
4. Click **Apply to SKU** on any row to instantly copy that channel's exact commission and return rates into your active costing!

---

## 5. Complete Module-by-Module Operational Guide

### Module 1: Dashboard Overview
- **Primary Use:** Daily executive pulse for the owner and general manager.
- **Key Metrics:** Styles costed, Average COGS vs 20% target, Factory stock on hand, Blocked capital, and Dead stock alerts.
- **Workflow:** Check the top warning badges every morning for any batches approaching liquidation or dead stock status.

### Module 2: Costing & Pricing Studio
- **Primary Use:** Before creating a sample or issuing a production PO to tailors (karigars).
- **Workflow:**
  1. Enter **Style Name**, **SKU code**, and **Category**.
  2. Input **Fabric consumption** (meters) and **Fabric rate** (₹/m).
  3. Input **Trims, Cutting, Stitching (Silai), Finishing**, and **Packaging**.
  4. Check the **Margin Verdict** card:
     - Is COGS ≤ 20% of MRP?
     - What is the CM3 Pocket Cash?
  5. Check the **Multi-Marketplace Simulator** to ensure the piece is profitable on Myntra and Amazon.
  6. Click **Save SKU Costing**.

### Module 3: Revenue Timeline (Daily / Monthly / Yearly)
- **Primary Use:** Track actual sales, refunds, and true realized cash.
- **Workflow:**
  1. Select **Today, Monthly**, or **Yearly** filter pills.
  2. Use **Log Actual Sales Record** to record orders: select date, channel, SKU, quantity, and sale price.
  3. The system automatically computes gross revenue, applies the **Return Provision**, and outputs true Net Revenue.

### Module 4: SKU Profit & Loss Register
- **Primary Use:** Merchandising review—identify high-margin winners vs margin-draining losers.
- **Workflow:** Sort by Net Margin % or CM3 to decide which styles to re-order for production and which to discontinue.

### Module 5: Stock-Wise Overview (Top Items)
- **Primary Use:** Warehouse stock monitoring across all styles.
- **Workflow:** View inventory counts, manufacturing cost valuation, and stock levels to prevent stock-outs on top sellers.

### Module 6: Production Batch Register
- **Primary Use:** Track individual production runs (e.g., `BATCH-2026-001`).
- **Workflow:**
  1. Create a new batch when issuing work to the factory floor.
  2. The system locks the unit manufacturing cost so future price changes do not distort historical batch accounting.
  3. Track produced qty, sold qty, returns, on-hand stock, and blocked capital.

### Module 7: Dead Stock & Liquidation Manager
- **Primary Use:** Preventing the "₹1 Lakh stuck in warehouse" disaster.
- **Aging Rules:**
  - **Active (< 30 days):** Healthy selling cycle.
  - **Ageing (30 – 60 days):** Slowing down; monitor promotional push.
  - **Liquidation (60 – 90 days):** Clearance candidate; discount to recover manufacturing cost.
  - **Dead Stock (> 90 days):** Stuck capital; liquidate immediately to stop warehouse carrying bleed.

### Module 8: Returns & Quality Watch
- **Primary Use:** Audit why clothes are returning and inspect fabric/tailoring quality.
- **Workflow:**
  1. Log returned orders by channel, reason (Size/Fit, Defect, Fabric Quality), and condition.
  2. Track resaleable restocked items vs damaged liquidation items.
  3. Reverse courier costs are tracked to audit courier partner bills.

### Module 9: Logistics & Courier Watch
- **Primary Use:** Forward and reverse logistics expense tracking.
- **Workflow:** Monitor courier friction across Blue Dart, Delhivery, Shadowfax, or marketplace integrated shipping.

### Module 10: Factory Expenses & Overheads
- **Primary Use:** Record monthly fixed burn and daily factory expenses.
- **Workflow:**
  1. Set monthly factory salaries, premises rent, electricity, and admin bills.
  2. Log daily or ad-hoc expenses with customizable categories.
  3. Review the **Breakeven Volume Calculator** showing how many total garment pieces must be sold each month across all styles to pay off the factory burn.

### Module 11: Garment Style Catalog
- **Primary Use:** SKU master register.
- **Workflow:** View active, paused, and discontinued styles. Edit specifications or duplicate existing styles for new seasonal collections.

### Module 12: Master Settings & Channel Rate Directory
- **Primary Use:** Admin-only configuration.
- **Workflow:**
  1. Configure default factory rates (fabric, cutting, silai, packaging).
  2. Set global pricing multiplier ($2.0\times$) and target COGS limit ($20\%$).
  3. In the **Marketplace & Channel Rate Directory**, update referral cuts %, closing fees ₹, and expected return rates for Myntra, Amazon, Flipkart, Meesho, and Shopify.
  4. Click **Save Master Configuration** to commit changes to MongoDB.

---

## 6. Non-Tech Hindi-English Glossary for Garment Teams

| Term | Hindi / Factory Meaning | Technical / Accounting Meaning |
| :--- | :--- | :--- |
| **Kapda (Fabric)** | Suit ya tee banane me kitne meter kapda laga aur kya rate pada. | Raw Material / Primary Fabric Cost |
| **Silai / Karigar Rate** | Tailor ko per piece stitching charge kitna diya gaya. | Direct Labor / CMT Stitching Cost |
| **Trims** | Buttons, zip, label, dhaga, barcode tag ka kharcha. | Bill of Materials (BOM) Accessories |
| **COGS / Making Cost** | Kapda + Silai + Trims mila ke ek piece factory me kitne ka bana. | Total Cost of Goods Sold (Unit Direct Cost) |
| **20% Benchmark** | Agar ₹1,000 MRP hai toh making cost ₹200 ke andar honi chahiye. | Maximum allowable COGS ratio (20% of MRP) |
| **CM1 (Net Realisation)** | Discount aur Return provision hata ke, aur GST tax nikal ke bacha paisa. | Net Sales Revenue excluding GST |
| **CM2 (Gross Contribution)**| CM1 me se marketplace ka commission aur banayi ka kharcha nikal ke bacha hua paisa. | Contribution Margin covering direct unit costs |
| **CM3 (Pocket Cash)** | Courier kharcha aur Meta ad CAC nikal ke jo actual cash bank me bacha. | Net Unit In-Hand Pocket Profit |
| **Return Provision** | Maal bikne par jo 8%-30% return aane ka risk hota hai, uska advance deduction. | Refund Loss Reserve Provision |
| **Carrying Cost / Bleed** | Godown me unsold kapda pada rehne se jo interest aur kiraya lagta hai (18%/saal). | Inventory Financing & Holding Cost |
| **Dead Stock** | Jo batch 90 din se zyada godown me phas gaya ho aur capital block kar raha ho. | Obsolete / Zero-Velocity Inventory |

---

*Document generated for Atiq Studio & partner development teams. Confidential & Proprietary.*
