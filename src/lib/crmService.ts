import {
  ProductCosting,
  ProductionBatch,
  ReturnRecord,
  ExpenseRecord,
  SaleRecord,
  BusinessOverheadConfig,
} from "./types";
import {
  initialProducts,
  initialBatches,
  initialReturns,
  initialExpenses,
  initialSales,
  initialConfig,
  defaultMarketplacesConfig,
} from "./seed";
import { calculateGarmentEconomics } from "./formulas";

const STORAGE_KEYS = {
  PRODUCTS: "atiq_crm_products",
  BATCHES: "atiq_crm_batches",
  RETURNS: "atiq_crm_returns",
  EXPENSES: "atiq_crm_expenses",
  SALES: "atiq_crm_sales",
  CONFIG: "atiq_crm_config",
};

// Memory cache for runtime (SSR or in-memory fallback)
let memProducts = [...initialProducts];
let memBatches = [...initialBatches];
let memReturns = [...initialReturns];
let memExpenses = [...initialExpenses];
let memSales = [...initialSales];
let memConfig = { ...initialConfig };

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function getStoredItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const val = localStorage.getItem(key);
    if (!val) return fallback;
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Failed to save to localStorage:", e);
  }
}

export function getInitialData(): {
  products: ProductCosting[];
  batches: ProductionBatch[];
  returns: ReturnRecord[];
  expenses: ExpenseRecord[];
  sales: SaleRecord[];
  config: BusinessOverheadConfig;
} {
  if (isBrowser()) {
    const products = getStoredItem<ProductCosting[]>(
      STORAGE_KEYS.PRODUCTS,
      initialProducts,
    );
    const batches = getStoredItem<ProductionBatch[]>(
      STORAGE_KEYS.BATCHES,
      initialBatches,
    );
    const returns = getStoredItem<ReturnRecord[]>(
      STORAGE_KEYS.RETURNS,
      initialReturns,
    );
    const expenses = getStoredItem<ExpenseRecord[]>(
      STORAGE_KEYS.EXPENSES,
      initialExpenses,
    );
    const sales = getStoredItem<SaleRecord[]>(STORAGE_KEYS.SALES, initialSales);
    const config = getStoredItem<BusinessOverheadConfig>(
      STORAGE_KEYS.CONFIG,
      initialConfig,
    );

    // Sync in memory cache
    memProducts = products;
    memBatches = batches;
    memReturns = returns;
    memExpenses = expenses;
    memSales = sales;
    memConfig = config;

    return { products, batches, returns, expenses, sales, config };
  }

  return {
    products: memProducts,
    batches: memBatches,
    returns: memReturns,
    expenses: memExpenses,
    sales: memSales,
    config: memConfig,
  };
}

