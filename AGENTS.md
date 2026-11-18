# AGENTS.md — Atiq CRM: AI Agent Context File

> **READ THIS ENTIRE FILE BEFORE TOUCHING ANY CODE.**  
> This file tells you what the project is, what the business rules are, what NOT to hardcode, and what has already been built vs what is still missing.

---

## 1. WHAT IS THIS PROJECT?

**Atiq CRM** is a Garment Costing & Profitability System for a fashion brand owner named Atiq who sells on Myntra, Amazon, and Flipkart.

**The client's problem:** He has been losing money on batches (once lost ₹1 lakh in stuck inventory) because he had no system to check whether a garment would be profitable BEFORE making it. He was running on a fixed-formula Excel sheet.

**What this system does:**
1. Calculates full garment making cost (COGS) per piece — fabric + cutting + stitching + packaging
2. Runs the CM1 → CM2 → CM3 waterfall to show net cash per sold piece
3. Tracks production batches and flags ageing/dead stock before it becomes a loss
4. Logs customer returns and their cost
5. Tracks factory overheads SEPARATELY (critical — see Business Rules below)
6. Shows P&L per SKU and benchmarks COGS against the 20% MRP target

**What this is NOT:**
- Not an order management system
- Not an inventory ERP
- Not a sales platform integration
- Not a website/branding tool
- NOT a replica of "MarginOS" — the UI design is different

---

## 2. WORKING DIRECTORY

```
c:\Users\hp\Desktop\famcare\proto-work\work\
```

**All project files must be in this directory. Never write to `proto-work/` root or Desktop.**

---

## 3. TECH STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.4.6 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Database | MongoDB Atlas | Cloud |
| ORM | Mongoose | 8.x |
| Package Manager | pnpm | 12.6.0 |
| Icons | Lucide React | latest |
| Build | Turbopack | (bundled with Next.js 16) |

**Run dev server:**
```bash
cd c:\Users\hp\Desktop\famcare\proto-work\work
pnpm dev
# Opens at http://localhost:3000
```

**Build for production:**
```bash
pnpm run build
# Must exit with code 0, zero TypeScript errors
```

---

## 4. ENVIRONMENT VARIABLES

File: `work/.env.local`

```
MONGODB_URI=<atlas connection string>
```

Do NOT commit this file. The MongoDB database name is `atiq_crm`.

If MongoDB is unreachable, the app falls back to in-memory seed data automatically (`src/lib/seed.ts`). The user will NOT see an error — the app still works with demo data.

---

## 5. FILE STRUCTURE

```
work/
├── .env.local                   # MongoDB URI (never commit)
├── next.config.ts               # Next.js config (keep clean, no cacheComponents)
├── AUDIT_REPORT.md              # Full audit of what is broken / missing
├── DESIGN.md                    # ASCII art wireframes for all 10 screens
├── AGENTS.md                    # This file — read before coding
│
└── src/
    ├── app/
    │   ├── layout.tsx           # Root layout, Tailwind, fonts
    │   ├── page.tsx             # Server component: loads data, renders AtiqCRMApp
    │   └── globals.css          # CSS tokens and base styles
    │
    ├── components/
    │   └── AtiqCRMApp.tsx       # 2328-line single client component
    │                              Contains ALL 8 modules as conditional renders
    │                              TODO: Split into separate files per module
    │
    ├── actions/
    │   └── crm.ts               # Next.js Server Actions ("use server")
    │                              getInitialData, saveProductAction, addBatchAction,
    │                              addReturnAction, addExpenseAction, saveConfigAction
    │                              TODO: Add deleteProductAction, deleteExpenseAction, etc.
    │
    ├── lib/
    │   ├── types.ts             # TypeScript interfaces for all data models
    │   ├── formulas.ts          # calculateGarmentEconomics(), formatINR(), formatPct()
    │   ├── seed.ts              # Demo seed data (8 products, 5 batches, 4 returns, 4 expenses)
    │   └── db.ts                # MongoDB connection with retry + memory fallback
    │
    └── models/
        ├── Product.ts           # Mongoose schema for ProductCosting
        ├── Batch.ts             # Mongoose schema for ProductionBatch
        ├── Return.ts            # Mongoose schema for ReturnRecord
        └── Expense.ts           # Mongoose schemas for ExpenseRecord + OverheadConfigModel
```

