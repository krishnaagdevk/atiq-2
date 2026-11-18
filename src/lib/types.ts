// Types & Data Structures for Atiq CRM

export const GARMENT_CATEGORIES = [
  "Dresses",
  "Tops & Shirts",
  "Trousers & Pants",
  "Co-ord Sets",
  "Blazers & Jackets",
  "Jumpsuits",
] as const;

export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number];

export interface TrimsBreakdown {
  preset?: string;
  buttonsCost?: number;
  zipperType?:
    | "None"
    | "CFC Zipper"
    | "Concealed Zipper"
    | "Metal Zipper"
    | string;
  zipperCost?: number;
  fusingLiningCost?: number;
  shoulderPadType?:
    | "None"
    | "Standard Poly Pad"
    | "Molded Tailored Pad"
    | "Custom"
    | string;
  shoulderPadCost?: number;
  eyeHookCost?: number;
  labelsAndThreadCost?: number;
}

export interface ProductCosting {
  id?: string;
  sku: string;
  name: string;
  category: string;
  fabricType?: string;
  marketplaces: string[]; // e.g. ["Myntra", "Amazon", "Flipkart", "Shopify", "Offline"]
  // BOM elements (Per-piece)
  fabricQty: number; // in metres
  fabricRate: number; // ₹ per metre
  trimsCost: number; // ₹ buttons, zipper, labels, thread
  trimsDetail?: TrimsBreakdown;
  cuttingCost: number; // ₹
  stitchingCost: number; // ₹
  finishingCost: number; // ₹ ironing, QC, checking
  packagingCost: number; // ₹ polybag, barcode, tag, box
  otherCost: number; // ₹
  totalCogs: number; // auto-computed

  // Commercial Assumptions
  mrp: number; // ₹
  discountPct: number; // %
  gstPct: number; // % (e.g. 5%)
  marketplaceCommissionPct: number; // % (e.g. 22.5%)
  logisticsCost: number; // ₹ per sold pc (forward)
  reverseLogisticsCost: number; // ₹ per returned pc
  marketingCost: number; // ₹ per sold pc (CAC)
  pricingMultiplier: number; // e.g. 2.0x, 2.5x, 4.0x
  targetCogsPct: number; // e.g. 20%
  expectedReturnsPct: number; // % e.g. 15%

  // Calculated economics
  recommendedMrp: number;
  cogsPct: number; // (cogs / mrp) * 100
  cm1: number; // Net realization ex-GST after discounts & returns
  cm2: number; // Gross contribution = CM1 - Commission - COGS
  cm3: number; // Net pocket cash = CM2 - Logistics - Marketing
  status: "Active" | "Paused" | "Discontinued";
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductionBatch {
  id: string; // e.g. BATCH-2026-001
  sku: string;
  productName: string;
  producedQty: number;
  grossSoldQty: number;
  returnedQty: number;
  netSoldQty: number;
  onHandQty: number;
  ageDays: number;
  unitCogs: number; // Locked historical manufacturing cost
  blockedCapital: number; // onHandQty * unitCogs
  status: "Active" | "Ageing" | "Liquidation" | "Dead stock";
  liquidationPrice?: number;
  productionDate: string;
}

export interface ReturnRecord {
  id: string;
  orderId?: string;
  marketplace: "Myntra" | "Amazon" | "Flipkart" | "Shopify" | "Offline";
  sku: string;
  batchId?: string;
  returnQty: number;
  reason:
    | "Size / Fit Issue"
    | "Fabric Quality / Defect"
    | "Not as Described"
    | "Changed Mind"
    | "RTO Undelivered";
  condition:
    | "Resaleable (Restocked)"
    | "Minor Defect (Repairable)"
    | "Damaged (Liquidation)";
  refundAmount: number;
  reverseLogisticsFee: number;
  date: string;
}

export interface ExpenseRecord {
  id: string;
  category: string; // Dynamic category (Factory Salaries, Rent, Electricity, Courier, Ads, etc.)
  amount: number;
  date: string;
  vendor?: string;
  description: string;
  isRecurringMonthly: boolean;
}

export interface SaleRecord {
  id: string;
  date: string; // YYYY-MM-DD
  channel: "Myntra" | "Amazon" | "Flipkart" | "Shopify" | "Offline";
  sku: string;
  productName: string;
  batchId?: string;
  qty: number;
  salePrice: number; // ₹ per piece customer selling price
  grossRevenue: number; // qty * salePrice
  returnDeduction: number; // refund provision
  netRevenue: number; // grossRevenue - returnDeduction
}

export interface MarketplaceChannelConfig {
  id: string; // e.g. "myntra", "amazon", "flipkart", "meesho", "ajio", "shopify", "offline"
  name: string; // "Myntra"
  commissionPct: number; // Platform referral fee % (e.g. 22.5%)
  fixedFee: number; // Closing / payment gateway fee ₹ (e.g. 15)
  shippingFee: number; // Forward courier ₹ (e.g. 70)
  reverseShippingFee: number; // Reverse courier / return friction ₹ (e.g. 85)
  expectedReturnsPct: number; // Expected return rate % on this platform (e.g. 30%)
  gstOnCommissionPct: number; // 18% standard GST on platform fees
  status: "Active" | "Paused";
}

export interface BusinessOverheadConfig {
  businessName?: string;
  ownerName?: string;
  monthlySalary: number;
  monthlyRent: number;
  monthlyElectricity: number;
  monthlyOther: number;
  // Shared Production Rate Defaults
  defaultFabricRate: number;
  defaultCutting: number;
  defaultStitching: number;
  defaultFinishing: number;
  defaultPackaging: number;
  defaultPricingMultiplier: number;
  defaultTargetCogsPct: number;
  defaultMarketplaceCommission: number;
  defaultGstPct: number;
  defaultLogisticsCost: number;
  defaultReverseLogisticsCost: number;
  defaultMarketingCost: number;
  defaultExpectedReturnsPct: number;
  defaultCarryingCostPct: number; // e.g. 18% annual inventory carrying cost
  garmentCategories?: string[]; // Config-controlled garment categories
  fabricTypes?: string[]; // Standard fabric options
  customExpenseCategories?: string[];
  marketplacesConfig?: MarketplaceChannelConfig[];
  // Ageing rules (in days)
  ageThresholdActive: number; // < 30
  ageThresholdAgeing: number; // 30 - 60
  ageThresholdLiquidation: number; // 60 - 90
  ageThresholdDead: number; // > 90
}
