# DESIGN.md — Atiq CRM Screen Specifications
# For AI Agent: "Build the UI exactly as drawn below. Do NOT deviate."

> **System:** Atiq Garment Costing & Profitability CRM  
> **Stack:** Next.js + Tailwind CSS  
> **Design Rule:** Dark navy sidebar `#111C2D` | Gold accent `#C58B4B` | White cards | Clean, executive SaaS look  
> **User:** Non-tech garment business owner. All labels in plain Hindi-English business language.  
> **Important:** Overheads MUST stay separate from product CM. Historical batch costs MUST be read-only once saved.

---

## GLOBAL SHELL (All Pages)

```
+------------------------------------------------------------------+
| SIDEBAR (w-64, bg #111C2D, fixed on desktop, drawer on mobile)  |
|  +----------------------------------------------+               |
|  |  [A]  ATIQ STUDIO           [X close mobile] |               |
|  |       Cost & Margin CRM                      |               |
|  +----------------------------------------------+               |
|  GARMENT OPERATIONS                                              |
|  [icon] Overview          [Pulse badge]                          |
|  [icon] Costing Studio    [P0 Core badge]                        |
|  [icon] Batch & Stock     [N Runs badge]                         |
|  [icon] Profit & Loss     [Reports badge]                        |
|  [icon] Returns Watch     [N Logs badge]                         |
|  [icon] Factory Expenses  [Burn badge]                           |
|  [icon] Style Catalog     [N SKUs badge]                         |
|  [icon] Settings          [Admin badge]                          |
|                                                                  |
|  --bottom--                                                      |
|  [A]  Atiq Admin                                                 |
|       [•] DB Connected / [!] Offline (shows real status)         |
+------------------------------------------------------------------+

MAIN AREA
+-------------------------------------------------+
| TOPBAR (bg white, h-16, sticky)                 |
| [≡ menu] Studio / {Active Tab Name}    [Target COGS: 20%][+ New] |
+-------------------------------------------------+
| PAGE CONTENT (p-8, max-w-7xl, scrollable)       |
|   {Module renders here}                         |
+-------------------------------------------------+
```

---

## SCREEN 1: OVERVIEW (Dashboard)

**Purpose:** First screen after login. Shows business health at a glance — are we profitable, do we have stuck stock, what is our average COGS?

```
OVERVIEW
========
Garment Business Health Pulse
"Good morning, Atiq. Here is your cost & stock situation."
                           [Check Stock Risk] [+ Cost New Style]

TOP KPIs (4 cards, responsive grid: 1 col mobile → 4 col desktop)
+------------------+  +------------------+  +------------------+  +------------------+
| Styles Costed    |  | Avg COGS / MRP   |  | Stock On-Hand    |  | Blocked Capital  |
| [shirt icon]     |  | [%  icon]        |  | [layers icon]    |  | [building icon]  |
|                  |  |                  |  |                  |  |                  |
|      8           |  |   17.3% (green)  |  |   312 pcs        |  |  ₹1,24,800       |
|                  |  |  OR              |  |                  |  |  (red)           |
| Active Catalog   |  |   28.1% (red ⚠) |  | 80 pcs at risk   |  | Bleeds ₹1,872/mo |
| ready for sample |  | ✓ Meets target   |  | (>45 days)       |  | at 18% /yr rate  |
+------------------+  +------------------+  +------------------+  +------------------+
NOTE: "45 days" and "18%" must come from config settings, not hardcoded.
NOTE: "Bleeds X/mo" needs a small tooltip "?" explaining what this means.

MID ROW (2 cards side-by-side, equal height)
+----------------------------------+  +----------------------------------+
| COST STRUCTURE: {SKU name}       |  | MONEY JOURNEY (Waterfall)        |
| COGS: ₹240                       |  | Per Sold Piece                   |
|                                  |  |                                  |
| Fabric (Kapda)   ₹243   [====  ] |  | MRP Label          ₹1,499        |
| Trims & Buttons  ₹24    [=    ]  |  | ─────────────────────────────    |
| Cutting          ₹18    [=    ]  |  | CM1: Net Realisation ₹1,021 (green)|
| Stitching/Silai  ₹42    [==   ]  |  | ─────────────────────────────    |
| Finishing & QC   ₹12    [=    ]  |  | CM2: Gross Contrib.  ₹398  (blue)|
| Packaging & Bag  ₹22    [=    ]  |  | ─────────────────────────────    |
|                                  |  | CM3: Pocket Cash    ₹288  [dark] |
| ── Atiq's 20% ceiling for ₹1499: Max ₹299.80                           |
+----------------------------------+  +----------------------------------+
NOTE: Dropdown to change which SKU the cost breakdown shows.
NOTE: Waterfall must reference the same selected SKU.

PRODUCT BENCHMARK TABLE (full width card)
+--------------------------------------------------------------------+
| Product Economics & 20% COGS Benchmark Check                       |
| Garments with COGS > 20% of MRP risk loss after platform fees.     |
|                               Showing 8 registered styles          |
|                                                                     |
| Style / SKU  | Category    | COGS  | MRP    | COGS% | CM3   | Status |
|--------------|-------------|-------|--------|-------|-------|--------|
| ATQ-TEE-001  | Westernwear | ₹240  | ₹1,499 | 16%   | ₹288  | ✓ Safe |
| ATQ-KUR-003  | Ethnicwear  | ₹380  | ₹1,199 | 31%⚠  | -₹42  | ⚠ Risk |
|  ...                                                                |
| [Search box] [Filter by category dropdown]  [Open Calculator →]    |
+--------------------------------------------------------------------+
```