---

## 6. DATA MODELS

### ProductCosting (Product.ts / types.ts)
```typescript
{
  sku: string           // e.g. "ATQ-TEE-001" — user-defined unique code
  name: string
  category: "Westernwear" | "Homewear" | "Ethnicwear" | "Kidswear" | "Accessories"
  marketplaces: string[] // channels it sells on (currently hardcoded, see issues)

  // Bill of Materials (per piece)
  fabricQty: number     // metres of fabric
  fabricRate: number    // per metre
  trimsCost: number     // buttons, zippers, labels
  cuttingCost: number
  stitchingCost: number
  finishingCost: number
  packagingCost: number
  otherCost: number
  totalCogs: number     // AUTO-COMPUTED by calculateGarmentEconomics()

  // Commercial assumptions
  mrp: number
  discountPct: number
  gstPct: number
  marketplaceCommissionPct: number
  logisticsCost: number
  reverseLogisticsCost: number
  marketingCost: number  // CAC per sold unit (Meta ads)
  pricingMultiplier: number
  targetCogsPct: number  // should come from config
  expectedReturnsPct: number

  // Calculated economics (AUTO-COMPUTED, never manually set)
  recommendedMrp: number
  cogsPct: number        // (totalCogs / mrp) * 100
  cm1: number            // Net realisation ex-GST
  cm2: number            // CM1 - commission - COGS
  cm3: number            // CM2 - logistics - marketing
  status: "Active" | "Paused" | "Discontinued"
}
```

### ProductionBatch (Batch.ts)
```typescript
{
  id: string             // e.g. "BATCH-2026-001"
  sku: string
  productName: string
  producedQty: number
  grossSoldQty: number
  returnedQty: number
  netSoldQty: number     // grossSoldQty - returnedQty
  onHandQty: number      // producedQty - netSoldQty
  ageDays: number

  unitCogs: number       // FROZEN at creation. NEVER update this.
  blockedCapital: number // onHandQty * unitCogs

  status: "Active" | "Ageing" | "Liquidation" | "Dead stock"
  liquidationPrice?: number
  productionDate: string
}
```

### ReturnRecord (Return.ts)
```typescript
{
  id: string
  orderId?: string
  marketplace: "Myntra" | "Amazon" | "Flipkart" | "Shopify" | "Offline"
  sku: string
  batchId?: string
  returnQty: number
  reason: "Size / Fit Issue" | "Fabric Quality / Defect" | "Not as Described" | "Changed Mind" | "RTO Undelivered"
  condition: "Resaleable (Restocked)" | "Minor Defect (Repairable)" | "Damaged (Liquidation)"
  refundAmount: number
  reverseLogisticsFee: number
  date: string
}
```

### ExpenseRecord (Expense.ts)
```typescript
{
  id: string
  category: "Factory Salaries" | "Premises Rent" | "Electricity & Power" | "Admin & Office" | "Machinery & Repair" | "Other"
  // MISSING FEATURE: Custom categories — this is a hardcoded enum.
  // Future: Create ExpenseCategory collection in MongoDB
  amount: number
  date: string
  vendor?: string
  description: string
  isRecurringMonthly: boolean  // Currently always saved as true — fix this
}
```

### BusinessOverheadConfig (Expense.ts — OverheadConfigModel)
```typescript
{
  monthlySalary: number
  monthlyRent: number
  monthlyElectricity: number
  monthlyOther: number

  defaultFabricRate: number
  defaultCutting: number
  defaultStitching: number
  defaultFinishing: number
  defaultPackaging: number
  defaultPricingMultiplier: number
  defaultTargetCogsPct: number      // The 20% benchmark — READ FROM HERE, never hardcode
  defaultMarketplaceCommission: number
  defaultGstPct: number
  defaultLogisticsCost: number
  defaultReverseLogisticsCost: number
  defaultMarketingCost: number
  defaultExpectedReturnsPct: number

  ageThresholdActive: number      // < this = Active (days)
  ageThresholdAgeing: number
  ageThresholdLiquidation: number
  ageThresholdDead: number        // > this = Dead stock
}
```

