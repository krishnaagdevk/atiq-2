# Atiq CRM — Full Audit Report

> **Auditor:** Antigravity (AI)  
> **Date:** November 2026  
> **Codebase:** `c:\Users\hp\Desktop\famcare\proto-work\work\`  
> **Purpose:** Honest, plain-English audit of everything built vs everything promised. This report is for the developer to fix things — not to impress the client.

---

## EXECUTIVE SUMMARY

The core engine of the system is **solid and working**. The costing calculator, batch register, returns logger, and expense module all correctly save to MongoDB. The maths (CM1 → CM2 → CM3) is correctly implemented.

However, **7 out of 16 required features are either missing or only half-done**, there are **15+ hardcoded values** scattered through the code that should come from the database, and the UI has **several gaps** that would confuse a non-tech user.

---

## PART 1 — HARDCODED VALUES THAT MUST COME FROM DATABASE

These are values baked directly into the code that should be editable by the user. If Atiq's business changes, a developer has to manually edit code instead of just updating a setting.

| # | File & Line | What Is Hardcoded | What It Should Be |
|---|-------------|-------------------|-------------------|
| 1 | `AtiqCRMApp.tsx:69` | `products[0]?.sku \|\| "ATQ-TEE-001"` — fallback SKU code | Should show "No styles yet, add one first" empty state |
| 2 | `AtiqCRMApp.tsx:72-95` | All default form values (fabric rate 180, trims 24, cutting 18, etc.) | Should pull from `config.defaultFabricRate`, `config.defaultCutting`, etc. |
| 3 | `AtiqCRMApp.tsx:94` | `productionRunQty: 100` — batch size always defaults to 100 | Should be a configurable default in Settings |
| 4 | `AtiqCRMApp.tsx:99` | `BATCH-2026-` — year 2026 hardcoded in batch ID prefix | Should use `new Date().getFullYear()` dynamically |
| 5 | `AtiqCRMApp.tsx:100` | `products[0]?.sku \|\| "ATQ-TEE-001"` in batch form | Same as issue #1 |
| 6 | `AtiqCRMApp.tsx:117` | `refundAmount: 1499` — refund defaulted to ₹1499 | Should default to 0 or the product's MRP |
| 7 | `AtiqCRMApp.tsx:118` | `reverseLogisticsFee: 45` — reverse courier fee hardcoded | Should come from `config.defaultReverseLogisticsCost` |
| 8 | `AtiqCRMApp.tsx:194` | `marketplaces: ["Myntra", "Amazon", "Flipkart"]` — channels locked | Should come from a Marketplace config table (future feature) |
| 9 | `AtiqCRMApp.tsx:260` | `liquidationPrice: Math.round(unitCogs * 0.8)` — liquidation at 80% cost | Should be configurable; different categories may liquidate differently |
| 10 | `AtiqCRMApp.tsx:445` | `"Atiq Admin"` — username hardcoded in sidebar | Should come from user session / settings |
| 11 | `AtiqCRMApp.tsx:478` | `"Target COGS: 20% MRP"` — header badge shows hardcoded 20% | Should read from `config.defaultTargetCogsPct` |
| 12 | `AtiqCRMApp.tsx:506` | `"Welcome, Atiq."` — greeting name hardcoded | Should come from settings / user profile |
| 13 | `AtiqCRMApp.tsx:576` | `>45 days` — hardcoded "at risk" threshold | Should use `config.ageThresholdActive` |
| 14 | `AtiqCRMApp.tsx:590` | `0.18` — 18% annual carrying cost rate hardcoded | Should be a configurable field in Settings |
| 15 | `AtiqCRMApp.tsx:1586` | `"November 2026"` — month label in P&L report hardcoded | Should compute dynamically from current month/year |
| 16 | `types.ts:76` | Expense categories are a fixed TypeScript union | Cannot add "Courier Bill" or "Meta Ads" without editing code |
| 17 | `AtiqCRMApp.tsx:313` | `isRecurringMonthly: true` — all expenses saved as recurring | Should be a checkbox the user controls |

---

## PART 2 — FEATURE GAP ANALYSIS

Rating: ✅ Done | ⚠️ Partial | ❌ Missing

| # | Required Feature | Status | What's Present | What's Missing |
|---|-----------------|--------|---------------|----------------|
| 1 | **Dashboard Overview** | ✅ Done | 4 KPI cards, cost breakdown bar, margin waterfall, product benchmark table | Nothing critical missing |
| 2 | **SKU-wise Profit and Loss %** | ⚠️ Partial | P&L table shows SKU margin % as a badge | No bar chart or visual comparison. No ability to filter by date range |
| 3 | **Daily / Monthly / Yearly Reports** | ❌ Missing | No date filter anywhere. P&L shows all time only | Needs date range selector: "This month / Last month / This year" |
| 4 | **Daily / Monthly / Yearly Revenue** | ❌ Missing | No revenue tracking module at all | No revenue timeline, no "how much did we earn in October?" view |
| 5 | **Net Revenue** | ⚠️ Partial | CM1 shows net realisation per piece | No aggregate net revenue across all sales |
| 6 | **Net Profit (after overheads)** | ⚠️ Partial | P&L shows CM2 total minus overhead as a comparison | Does not calculate a final "Net Profit after all deductions" number |
| 7 | **COGS** | ✅ Done | Per-piece COGS in costing studio, benchmark table | Works correctly |
| 8 | **Overhead Costs** | ✅ Done | Kept separate as Atiq instructed, editable monthly | Works correctly |
| 9 | **Batch Management** | ✅ Done | Batch register, 4 KPIs, add batch form | Missing: edit batch, delete batch, search/filter |
| 10 | **Stock-Wise Overview (Top 100 Items)** | ❌ Missing | No dedicated stock view | No ranking by stock value, no visual top-100 by blocked capital |
| 11 | **SKU Management** | ⚠️ Partial | Style Catalog shows cards for each SKU | Missing: delete SKU, search/filter SKUs, change status (Paused/Discontinued) |
| 12 | **Expense Management** | ⚠️ Partial | Log expense, view history table | Missing: delete expense, edit expense, filter by month/category, expense totals |
| 13 | **Returns Management** | ⚠️ Partial | Log return, view history table | Missing: returns summary KPIs, filter by date/channel, delete return |
| 14 | **Logistics Management** | ❌ Missing | Logistics cost is an input field in Costing Studio | No dedicated logistics cost tracking module or courier-wise breakdown |
| 15 | **Liquidation Management** | ❌ Missing | Batch status can be set to "Liquidation" | No liquidation price calculator, no recovery % analysis, no liquidation action workflow |
| 16 | **Dead Stock Management** | ❌ Missing | Batch status can be "Dead stock" | No dedicated dead stock view, no write-off action, no alert for items stuck >90 days |
| 17 | **New Expense Categories** | ❌ Missing | 6 fixed categories in TypeScript type | User cannot create a new category like "Courier Bill" or "Meta Ads Budget" |

**Score: 5 fully done / 6 partial / 6 missing out of 17 features**

---

## PART 3 — UI / UX ISSUES (Severity Ranked)

### 🔴 HIGH PRIORITY — Confusing or Broken for Non-Tech User

| Issue | Where | Impact |
|-------|-------|--------|
| No empty state when no products exist | Costing Studio, Dashboard | On fresh install, the page shows broken defaults ("ATQ-TEE-001" ghost data) |
| No feedback when a save action fails | All save buttons | If MongoDB is down, user clicks "Save SKU Costing" and nothing happens (silent failure) |
| No delete for any record | Products, batches, returns, expenses | User cannot remove a test entry or a mistake. Data is permanent once added |
| "November 2026" month is hardcoded | P&L Reports tab | User thinks the report is for November only. Very confusing |
| `window.print()` as "Export Report" | P&L Reports tab | Print dialog is not a proper export. Very primitive for a business tool |
| Mobile sidebar has no backdrop click-to-close | Mobile layout | User gets "trapped" with the sidebar open on mobile |

### 🟡 MEDIUM PRIORITY — Annoying but Workable

| Issue | Where | Impact |
|-------|-------|--------|
| No search or filter on any table | All tables | When there are 50+ batches, there is no way to find one quickly |
| No edit mode for existing records | Batches, returns, expenses | Can only add, never correct a mistake |
| Costing Studio dashboard waterfall uses first product only | Dashboard | The "Margin Journey" card always shows the first SKU's data, not an aggregate |
| All expenses marked as recurring monthly | Expense logger | User has no choice to mark a one-off expense (e.g. machine repair) as non-recurring |
| Carrying cost bleed (18%/year) has no explanation | Dashboard KPI 4 | A non-tech user will not know what "Bleeding ₹X/mo" means or where 18% came from |
| No confirmation before navigating away from unsaved form changes | Costing Studio | User fills in full costing, clicks another tab by accident — data is lost |
| Sidebar navigation has no hover tooltips on mobile | Mobile nav | On mobile, icons are shown without text |

### 🟢 LOW PRIORITY — Polish / Nice-to-Have

| Issue | Where | Impact |
|-------|-------|--------|
| Toast shows same dark style for success and error | All actions | Should be green for success, red for error so user knows what happened |
| SKU catalog cards are not sortable or filterable | Style Catalog tab | Cannot sort by CM3 (most profitable first) |
| "Connected Live" always shows green even when MongoDB is down | Sidebar footer | Misleading — shows green when actually running in memory fallback mode |
| No ability to bulk import products from Excel | All tabs | Client mentioned Excel import in meeting — not addressed at all |
| Settings does not populate defaults into new Costing forms | Costing Studio | Changing default fabric rate in Settings does not affect the "New Style" form |

---

## PART 4 — BACKEND GAPS

| Gap | Current State | Recommended Fix |
|----|--------------|----------------|
| `ExpenseRecord.category` is a TypeScript union | Only 6 categories possible | Add `ExpenseCategory` collection to MongoDB; allow CRUD |
| No `SaleRecord` model | Revenue tracking not possible | Add `SaleRecord` model with date, SKU, qty, channel, actual sale price |
| No date fields on batches | Cannot filter by production month | Add `createdAt` timestamp to `BatchModel` |
| No `deleteProduct`, `deleteBatch`, `deleteReturn`, `deleteExpense` actions | Records are permanent | Add delete server actions with Mongoose `deleteOne` |
| `marketplaces` field on Product is always `["Myntra", "Amazon", "Flipkart"]` | Hardcoded in `handleSaveProduct` | Allow user to select which channels a product is listed on |
| `isRecurringMonthly` always saved as `true` | All expenses marked recurring | Expose as form checkbox |
| No `LogisticRecord` model | No logistics cost tracking | Add logistics model for per-shipment courier tracking |

---

## PART 5 — WHAT IS WORKING WELL (Keep These)

- ✅ The CM1 → CM2 → CM3 waterfall formula is **correctly implemented** in `formulas.ts`
- ✅ MongoDB Atlas integration with memory fallback works correctly
- ✅ Historical batch COGS is **locked at save time** (correctly implements the client's requirement)
- ✅ Overheads are **kept completely separate** from product contribution margin (correctly implements client requirement)
- ✅ The costing studio is **the right design** — calculator feel, live results on right panel
- ✅ Dark navy + gold color scheme is clean and matches the brief
- ✅ Tailwind mobile responsive grid layouts are correct
- ✅ Next.js Server Actions pattern is the right architecture for this

---

## RECOMMENDED PRIORITY FIX LIST

**Do these first (before showing client):**

1. Fix: Use `config.defaultTargetCogsPct` in the header badge (line 478) — 5 minutes
2. Fix: Compute month/year dynamically in P&L (line 1586) — 5 minutes
3. Fix: Pull defaulting form values from `config` object — 30 minutes
4. Fix: Use current year in batch ID prefix — 2 minutes
5. Add: Empty state when no products exist — 20 minutes
6. Add: Delete buttons for batches, returns, expenses (with confirm dialog) — 2 hours
7. Add: Daily/Monthly/Yearly date filter tab on P&L page — 3 hours
8. Add: Net Revenue total (sum of batches × net sold × product CM1) — 2 hours
9. Add: Custom expense categories (simple text field + DB save) — 3 hours
10. Add: Dead Stock & Liquidation management sub-view in Batch tab — 4 hours

**Do these second (before full launch):**

11. Add: Stock-wise overview Top 100 items page
12. Add: Logistics tracking module
13. Add: Date-stamped SaleRecord model for revenue timeline
14. Add: Real-time DB status indicator (not always "Connected Live" green)