---

## SCREEN 2: COSTING STUDIO

**Purpose:** The main costing calculator. Enter all costs for a garment, see live CM1/CM2/CM3 results instantly.

```
COSTING STUDIO
==============
P0 Core · Garment Costing Engine
"Test sample fabric cost and batch economics BEFORE cutting fabric."

[Select SKU dropdown ▼] [Save SKU Costing button]

LEFT PANEL (7/12 cols)              RIGHT PANEL (5/12 cols, sticky)
+-----------------------------+     +-------------------------------+
| 1. GARMENT STYLE IDENTITY   |     | UNIT COST VERDICT             |
| ─────────────────────────── |     | ─────────────────────────────  |
| SKU Code [ATQ-TEE-001    ]  |     |          ₹240.00              |
| Product Name [             ]|     |  [✓ Within 20% Target]        |
| Category [Westernwear   ▼] |     |  Batch of 100 pcs = ₹24,000   |
| Production Run [100      ]  |     |                               |
| Pricing Multiplier [2.0x ]  |     | Recommended MRP (2×):  ₹480  |
|                             |     | Actual MRP:           ₹1,499  |
| 2. MAKING COST / PIECE      |     | COGS % of MRP:          16%   |
| ─────────────────────────── |     |                               |
| Fabric Used (Metres) [1.35] |     | Minimum to sell (breakeven):  |
| Fabric Rate ₹/m    [180  ]  |     | 54 pcs out of 100             |
|   = ₹243 calculated live   |     |                               |
| Trims & Buttons   [24    ]  |     +-------------------------------+
| Cutting           [18    ]  |     +-------------------------------+
| Stitching/Silai   [42    ]  |     | MONEY JOURNEY (Waterfall)     |
| Finishing & QC    [12    ]  |     | ─────────────────────────────  |
| Packaging & Bag   [14    ]  |     | MRP Label         ₹1,499      |
| Washing / Other   [8     ]  |     | Less: Discount 10%  -₹150     |
|                             |     | Less: Returns 8%    -₹107     |
| Total COGS:        ₹361    |     | Less: GST 5%        -₹62      |
|                             |     | ─────────────────────         |
| 3. SELLING DEDUCTIONS       |     | CM1 Net Realisation ₹1,021    |
| ─────────────────────────── |     | Less: Platform 22%  -₹224     |
| MRP Tag (₹)      [1499   ]  |     | Less: COGS          -₹361     |
| Discount Given % [10     ]  |     | ─────────────────────         |
| Expected Returns % [8    ]  |     | CM2 Gross Contrib.  ₹398  (blue)
|   "Homewear avg ~30%"       |     | Less: Courier       -₹65      |
| Marketplace Comm% [22.5  ]  |     | Less: Meta Ad       -₹45      |
|   "Myntra 22.5%"            |     | ─────────────────────         |
| Forward Courier (₹)[65  ]  |     | CM3 Pocket Cash     ₹288 ✅   |
| Marketing/Meta (₹)[45   ]  |     |                               |
| GST Rate %        [5     ]  |     | Fixed overheads kept separate |
+-----------------------------+     +-------------------------------+
```