---

## 7. THE CM FORMULA (Core Business Logic — Never Break This)

**Implemented in `src/lib/formulas.ts` → `calculateGarmentEconomics()`**

```
COGS = fabric(qty × rate) + trims + cutting + stitching + finishing + packaging + other

After-discount price = MRP × (1 - discountPct/100)
After-returns adj.   = after-discount × (1 - expectedReturnsPct/100)
GST deduction        = after-returns × (gstPct / (100 + gstPct))
CM1 (Net Realisation ex-GST) = after-returns - GST deduction

Marketplace commission = CM1 × (marketplaceCommissionPct/100)
CM2 (Gross Contribution) = CM1 - commission - COGS

Logistics total = logisticsCost + (reverseLogisticsCost × expectedReturnsPct/100)
CM3 (Net Pocket Cash) = CM2 - totalLogistics - marketingCost

Recommended MRP = COGS × pricingMultiplier
COGS % of MRP   = (COGS / MRP) × 100
```

---

## 8. IRON-CLAD BUSINESS RULES (NEVER BREAK THESE)

### Rule 1: Historical COGS Is Frozen
When a batch is created, `unitCogs` is locked to the product's COGS at that point.
If fabric rates go up later, old batches MUST NOT recalculate.

### Rule 2: Overheads STAY SEPARATE
Salary, rent, electricity are NEVER added to per-piece COGS.
CM3 is per-piece margin BEFORE fixed overheads.
Net Profit = sum of all CM2 across sold units - total monthly overheads.

### Rule 3: Config Changes Are Prospective Only
When admin changes `defaultFabricRate` in Settings, it pre-fills NEW costing forms only.
Saved products NEVER get retroactively recalculated.

### Rule 4: 20% COGS Target Is Configurable
The 20% benchmark is NOT hardcoded. It lives in `config.defaultTargetCogsPct`.
Any UI badge showing "Target COGS: 20%" MUST read from this config value.

---

## 9. WHAT IS HARDCODED (MUST FIX BEFORE LAUNCH)

| File:Line | Hardcoded Value | Replace With |
|-----------|----------------|-------------|
| AtiqCRMApp.tsx:94 | `productionRunQty: 100` | Configurable default |
| AtiqCRMApp.tsx:99 | `BATCH-2026-` | `BATCH-${new Date().getFullYear()}-` |
| AtiqCRMApp.tsx:117 | `refundAmount: 1499` | Should default to 0 |
| AtiqCRMApp.tsx:118 | `reverseLogisticsFee: 45` | `config.defaultReverseLogisticsCost` |
| AtiqCRMApp.tsx:194 | `["Myntra", "Amazon", "Flipkart"]` | Configurable channels |
| AtiqCRMApp.tsx:260 | `Math.round(unitCogs * 0.8)` | Configurable liquidation % |
| AtiqCRMApp.tsx:445 | `"Atiq Admin"` | Business name from settings |
| AtiqCRMApp.tsx:478 | `"Target COGS: 20% MRP"` | `config.defaultTargetCogsPct` |
| AtiqCRMApp.tsx:506 | `"Welcome, Atiq."` | Business owner name from settings |
| AtiqCRMApp.tsx:576 | `>45 days` text | `config.ageThresholdActive` |
| AtiqCRMApp.tsx:590 | `0.18` (carrying cost rate) | Add `defaultCarryingCostPct` to config schema |
| AtiqCRMApp.tsx:1586 | `"November 2026"` | `new Date().toLocaleString('default',{month:'long',year:'numeric'})` |
| AtiqCRMApp.tsx:313 | `isRecurringMonthly: true` | Expose as form checkbox |
| types.ts:76 | Expense category union type | MongoDB ExpenseCategory collection |

---

## 10. MISSING FEATURES (DO NOT MARK AS DONE UNLESS FULLY IMPLEMENTED)

