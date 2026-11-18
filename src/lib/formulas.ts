import { ProductCosting, MarketplaceChannelConfig } from "./types";

/**
 * Format currency in Indian standard (e.g. ₹1,20,000 or ₹1.08L)
 */
export function formatINR(
  val: number | undefined | null,
  compact = false,
): string {
  const num = Number(val || 0);
  if (compact && Math.abs(num) >= 100000) {
    return "₹" + (num / 100000).toFixed(2) + "L";
  }
  return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

/**
 * Format percentage
 */
export function formatPct(val: number | undefined | null): string {
  return Number(val || 0).toFixed(1) + "%";
}

/**
 * Core Garment Costing Engine
 * Calculates COGS, CM1, CM2, CM3 as per Atiq Client meeting specification
 */
export function calculateGarmentEconomics(input: {
  fabricQty: number;
  fabricRate: number;
  trimsCost: number;
  cuttingCost: number;
  stitchingCost: number;
  finishingCost: number;
  packagingCost: number;
  otherCost: number;
  mrp: number;
  discountPct: number;
  gstPct: number;
  marketplaceCommissionPct: number;
  logisticsCost: number;
  reverseLogisticsCost?: number;
  marketingCost: number;
  pricingMultiplier: number;
  expectedReturnsPct: number;
  targetCogsPct: number;
}) {
  // 1. Calculate COGS (Manufacturing cost per piece)
  const fabricCost =
    (Number(input.fabricQty) || 0) * (Number(input.fabricRate) || 0);
  const totalCogs =
    fabricCost +
    (Number(input.trimsCost) || 0) +
    (Number(input.cuttingCost) || 0) +
    (Number(input.stitchingCost) || 0) +
    (Number(input.finishingCost) || 0) +
    (Number(input.packagingCost) || 0) +
    (Number(input.otherCost) || 0);

  // 2. Recommended MRP based on configurable multiplier
  const multiplier = Number(input.pricingMultiplier) || 2.0;
  const recommendedMrp = totalCogs * multiplier;

  // 3. Current COGS % vs MRP
  const mrp = Math.max(1, Number(input.mrp) || 0);
  const cogsPct = (totalCogs / mrp) * 100;
  const targetCogsPct = Number(input.targetCogsPct) || 20;
  const isCogsWithinTarget = cogsPct <= targetCogsPct;

  // 4. Client's Contribution Margin logic:
  // Gross Selling Price after promotional discount
  const discountRate = (Number(input.discountPct) || 0) / 100;
  const discountedPrice = mrp * (1 - discountRate);

  // Apply expected customer returns rate
  const returnRate = (Number(input.expectedReturnsPct) || 0) / 100;
  const netRevenueAfterReturns = discountedPrice * (1 - returnRate);

  // Remove GST (tax excluded from margin)
  const gstRate = (Number(input.gstPct) || 0) / 100;
  const cm1 = netRevenueAfterReturns / (1 + gstRate); // Net Realisation ex-GST

  // Marketplace commission deduction
  const commRate = (Number(input.marketplaceCommissionPct) || 0) / 100;
  const commissionDeduction = cm1 * commRate;

  // CM2: Gross Contribution (Product covering its direct creation & platform cost)
  const cm2 = cm1 - commissionDeduction - totalCogs;

  // COTB Deductions: Logistics (forward + expected return friction) & Ad Marketing
  const forwardLogistics = Number(input.logisticsCost) || 0;
  const reverseLogistics =
    (Number(input.reverseLogisticsCost) || 0) * returnRate;
  const totalLogistics = forwardLogistics + reverseLogistics;
  const marketing = Number(input.marketingCost) || 0;

  // CM3: Net In-Hand Pocket Cash per sold unit
  const cm3 = cm2 - totalLogistics - marketing;

  return {
    fabricCost,
    totalCogs,
    recommendedMrp,
    cogsPct,
    isCogsWithinTarget,
    discountedPrice,
    netRevenueAfterReturns,
    gstDeduction: netRevenueAfterReturns - cm1,
    cm1,
    commissionDeduction,
    cm2,
    forwardLogistics,
    reverseLogistics,
    totalLogistics,
    marketing,
    cm3,
  };
}

/**
 * Multi-Marketplace Channel Profit Simulator
 * Computes exact platform cuts, return drag, logistics and final pocket cash
 */
export function simulateChannelEconomics({
  mrp,
  totalCogs,
  discountPct = 0,
  gstPct = 5,
  marketingCost = 0,
  channel,
}: {
  mrp: number;
  totalCogs: number;
  discountPct?: number;
  gstPct?: number;
  marketingCost?: number;
  channel: MarketplaceChannelConfig;
}) {
  const safeMrp = Math.max(1, Number(mrp) || 0);
  const discountRate = (Number(discountPct) || 0) / 100;
  const discountedPrice = safeMrp * (1 - discountRate);

  const returnRate = (Number(channel.expectedReturnsPct) || 0) / 100;
  const netRevenueAfterReturns = discountedPrice * (1 - returnRate);

  const gstRate = (Number(gstPct) || 0) / 100;
  const cm1 = netRevenueAfterReturns / (1 + gstRate); // Net Realisation ex-GST

  // Platform cut: commission on CM1 + fixed closing fee + 18% GST on platform fees
  const commissionRate = (Number(channel.commissionPct) || 0) / 100;
  const commissionVal = cm1 * commissionRate;
  const fixedFee = Number(channel.fixedFee) || 0;
  const gstOnFeeRate = (Number(channel.gstOnCommissionPct ?? 18) || 0) / 100;
  const totalPlatformCut = (commissionVal + fixedFee) * (1 + gstOnFeeRate);

  // Logistics: forward courier + reverse courier weighted by return friction
  const forwardShipping = Number(channel.shippingFee) || 0;
  const reverseShipping =
    (Number(channel.reverseShippingFee) || 0) * returnRate;
  const totalLogistics = forwardShipping + reverseShipping;

  const marketing = Number(marketingCost) || 0;

  // CM2: Gross Contribution = CM1 - Platform Cut - COGS
  const cm2 = cm1 - totalPlatformCut - totalCogs;

  // CM3: Net In-Hand Pocket Cash per sold unit
  const cm3 = cm2 - totalLogistics - marketing;
  const netMarginPct = (cm3 / safeMrp) * 100;

  // Status benchmark: >18% Healthy / Green, 10-18% Moderate / Yellow, <10% Risk / Red
  let statusBadge: "Healthy Profit" | "Moderate Margin" | "Loss Risk" =
    "Healthy Profit";
  if (cm3 <= 0 || netMarginPct < 5) {
    statusBadge = "Loss Risk";
  } else if (netMarginPct < 15) {
    statusBadge = "Moderate Margin";
  }

  return {
    discountedPrice,
    netRevenueAfterReturns,
    cm1,
    commissionVal,
    fixedFee,
    totalPlatformCut,
    forwardShipping,
    reverseShipping,
    totalLogistics,
    cm2,
    cm3,
    netMarginPct,
    statusBadge,
  };
}