---

## SCREEN 3: BATCH & STOCK REGISTER

**Purpose:** Track every production run. See how many pieces are sold, how many are stuck, and how much money is locked in unsold inventory.

```
BATCH & STOCK REGISTER
======================
"Prevents another ₹1 Lakh stuck in warehouse situation."

4 KPI CARDS
+------------------+  +------------------+  +------------------+  +------------------+
| Total Produced   |  | Net Sold to Cust.|  | On Hand (Unsold) |  | Blocked Capital  |
|   540 pcs        |  |   312 pcs        |  |   228 pcs        |  |  ₹89,604         |
| Across 5 batches |  | Delivered & kept |  | Unsold + returns |  | 3 batches at risk|
+------------------+  +------------------+  +------------------+  +------------------+

ADD BATCH FORM (card)
+---------------------------------------------------------------------+
| + Record New Production Run                   [Historical cost locked]
|                                                                     |
| Batch ID         Select Garment SKU              Produced Qty       |
| [BATCH-2026-006] [ATQ-TEE-001 — Everyday Tee ▼] [100              ]|
|                                                                     |
| Gross Sold Qty   Returned Qty    Age in Days     Status            |
| [0             ] [0            ] [0            ] [Active         ▼]|
|                                   [+ Add to Batch Register button] |
+---------------------------------------------------------------------+

DEAD STOCK / LIQUIDATION ALERT PANEL (shows only if any batch is Ageing/Dead)
+---------------------------------------------------------------------+
| ⚠ STOCK AT RISK                                                     |
| 2 batches are ageing (45+ days). Act now to recover cash.          |
| [BATCH-2026-002] ATQ-KUR-001  80 pcs  Dead stock  ₹30,400          |
|   Suggested liquidation price: ₹182/pc (cost ₹380 × 0.48)         |
|   [Mark for Liquidation] [Write Off as Dead Stock]                 |
+---------------------------------------------------------------------+

BATCH REGISTER TABLE
+------+-------+--------+------+-------+-----+--------+--------+------+--------+
|Batch |Style  |Produced|Sold  |Returns|Net  |On Hand |Unit    |Blocked|Status  |
|ID    |/SKU   |        |Gross |       |Sold |        |COGS    |₹     |        |
+------+-------+--------+------+-------+-----+--------+--------+------+--------+
|B-001 |ATQ-TEE|100     |85    |5      |80   |20      |₹361    |₹7,220|Active  |
|B-002 |ATQ-KUR|100     |20    |2      |18   |82      |₹380    |₹31,16|Dead ⚠ |
+------+-------+--------+------+-------+-----+--------+--------+------+--------+
[Search batches...] [Filter: All / Active / Ageing / Liquidation / Dead]
NOTE: Each row should have [Edit] and [Delete] action. Delete shows confirm dialog.
```

---

## SCREEN 4: PROFIT & LOSS REPORTS

**Purpose:** See which garments made money and which ones lost money. Filter by time period.