| Feature | Status | Notes |
|---------|--------|-------|
| Daily / Monthly / Yearly Revenue view | Missing | Needs SaleRecord model + revenue page |
| Date filter on P&L Reports | Missing | Add time range tabs to profitability module |
| Net Profit final calculation | Partial | Shows individually but no combined Net Profit number |
| Stock-Wise Overview (Top 100 by value) | Missing | New module needed |
| Logistics Management module | Missing | Currently just an input field |
| Liquidation Management | Missing | Needs price calculator + action workflow |
| Dead Stock Management | Missing | Needs dedicated view + write-off action |
| Custom Expense Categories | Missing | Currently fixed TypeScript union enum |
| Delete records (products, batches, returns, expenses) | Missing | No delete server action |
| Edit existing records | Missing | Only add works |
| Search / filter on all tables | Missing | No search box exists |
| Returns KPI summary cards | Missing | Returns tab has no summary stats |
| SKU status change (Paused/Discontinued) | Missing | No action implemented |
| Real DB status indicator in sidebar | Missing | Always shows "Connected Live" |

---

## 11. MODULES MAP

| `activeTab` value | Display Name | Description |
|------------------|-------------|-------------|
| `dashboard` | Overview | Business health KPIs, cost chart, waterfall, benchmark table |
| `costing` | Costing Studio | Full BOM calculator, live CM1/CM2/CM3, batch breakeven |
| `batches` | Batch & Stock | Production run register, ageing/dead stock alerts |
| `profitability` | Profit & Loss | SKU P&L table, company net position |
| `returns` | Returns Watch | Log and view customer returns |
| `expenses` | Factory Overheads | Fixed overhead inputs + ad-hoc expense ledger |
| `skus` | Style Catalog | SKU card grid with quick costing links |
| `settings` | Cost Settings | Config defaults for new costings |

---

## 12. DESIGN SYSTEM

**Colors:**
```
Sidebar bg:   #111C2D  dark navy
Gold accent:  #C58B4B
Page bg:      #F5F6F8
Card bg:      #FFFFFF
Text primary: #17202D
Text muted:   #748092
Border:       #E7EAF0
Success:      #16835D
Danger:       #C44E4E
Info:         #2563EB
```

**UI Language Rules:**
- "Making Cost" not "COGS" in user labels
- "Platform Fee" not "Commission"
- "Pocket Cash" not "CM3" in summaries
- "pieces" or "pcs" not "units"
- Use Rs symbol for rupees
- "Kapda" for fabric in hints
- "Silai" for stitching in hints

---

## 13. CODING CONVENTIONS

1. Server Actions in `src/actions/crm.ts` — always `"use server"`, always try/catch, return `{ success: boolean }`
2. Client Component — `"use client"` at top of AtiqCRMApp.tsx
3. Types in `src/lib/types.ts` — define interfaces there, not inline
4. Formulas in `src/lib/formulas.ts` — business math never in components
5. No inline `any` — use proper TypeScript types
6. No `window.alert()` — use `showToast()`
7. Tailwind only for styling
8. No git push — all changes stay local unless user says "generate PR"

---

## 14. KEY FUNCTIONS QUICK REFERENCE

```typescript
// Format Indian Rupees
formatINR(1240.5)         // "Rs.1,240"
formatINR(1240.5, true)   // "Rs.1.24k" compact

// Format percentage
formatPct(16.3)           // "16.3%"

// Full economics calculation
const eco = calculateGarmentEconomics({ fabricQty, fabricRate, ...all inputs });
// Returns: { totalCogs, cm1, cm2, cm3, cogsPct, recommendedMrp, isCogsWithinTarget, ... }
```

---

## 15. KNOWN INTENTIONAL DECISIONS

1. **Single TSX file (2328 lines):** Shipped fast. Should be split eventually but works fine.
2. **Memory fallback:** App works without MongoDB using seed data.
3. **No authentication:** Access control is a future feature.
4. **No real-time sync:** React useState only. Two browsers will see stale data until refresh.
5. **Age in days is manual:** User enters ageDays manually. Auto-compute from productionDate is a future improvement.

---

## 16. RECENT UPDATES & CHANGELOG