export async function saveProductAction(productData: Omit<ProductCosting, "id">) {
  try {
    const eco = calculateGarmentEconomics({
      fabricQty: productData.fabricQty,
      fabricRate: productData.fabricRate,
      trimsCost: productData.trimsCost,
      cuttingCost: productData.cuttingCost,
      stitchingCost: productData.stitchingCost,
      finishingCost: productData.finishingCost,
      packagingCost: productData.packagingCost,
      otherCost: productData.otherCost,
      mrp: productData.mrp,
      discountPct: productData.discountPct,
      gstPct: productData.gstPct,
      marketplaceCommissionPct: productData.marketplaceCommissionPct,
      logisticsCost: productData.logisticsCost,
      reverseLogisticsCost: productData.reverseLogisticsCost,
      marketingCost: productData.marketingCost,
      pricingMultiplier: productData.pricingMultiplier,
      expectedReturnsPct: productData.expectedReturnsPct,
      targetCogsPct: productData.targetCogsPct,
    });

    const enrichedProduct: ProductCosting = {
      ...productData,
      totalCogs: eco.totalCogs,
      recommendedMrp: eco.recommendedMrp,
      cogsPct: eco.cogsPct,
      cm1: eco.cm1,
      cm2: eco.cm2,
      cm3: eco.cm3,
    };

    const idx = memProducts.findIndex((p) => p.sku === enrichedProduct.sku);
    if (idx >= 0) {
      memProducts[idx] = enrichedProduct;
    } else {
      memProducts.unshift(enrichedProduct);
    }
    setStoredItem(STORAGE_KEYS.PRODUCTS, memProducts);

    return { success: true, product: enrichedProduct };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProductAction(sku: string) {
  try {
    memProducts = memProducts.filter((p) => p.sku !== sku);
    setStoredItem(STORAGE_KEYS.PRODUCTS, memProducts);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addBatchAction(batchData: ProductionBatch) {
  try {
    const idx = memBatches.findIndex((b) => b.id === batchData.id);
    if (idx >= 0) {
      memBatches[idx] = batchData;
    } else {
      memBatches.unshift(batchData);
    }
    setStoredItem(STORAGE_KEYS.BATCHES, memBatches);
    return { success: true, batch: batchData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBatchStatusAction(
  batchId: string,
  status: ProductionBatch["status"],
  liquidationPrice?: number,
) {
  try {
    const idx = memBatches.findIndex((b) => b.id === batchId);
    if (idx >= 0) {
      memBatches[idx].status = status;
      if (liquidationPrice !== undefined) {
        memBatches[idx].liquidationPrice = liquidationPrice;
      }
      setStoredItem(STORAGE_KEYS.BATCHES, memBatches);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBatchAction(batchId: string) {
  try {
    memBatches = memBatches.filter((b) => b.id !== batchId);
    setStoredItem(STORAGE_KEYS.BATCHES, memBatches);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addReturnAction(returnData: ReturnRecord) {
  try {
    memReturns.unshift(returnData);
    const batch = memBatches.find((b) => b.id === returnData.batchId);
    if (batch && returnData.condition.includes("Resaleable")) {
      batch.returnedQty += returnData.returnQty;
      batch.netSoldQty = Math.max(0, batch.grossSoldQty - batch.returnedQty);
      batch.onHandQty = Math.max(0, batch.producedQty - batch.netSoldQty);
      batch.blockedCapital = batch.onHandQty * batch.unitCogs;
      setStoredItem(STORAGE_KEYS.BATCHES, memBatches);
    }
    setStoredItem(STORAGE_KEYS.RETURNS, memReturns);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteReturnAction(returnId: string) {
  try {
    memReturns = memReturns.filter((r) => r.id !== returnId);
    setStoredItem(STORAGE_KEYS.RETURNS, memReturns);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addExpenseAction(expenseData: ExpenseRecord) {
  try {
    memExpenses.unshift(expenseData);
    setStoredItem(STORAGE_KEYS.EXPENSES, memExpenses);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExpenseAction(expenseId: string) {
  try {
    memExpenses = memExpenses.filter((e) => e.id !== expenseId);
    setStoredItem(STORAGE_KEYS.EXPENSES, memExpenses);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addSaleAction(saleData: SaleRecord) {
  try {
    memSales.unshift(saleData);
    if (saleData.batchId) {
      const b = memBatches.find((item) => item.id === saleData.batchId);
      if (b) {
        b.grossSoldQty += saleData.qty;
        b.netSoldQty = Math.max(0, b.grossSoldQty - b.returnedQty);
        b.onHandQty = Math.max(0, b.producedQty - b.netSoldQty);
        b.blockedCapital = b.onHandQty * b.unitCogs;
        setStoredItem(STORAGE_KEYS.BATCHES, memBatches);
      }
    }
    setStoredItem(STORAGE_KEYS.SALES, memSales);
    return { success: true, sale: saleData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSaleAction(saleId: string) {
  try {
    memSales = memSales.filter((s) => s.id !== saleId);
    setStoredItem(STORAGE_KEYS.SALES, memSales);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveConfigAction(newConfig: BusinessOverheadConfig) {
  try {
    memConfig = { ...newConfig };
    setStoredItem(STORAGE_KEYS.CONFIG, memConfig);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addExpenseCategoryAction(categoryName: string) {
  try {
    const trimmed = categoryName.trim();
    if (!trimmed) return { success: false, error: "Category name required" };

    if (!memConfig.customExpenseCategories) {
      memConfig.customExpenseCategories = [];
    }
    if (!memConfig.customExpenseCategories.includes(trimmed)) {
      memConfig.customExpenseCategories.push(trimmed);
      setStoredItem(STORAGE_KEYS.CONFIG, memConfig);
    }
    return { success: true, categories: memConfig.customExpenseCategories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addGarmentCategoryAction(categoryName: string) {
  try {
    const trimmed = categoryName.trim();
    if (!trimmed) return { success: false, error: "Garment category name required" };

    if (!memConfig.garmentCategories) {
      memConfig.garmentCategories = [...(initialConfig.garmentCategories || [])];
    }
    if (!memConfig.garmentCategories.includes(trimmed)) {
      memConfig.garmentCategories.push(trimmed);
      setStoredItem(STORAGE_KEYS.CONFIG, memConfig);
    }
    return { success: true, categories: memConfig.garmentCategories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteGarmentCategoryAction(categoryName: string) {
  try {
    const trimmed = categoryName.trim();
    if (!trimmed) return { success: false, error: "Garment category name required" };

    if (!memConfig.garmentCategories) {
      memConfig.garmentCategories = [...(initialConfig.garmentCategories || [])];
    }
    memConfig.garmentCategories = memConfig.garmentCategories.filter(
      (c) => c !== trimmed,
    );
    setStoredItem(STORAGE_KEYS.CONFIG, memConfig);
    return { success: true, categories: memConfig.garmentCategories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