```
PROFIT & LOSS REPORTS
=====================
"Which styles made real money? Which batches drained cash?"

TIME PERIOD SELECTOR (tabs — THIS IS MISSING, MUST BE ADDED)
[This Month] [Last Month] [This Year] [Custom Range: From__ To__]

Currently viewing: November 2026  ← MUST be dynamic, not hardcoded

COMPANY NET POSITION (3-column card)
+----------------------+  +--------------------------+  +--------------------+
| Total Units Net Sold |  | Total Product CM2 Cash   |  | Fixed Overheads    |
|   312 units          |  |   ₹1,24,176              |  |   ₹85,000          |
| Across all channels  |  | Before fixed burn        |  | Salary, rent, etc. |
+----------------------+  +--------------------------+  +--------------------+
                     Net Profit (CM2 - Overheads): ₹39,176 ✅  (or -₹X ⚠)
                     [This number is what actually matters most]

SKU-WISE P&L RANKING TABLE
+-------+-----------+-----+-----+------+------+-------+--------+
|Style  |Category   | MRP | COGS| CM1  | CM2  | CM3   |Margin% |
|SKU    |           |     |     |      |      |Pocket |        |
+-------+-----------+-----+-----+------+------+-------+--------+
|ATQ-TEE|Westernwear|1499 | 361 |1,021 | 398  | 288   | 19.2%✅|
|ATQ-KUR|Ethnicwear |1199 | 380 | 762  | 158  | -42   | -3.5%⚠|
+-------+-----------+-----+-----+------+------+-------+--------+
[Sort by: CM3 ▼] [Filter by category ▼] [Export to CSV button]

NET PROFIT EXPLANATION BOX (plain language)
+------------------------------------------------------------------+
| What does "Net Profit" mean for your factory?                    |
| Total from selling garments (CM2): ₹1,24,176                   |
| Minus: Monthly salary + rent + electricity: ₹85,000             |
| ─────────────────────────────────────────────                   |
| Money left in your account this month: ₹39,176 ✅               |
| Overheads are shown separately as Atiq requested.               |
+------------------------------------------------------------------+
```

---

## SCREEN 5: RETURNS WATCH

**Purpose:** Log every return that comes back from Myntra, Amazon or other channels. Understand the cost of returns.

```
RETURNS WATCH
=============
"Track returns, reasons, and reverse courier costs."

RETURNS SUMMARY (4 KPI tiles — MISSING, MUST ADD)
+-------------------+  +-------------------+  +-------------------+  +-------------------+
| Total Returns     |  | From Myntra       |  | Resaleable Items  |  | Total Return Loss |
|   24 pcs          |  |   18 pcs (75%)    |  |   16 pcs          |  |  ₹8,640           |
| This month        |  | Highest channel   |  | Can resell        |  | Refund + courier  |
+-------------------+  +-------------------+  +-------------------+  +-------------------+

LOG RETURN FORM (card)
+------------------------------------------------------------------+
| + Log Return Incident                                            |
|                                                                  |
| Channel/Marketplace  Select SKU          Return Reason           |
| [Myntra            ▼][ATQ-TEE-001      ▼][Size / Fit Issue    ▼] |
|                                                                  |
| Item Condition       Return Qty    Refund Amount   Reverse Courier|
| [Resaleable (Restocked)▼] [1   ]  [₹ 1,499     ] [₹ 45         ]|
|                                                                  |
| Order ID (optional)                           [+ Save Return]   |
| [                    ]                                           |
+------------------------------------------------------------------+

RETURNS HISTORY TABLE
+--------+-------+-------+-----+------------------+---------------+--------+---------+
|Date    |Channel|Style  |Qty  |Reason            |Condition      |Refund  |Rev.Fee  |
+--------+-------+-------+-----+------------------+---------------+--------+---------+
|Nov 15  |Myntra |ATQ-TEE| 2   |Size / Fit Issue  |Resaleable     |₹2,998  |₹90      |
|Nov 12  |Amazon |ATQ-KUR| 1   |Not as Described  |Damaged (Liq.) |₹1,199  |₹65      |
+--------+-------+-------+-----+------------------+---------------+--------+---------+
[Filter: All channels ▼] [Date: This month ▼] [Delete row with confirm]
```

---

## SCREEN 6: FACTORY EXPENSES & OVERHEADS