### Config-Controlled Garment Categories & Trims Specification (Nov 2026)
- **Config-Controlled Garment Categories**:
  - `BusinessOverheadConfig` in `src/lib/types.ts` updated with `garmentCategories?: string[]` and `fabricTypes?: string[]`.
  - MongoDB `OverheadConfigSchema` (`src/models/Expense.ts`) and `initialConfig` (`src/lib/seed.ts`) now store dynamic garment categories.
  - Mongoose `ProductSchema` (`src/models/Product.ts`) updated from static enum to string category to allow custom categories without validation errors.
  - Added Server Actions `addGarmentCategoryAction` and `deleteGarmentCategoryAction` in `src/actions/crm.ts`.
  - In `AtiqCRMApp.tsx`, added Garment Categories Master Directory in Settings module, and dynamic Category select dropdown with "+ Add New" quick modal in Costing Studio.
- **Boss Rohit's Trims & Accessories Specific Section**:
  - Added dedicated `TrimsBreakdown` interface in `src/lib/types.ts`.
  - Integrated in Section 2 (Making Cost per Piece / COGS) of Costing Studio:
    1. **Fabric Dropdown (Kapda Selection)** with benchmark rates (100% Cotton, Rayon 14kg, Georgette, Polyester Crepe, Linen Blend, Denim, Silk, Lycra).
    2. **Dedicated Trims & Accessories Specification card**:
       - Trims preset dropdown (T-Shirt, Shirt/Kurta, Western Dress, Blazer, Trousers, Ethnic Kurti, Custom).
       - **Buttons** (₹/pc).
       - **Zippers** with explicit dropdown between **CFC Zipper** and **Concealed Zipper** (plus None / Metal) and rate.
       - **Fusing & Lining (Astra)** (₹/pc).
       - **Shoulder Pad** (dropdown: None, Standard Poly Pad ₹8, Molded Tailored Pad ₹15, Custom) and cost.
       - **Eye Hook** (kaj-hook / clasps) (₹/pc).
       - **Brand Labels, Wash Care & Thread** (₹/pc).
       - Auto-sums components directly into `costForm.trimsCost` and COGS economics with optional manual override.
       - Persists `trimsDetail` on product save and loads on SKU selection.

### Deployment Build Fix for MongoDB Connection
- In `src/lib/db.ts`:
  - Added `.catch()` directly on `cached.promise` so unhandled promise rejections during `mongoose.connect()` never crash the server or build workers.
  - Checked `process.env.MONGODB_URI` before initiating connections; gracefully falls back to memory demo mode instead of trying `localhost:27017` on build servers.
  - Reduced timeout to 5000ms.
- In `src/app/page.tsx`:
  - Added `export const dynamic = "force-dynamic";` so Next.js treats the database-backed page as dynamic, preventing Next.js from running MongoDB connections during the static page prerendering phase at build time.

### Prototype Normalization, Redirectable Cards & Dead Stock Ageing Policy
- **Redirectable & Bidirectional Dashboard Cards**:
  - The top 4 Overview KPI flashcards are now fully interactive with cursor-pointer, hover transitions, and redirect footer pills:
    1. **Styles Costed** (`products.length`) -> redirects to `costing` (Costing Studio).
    2. **Average Making Cost / MRP** (`avgCogsPct`) -> redirects to `costing` (Target Economics).
    3. **Warehouse Stock On-Hand** (`totalStockOnHand`) -> redirects to `stock_top` (Stock Valuation).
    4. **Blocked Capital at Cost** (`totalBlockedCapital`) -> redirects to `liquidation` (Dead Stock Manager) with direct access to Dead Stock Ageing Policy.
  - Added "← Back to Dashboard Overview" navigation across all sub-modules (`costing`, `revenue`, `profitability`, `stock_top`, `batches`, `liquidation`, `returns`, `expenses`, `skus`, `settings`) and an interactive header breadcrumb button to provide bidirectional navigation.
- **Product Category Standardization (Purged Kidswear & Hardcoded for Prototype)**:
  - Standardized the core garment categories to the 6 women's apparel lines: `["Dresses", "Tops & Shirts", "Trousers & Pants", "Co-ord Sets", "Blazers & Jackets", "Jumpsuits"]`.
  - Exported `GARMENT_CATEGORIES` and `GarmentCategory` type in `src/lib/types.ts`.
  - Updated `src/models/Product.ts` and `src/models/Expense.ts` schemas.
  - Updated `src/lib/seed.ts` products, batches, sales, and returns to remove all references to old kidswear items (`ATQ-KD-022`, `Baby Romper`) and replace with realistic formal workwear (`ATQ-CRD-022` Linen Blend Trouser Co-ord Set, `ATQ-DRS-014` Crepe A-Line Midi Dress, etc.).
  - Hardcoded garment categories in Costing Studio dropdown and removed ad-hoc category additions to protect prototype data integrity.
  - In Settings, replaced dynamic creation pills with verified Master Taxonomy cards and an MIS specification note.
- **Dead Stock 'ℹ️' Info Icon & Classification Modal**:
  - Built `renderBatchStatusBadge` helper attaching interactive `ℹ️` trigger buttons to status badges across `stock_top`, `batches`, and `liquidation`.
  - Added dedicated `DeadStockInfoModal` explaining the 4 age stages:
    1. **Active Stock** (< 30 days): Fresh production in peak sales window. Zero capital risk.
    2. **Ageing Stock** (30–60 days): Velocity slowing. Triggers Meta ad push or promotional discount.
    3. **Liquidation Stage** (60–90 days): High capital risk. Activates Recovery Calculator to recover unit COGS.
    4. **Dead Stock** (> 90 days): Stagnant inventory bleeding carrying cost (~18% p.a.). Mandatory flash sale or lot salvage.

- **UI Card Alignment & Normalization**:
  - Balanced Dashboard middle row (Cost Structure vs Margin Waterfall) with matching header heights and aligned footer bars.
  - Equalized Settings side-by-side cards: "Default Factory Rates" (6 inputs) and "Commercial Multipliers & Benchmarks" (6 inputs) with `items-stretch` and `h-full flex flex-col justify-between` to ensure identical rectangular proportions.

### Config-Controlled Garment Categories & Trims Specification (Boss Rohit Rawat Spec) (November 2026)
- **Garment Categories Config Control**:
  - `garmentCategoriesList` in `src/components/AtiqCRMApp.tsx` is now dynamically backed by `config.garmentCategories` with fallback to standard categories `["Dresses", "Tops & Shirts", "Trousers & Pants", "Co-ord Sets", "Blazers & Jackets", "Jumpsuits"]`.
  - Added full configuration manager under Settings tab (`activeTab === "settings"`):
    - Shows all active categories as removable tag chips.
    - Added inline form with `+ Add Category` invoking `addGarmentCategoryAction`.
    - Added delete button invoking `deleteGarmentCategoryAction`.
    - Added "Reset to Power Sutra Standard 6" invoking `saveConfigAction`.
    - Real-time reactivity: added or removed categories immediately update the Costing Studio and all product filters without page refresh.
- **Dedicated Trims & Accessories Specification Section & Dropdown**:
  - Implemented exact garment specification requested by Boss Rohit Rawat:
    1. **Primary Dropdown (`Trims Type (Dropdown)`)**: Matches `Fabric Type (Dropdown)` in layout and structure, pre-populating preset benchmarks (`Dresses`, `Tops & Shirts`, `Trousers & Pants`, `Co-ord Sets`, `Blazers & Jackets`, `Jumpsuits`, `Minimal / Basic`, `Custom`).
    2. **Zippers (CFC vs Concealed)**: Standardized into continuous coil **CFC Zippers** (₹8) for pants/outerwear and invisible **Concealed Zippers** (₹10) for dresses/skirts with type dropdown and rate input.
    3. **Buttons**: Placket, cuff or ornamental buttons.
    4. **Fusing & Lining**: Collar/cuff bukram and astra inner lining.
    5. **Shoulder Pad**: Standard Poly vs Molded Tailored padding for structured outerwear.
    6. **Eye Hook & Clasps**: Pant hooks & bar, dress eyelets, and kaj-hook closures.
    7. **Labels, Tags & Thread**: Woven neck label, wash care, tag & stitching thread.
  - Linked Garment Category selector to automatically pre-select the matching trims preset on category change.
  - Added reference cards in Settings and Costing Studio explaining the trims specifications.
- **Recovery Input Polish**:
  - Cleaned Target Recovery Percentage input in Liquidation Calculator to a clean, standardized text field.