**Purpose:** Track all money the factory spends — salaries, rent, electricity. Kept completely separate from garment costs, as Atiq requested.

```
FACTORY EXPENSES & OVERHEADS
==============================
"As Atiq requested: Overhead burn tracked separately. Garment CM remains pure."

MONTHLY FIXED COSTS (4 input cards)
+------------------+  +------------------+  +------------------+  +------------------+
| Monthly Salaries |  | Factory Rent     |  | Electricity &    |  | TOTAL MONTHLY    |
| Tailors, helpers |  | Industrial unit  |  | Machines & boilers  | BURN             |
|                  |  |                  |  |                  |  |                  |
| ₹ [45,000      ] |  | ₹ [25,000      ] |  | ₹ [8,000       ] |  | ₹85,000          |
|                  |  |                  |  |                  |  | [Save Overheads] |
+------------------+  +------------------+  +------------------+  +------------------+

LOG AD-HOC EXPENSE (card)
+------------------------------------------------------------------+
| + Log One-Off Expense (machine repair, stationery, etc.)         |
|                                                                  |
| Category          Amount (₹)   Vendor / Person   Is Monthly?    |
| [Factory Salaries▼][15,000   ] [Ram Tailors     ] [☐ Recurring] |
| + Add custom category: [                    ] [Create]           |
|                                              [+ Save Expense]   |
+------------------------------------------------------------------+
NOTE: "Add custom category" is a MISSING FEATURE that must be built.

EXPENSE LEDGER TABLE
+--------+-------------------+---------------+------------------+----------+
|Date    |Category           |Vendor/Person  |Description       |Amount    |
+--------+-------------------+---------------+------------------+----------+
|Nov 01  |Factory Salaries   |All staff      |Monthly wages     |₹45,000   |
|Nov 10  |Machinery & Repair |Kumar Workshop |Overlock repair   |₹3,500    |
+--------+-------------------+---------------+------------------+----------+
[Filter by Category ▼] [Filter by Month ▼]
Monthly Total: ₹88,500  [Export Ledger]
```

---

## SCREEN 7: STYLE CATALOG (SKU MASTER)

**Purpose:** See all garments the brand has costed. Quick overview of which styles are profitable and which are risky.

```
STYLE CATALOG — SKU MASTER
===========================
"All designed styles with frozen making costs and prices."
                                                   [+ Add New Style]

FILTER BAR
[🔍 Search styles...]  [All Categories ▼]  [All Status ▼]  [Sort: CM3 High→Low ▼]

STYLE CARDS (3-column grid on desktop, 1 on mobile)
+----------------------+  +----------------------+  +----------------------+
| WESTERNWEAR          |  | ETHNICWEAR           |  | HOMEWEAR             |
| ATQ-TEE-001          |  | ATQ-KUR-003          |  | ATQ-HW-002           |
| Everyday Cotton Tee  |  | Rayon Kurti          |  | Fleece Coord Set     |
|  COGS: 16% ✅        |  |  COGS: 31% ⚠         |  |  COGS: 22% ⚠         |
|                      |  |                      |  |                      |
| Making Cost  ₹240    |  | Making Cost  ₹380    |  | Making Cost  ₹420    |
| MRP Tag      ₹1,499  |  | MRP Tag      ₹1,199  |  | MRP Tag      ₹1,899  |
| CM3 Pocket   ₹288    |  | CM3 Pocket   -₹42    |  | CM3 Pocket   ₹156    |
| Multiplier   2×      |  | Multiplier   2×      |  | Multiplier   2×      |
|                      |  |                      |  |                      |
| Fab: 1.35m @ ₹180/m  |  | Fab: 2.1m @ ₹120/m  |  | Fab: 2.8m @ ₹95/m   |
| [Edit Costing →]     |  | [Edit Costing →]     |  | [Edit Costing →]     |
| [⋮ More: Delete/Pause]  | [⋮ More: Delete/Pause]  | [⋮ More: Delete/Pause] |
+----------------------+  +----------------------+  +----------------------+
NOTE: "Delete" and "Change Status (Paused/Discontinued)" are MISSING FEATURES.
```

---

## SCREEN 8: SETTINGS (ADMIN)

**Purpose:** Set default rates that pre-fill all new costing forms. Changes apply to future work only — old data is never touched.

```
SETTINGS — MASTER COST RULES
==============================
Admin Only · P0 Security
"Changes apply to NEW calculations only. Old batch costs are frozen forever."
                                              [Save Master Configuration]

LEFT CARD: DEFAULT FACTORY RATES             RIGHT CARD: BUSINESS THRESHOLDS
+--------------------------------------+     +--------------------------------------+
| Default Factory Rates                |     | Commercial Benchmarks                |
| (Pre-fill new costing forms)         |     | (Business rules)                     |
|                                      |     |                                      |
| Default Fabric Rate (₹/m)    [180  ] |     | Pricing Multiplier (MRP = COGS × X)  |
| Default Cutting Rate (₹/pc)  [18   ] |     |   [2.0×]                             |
| Default Stitching Rate       [42   ] |     | COGS Target % (max % of MRP)         |
| Default Finishing & QC       [12   ] |     |   [20 %]                             |
| Default Packaging            [14   ] |     | Default Marketplace Commission       |
| Default Marketing CAC (₹)    [45   ] |     |   [22.5 %]                           |
| Default Forward Courier (₹)  [65   ] |     | Default GST Rate                     |
| Default Reverse Courier (₹)  [35   ] |     |   [5 %]                              |
| Default Returns % expected   [8  % ] |     | Carrying Cost Rate (annual %)        |
|                                      |     |   [18 %]  ← was hardcoded, now config|
+--------------------------------------+     +--------------------------------------+

AGEING RULES CARD (full width)
+------------------------------------------------------------------+
| Batch Status Auto-Classification Rules (days in warehouse)       |
|                                                                  |
| Active (selling normally)       if age < [30] days              |
| Ageing (slow-moving, monitor)   if age [30] - [60] days         |
| Liquidation (needs markdown)    if age [60] - [90] days         |
| Dead Stock (write-off risk)     if age > [90] days              |
|                                                                  |
| ⚠ These thresholds affect how batches are tagged in the register |
+------------------------------------------------------------------+

USER / ACCESS CONTROL CARD (full width, future feature note)
+------------------------------------------------------------------+
| Business Identity                                                |
|                                                                  |
| Business Name  [Atiq Studio                               ]     |
| Owner Name     [Atiq                                      ]     |
| (Future: Add team members with Operator / Admin roles)          |
+------------------------------------------------------------------+
```

---

## SCREEN 9 (NEW — MISSING): REVENUE TRACKER (Daily / Monthly / Yearly)

**Purpose:** Answer the question "How much money did we actually receive this month from sales?" This feature is currently completely absent.

```
REVENUE TRACKER
===============
"See actual money received from sales by time period."

TIME PERIOD TABS
[📅 Today] [This Week] [This Month] [Last Month] [This Year] [Custom...]

REVENUE SUMMARY (5 KPIs)
+----------+  +----------+  +----------+  +----------+  +----------+
|Gross Rev.|  |Returns   |  |Net Revenue|  |Units Sold|  |Avg Per   |
|₹2,10,000 |  |-₹18,000  |  |₹1,92,000  |  |140 pcs   |  |Unit ₹1371|
|MRP × qty |  |refunds   |  |After refunds             |  |          |
+----------+  +----------+  +----------+  +----------+  +----------+

CHANNEL BREAKDOWN TABLE
+----------+-------+--------+---------+---------+
|Channel   |Units  |Gross   |Returns  |Net Rev. |
+----------+-------+--------+---------+---------+
|Myntra    | 80    |₹1,20,000|-₹14,000|₹1,06,000|
|Amazon    | 40    |₹60,000  |-₹4,000 |₹56,000  |
|Flipkart  | 20    |₹30,000  |₹0      |₹30,000  |
+----------+-------+--------+---------+---------+

HOW TO LOG REVENUE: User enters sales data via "Log Daily Sales" form below.
NOTE: This requires adding a new SaleRecord model in MongoDB.

LOG DAILY SALES (simple form)
+------------------------------------------------------------------+
| + Log Sales (Actual)                                             |
| Date      Channel      SKU           Qty Sold   Sale Price/pc   |
| [Today  ] [Myntra   ▼] [ATQ-TEE-001▼] [10    ]  [1,349        ] |
|                                              [+ Save Sales Data] |
+------------------------------------------------------------------+
```

---

## SCREEN 10 (NEW — MISSING): DEAD STOCK & LIQUIDATION MANAGER

**Purpose:** Show all stuck inventory clearly. Help decide what to do with it — discount, liquidate or write off.

```
DEAD STOCK & LIQUIDATION MANAGER
==================================
"Your money is stuck. Here's what to do about it."

ALERT HEADER (shows only if dead/liquidation batches exist)
+------------------------------------------------------------------+
| ⚠ ₹1,24,800 of your factory cash is locked in unsold inventory.  |
| Act on these batches to recover as much money as possible.       |
+------------------------------------------------------------------+

STUCK STOCK TABLE
+--------+--------+-----+-----+--------+--------+--------+----------+------------+
|Batch   |Style   |On   |Age  |Unit    |Blocked |Liq.    |Recovery  |Action      |
|ID      |/SKU    |Hand |Days |COGS    |Capital |Price   |%         |            |
+--------+--------+-----+-----+--------+--------+--------+----------+------------+
|B-002   |ATQ-KUR | 80  | 97  |₹380    |₹30,400 |₹182/pc |48%       |[Liquidate] |
|        |        |     |     |        |        |        |          |[Write Off] |
+--------+--------+-----+-----+--------+--------+--------+----------+------------+

LIQUIDATION PRICE CALCULATOR (card, appears when user clicks Liquidate)
+------------------------------------------------------------------+
| Calculate Liquidation Price for Batch B-002 (ATQ-KUR, 80 pcs)  |
|                                                                  |
| Original Unit COGS:  ₹380 (frozen, cannot change)              |
| You want to recover: [60]% of cost                              |
|                      = ₹228/pc                                  |
| Sell 80 pcs @ ₹228 = ₹18,240 total recovery                   |
|                                                                  |
| You will lose: ₹30,400 - ₹18,240 = ₹12,160                   |
| This is better than losing all ₹30,400 (dead stock write-off)   |
|                               [Confirm Liquidation Price: ₹228] |
+------------------------------------------------------------------+
```

---

## DESIGN TOKENS & CONSTANTS (Do NOT change these)

```
Colors:
  bg-sidebar:    #111C2D  (dark navy)
  accent-gold:   #C58B4B  (amber gold)
  text-primary:  #17202D
  text-muted:    #748092
  bg-page:       #F5F6F8
  border:        #E7EAF0
  success-green: #16835D
  danger-red:    #C44E4E
  info-blue:     #2563EB
  bg-card:       #FFFFFF

Typography:
  font-body:   "Inter", system-ui, sans-serif
  Label sizes: 10px uppercase tracking-widest for section titles
  Input label: 11px font-bold text-[#566273]
  Card title:  14px font-bold text-[#17202D]
  KPI number:  24px font-extrabold

Border radius:
  Cards:   rounded-2xl (1rem)
  Buttons: rounded-lg
  Badges:  rounded-full

Shadows:
  Cards:   shadow-2xs (very subtle)
  Modals:  shadow-xl

Language Rules:
  - Write "Making Cost" not "COGS" in UI labels
  - Write "Platform Fee" not "Commission" for Myntra/Amazon
  - Write "Pocket Cash" not "CM3" in summaries
  - Write "Stock at Risk" not "At-Risk Inventory"
  - Use ₹ symbol for Indian Rupees
  - Use pcs (pieces) not "units"
  - Write "Silai" for stitching (Atiq uses Hindi terms)
```
