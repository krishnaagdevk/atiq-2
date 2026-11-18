"use server";

import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { BatchModel } from "@/models/Batch";
import { ReturnModel } from "@/models/Return";
import { ExpenseModel, OverheadConfigModel } from "@/models/Expense";
import { SaleModel } from "@/models/Sale";
import {
  initialProducts,
  initialBatches,
  initialReturns,
  initialExpenses,
  initialSales,
  initialConfig,
  defaultMarketplacesConfig,
} from "@/lib/seed";
import {
  ProductCosting,
  ProductionBatch,
  ReturnRecord,
  ExpenseRecord,
  SaleRecord,
  BusinessOverheadConfig,
} from "@/lib/types";
import { calculateGarmentEconomics } from "@/lib/formulas";

// Memory fallbacks when MongoDB is offline/unreachable
let memProducts = [...initialProducts];
let memBatches = [...initialBatches];
let memReturns = [...initialReturns];
let memExpenses = [...initialExpenses];
let memSales = [...initialSales];
let memConfig = { ...initialConfig };

export async function getInitialData(): Promise<{
  products: ProductCosting[];
  batches: ProductionBatch[];
  returns: ReturnRecord[];
  expenses: ExpenseRecord[];
  sales: SaleRecord[];
  config: BusinessOverheadConfig;
}> {
  try {
    const db = await connectDB();
    if (!db) {
      return {
        products: memProducts,
        batches: memBatches,
        returns: memReturns,
        expenses: memExpenses,
        sales: memSales,
        config: memConfig,
      };
    }

    // Seed products if empty
    const productCount = await ProductModel.countDocuments();
    if (productCount === 0) {
      await ProductModel.insertMany(initialProducts);
      await BatchModel.insertMany(
        initialBatches.map((b) => ({
          batchId: b.id,
          sku: b.sku,
          productName: b.productName,
          producedQty: b.producedQty,
          grossSoldQty: b.grossSoldQty,
          returnedQty: b.returnedQty,
          netSoldQty: b.netSoldQty,
          onHandQty: b.onHandQty,
          ageDays: b.ageDays,
          unitCogs: b.unitCogs,
          blockedCapital: b.blockedCapital,
          status: b.status,
          liquidationPrice: b.liquidationPrice,
          productionDate: b.productionDate,
        }))
      );
      await ReturnModel.insertMany(
        initialReturns.map((r) => ({
          returnId: r.id,
          orderId: r.orderId,
          marketplace: r.marketplace,
          sku: r.sku,
          batchId: r.batchId,
          returnQty: r.returnQty,
          reason: r.reason,
          condition: r.condition,
          refundAmount: r.refundAmount,
          reverseLogisticsFee: r.reverseLogisticsFee,
          date: r.date,
        }))
      );
      await ExpenseModel.insertMany(
        initialExpenses.map((e) => ({
          expenseId: e.id,
          category: e.category,
          amount: e.amount,
          date: e.date,
          vendor: e.vendor,
          description: e.description,
          isRecurringMonthly: e.isRecurringMonthly,
        }))
      );
      await OverheadConfigModel.create(initialConfig);
    }

    // Seed sales if empty
    const saleCount = await SaleModel.countDocuments();
    if (saleCount === 0) {
      await SaleModel.insertMany(
        initialSales.map((s) => ({
          saleId: s.id,
          date: s.date,
          channel: s.channel,
          sku: s.sku,
          productName: s.productName,
          batchId: s.batchId,
          qty: s.qty,
          salePrice: s.salePrice,
          grossRevenue: s.grossRevenue,
          returnDeduction: s.returnDeduction,
          netRevenue: s.netRevenue,
        }))
      );
    }

    const [dbProducts, dbBatches, dbReturns, dbExpenses, dbSales, dbConfig] = await Promise.all([
      ProductModel.find().lean(),
      BatchModel.find().lean(),
      ReturnModel.find().lean(),
      ExpenseModel.find().lean(),
      SaleModel.find().lean(),
      OverheadConfigModel.findOne().lean(),
    ]);

    const formattedProducts: ProductCosting[] = dbProducts.map((p: any) => ({
      id: p._id?.toString(),
      sku: p.sku,
      name: p.name,
      category: p.category,
      fabricType: p.fabricType || "100% Cotton",
      marketplaces: p.marketplaces || [],
      fabricQty: p.fabricQty,
      fabricRate: p.fabricRate,
      trimsCost: p.trimsCost,
      trimsDetail: p.trimsDetail || {},
      cuttingCost: p.cuttingCost,
      stitchingCost: p.stitchingCost,
      finishingCost: p.finishingCost,
      packagingCost: p.packagingCost,
      otherCost: p.otherCost,
      totalCogs: p.totalCogs,
      mrp: p.mrp,
      discountPct: p.discountPct,
      gstPct: p.gstPct,
      marketplaceCommissionPct: p.marketplaceCommissionPct,
      logisticsCost: p.logisticsCost,
      reverseLogisticsCost: p.reverseLogisticsCost,
      marketingCost: p.marketingCost,
      pricingMultiplier: p.pricingMultiplier,
      targetCogsPct: p.targetCogsPct,
      expectedReturnsPct: p.expectedReturnsPct,
      recommendedMrp: p.recommendedMrp,
      cogsPct: p.cogsPct,
      cm1: p.cm1,
      cm2: p.cm2,
      cm3: p.cm3,
      status: p.status,
    }));

    const formattedBatches: ProductionBatch[] = dbBatches.map((b: any) => ({
      id: b.batchId,
      sku: b.sku,
      productName: b.productName,
      producedQty: b.producedQty,
      grossSoldQty: b.grossSoldQty,
      returnedQty: b.returnedQty,
      netSoldQty: b.netSoldQty,
      onHandQty: b.onHandQty,
      ageDays: b.ageDays,
      unitCogs: b.unitCogs,
      blockedCapital: b.blockedCapital,
      status: b.status,
      liquidationPrice: b.liquidationPrice,
      productionDate: b.productionDate,
    }));

    const formattedReturns: ReturnRecord[] = dbReturns.map((r: any) => ({
      id: r.returnId,
      orderId: r.orderId,
      marketplace: r.marketplace,
      sku: r.sku,
      batchId: r.batchId,
      returnQty: r.returnQty,
      reason: r.reason,
      condition: r.condition,
      refundAmount: r.refundAmount,
      reverseLogisticsFee: r.reverseLogisticsFee,
      date: r.date,
    }));

    const formattedExpenses: ExpenseRecord[] = dbExpenses.map((e: any) => ({
      id: e.expenseId,
      category: e.category,
      amount: e.amount,
      date: e.date,
      vendor: e.vendor,
      description: e.description,
      isRecurringMonthly: e.isRecurringMonthly,
    }));

    const formattedSales: SaleRecord[] = dbSales.map((s: any) => ({
      id: s.saleId,
      date: s.date,
      channel: s.channel,
      sku: s.sku,
      productName: s.productName,
      batchId: s.batchId,
      qty: s.qty,
      salePrice: s.salePrice,
      grossRevenue: s.grossRevenue,
      returnDeduction: s.returnDeduction,
      netRevenue: s.netRevenue,
    }));

    const formattedConfig: BusinessOverheadConfig = dbConfig
      ? {
          businessName: dbConfig.businessName || memConfig.businessName,
          ownerName: dbConfig.ownerName || memConfig.ownerName,
          monthlySalary: dbConfig.monthlySalary,
          monthlyRent: dbConfig.monthlyRent,
          monthlyElectricity: dbConfig.monthlyElectricity,
          monthlyOther: dbConfig.monthlyOther,
          defaultFabricRate: dbConfig.defaultFabricRate,
          defaultCutting: dbConfig.defaultCutting,
          defaultStitching: dbConfig.defaultStitching,
          defaultFinishing: dbConfig.defaultFinishing,
          defaultPackaging: dbConfig.defaultPackaging,
          defaultPricingMultiplier: dbConfig.defaultPricingMultiplier,
          defaultTargetCogsPct: dbConfig.defaultTargetCogsPct,
          defaultMarketplaceCommission: dbConfig.defaultMarketplaceCommission,
          defaultGstPct: dbConfig.defaultGstPct,
          defaultLogisticsCost: dbConfig.defaultLogisticsCost,
          defaultReverseLogisticsCost: dbConfig.defaultReverseLogisticsCost,
          defaultMarketingCost: dbConfig.defaultMarketingCost,
          defaultExpectedReturnsPct: dbConfig.defaultExpectedReturnsPct,
          defaultCarryingCostPct: dbConfig.defaultCarryingCostPct || 18,
          garmentCategories:
            dbConfig.garmentCategories && dbConfig.garmentCategories.length > 0
              ? dbConfig.garmentCategories
              : memConfig.garmentCategories || initialConfig.garmentCategories,
          fabricTypes:
            dbConfig.fabricTypes && dbConfig.fabricTypes.length > 0
              ? dbConfig.fabricTypes
              : memConfig.fabricTypes || initialConfig.fabricTypes,
          customExpenseCategories:
            dbConfig.customExpenseCategories || memConfig.customExpenseCategories,
          marketplacesConfig:
            dbConfig.marketplacesConfig && dbConfig.marketplacesConfig.length > 0
              ? dbConfig.marketplacesConfig
              : memConfig.marketplacesConfig || defaultMarketplacesConfig,
          ageThresholdActive: dbConfig.ageThresholdActive,
          ageThresholdAgeing: dbConfig.ageThresholdAgeing,
          ageThresholdLiquidation: dbConfig.ageThresholdLiquidation,
          ageThresholdDead: dbConfig.ageThresholdDead,
        }
      : memConfig;

    return {
      products: formattedProducts,
      batches: formattedBatches,
      returns: formattedReturns,
      expenses: formattedExpenses,
      sales: formattedSales.length > 0 ? formattedSales : memSales,
      config: formattedConfig,
    };
  } catch (err) {
    console.error("Error loading data from Mongo, using mem fallback:", err);
    return {
      products: memProducts,
      batches: memBatches,
      returns: memReturns,
      expenses: memExpenses,
      sales: memSales,
      config: memConfig,
    };
  }
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

    const db = await connectDB();
    if (db) {
      await ProductModel.findOneAndUpdate(
        { sku: enrichedProduct.sku },
        { $set: enrichedProduct },
        { upsert: true, new: true }
      );
    }

    // Memory update
    const idx = memProducts.findIndex((p) => p.sku === enrichedProduct.sku);
    if (idx >= 0) {
      memProducts[idx] = enrichedProduct;
    } else {
      memProducts.unshift(enrichedProduct);
    }

    return { success: true, product: enrichedProduct };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProductAction(sku: string) {
  try {
    const db = await connectDB();
    if (db) {
      await ProductModel.deleteOne({ sku });
    }
    memProducts = memProducts.filter((p) => p.sku !== sku);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addBatchAction(batchData: ProductionBatch) {
  try {
    const db = await connectDB();
    if (db) {
      await BatchModel.findOneAndUpdate(
        { batchId: batchData.id },
        {
          $set: {
            batchId: batchData.id,
            sku: batchData.sku,
            productName: batchData.productName,
            producedQty: batchData.producedQty,
            grossSoldQty: batchData.grossSoldQty,
            returnedQty: batchData.returnedQty,
            netSoldQty: batchData.netSoldQty,
            onHandQty: batchData.onHandQty,
            ageDays: batchData.ageDays,
            unitCogs: batchData.unitCogs,
            blockedCapital: batchData.blockedCapital,
            status: batchData.status,
            liquidationPrice: batchData.liquidationPrice,
            productionDate: batchData.productionDate,
          },
        },
        { upsert: true, new: true }
      );
    }

    const idx = memBatches.findIndex((b) => b.id === batchData.id);
    if (idx >= 0) {
      memBatches[idx] = batchData;
    } else {
      memBatches.unshift(batchData);
    }

    return { success: true, batch: batchData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBatchStatusAction(
  batchId: string,
  status: ProductionBatch["status"],
  liquidationPrice?: number
) {
  try {
    const db = await connectDB();
    if (db) {
      const updateData: any = { status };
      if (liquidationPrice !== undefined) {
        updateData.liquidationPrice = liquidationPrice;
      }
      await BatchModel.findOneAndUpdate({ batchId }, { $set: updateData });
    }

    const idx = memBatches.findIndex((b) => b.id === batchId);
    if (idx >= 0) {
      memBatches[idx].status = status;
      if (liquidationPrice !== undefined) {
        memBatches[idx].liquidationPrice = liquidationPrice;
      }
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBatchAction(batchId: string) {
  try {
    const db = await connectDB();
    if (db) {
      await BatchModel.deleteOne({ batchId });
    }
    memBatches = memBatches.filter((b) => b.id !== batchId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addReturnAction(returnData: ReturnRecord) {
  try {
    const db = await connectDB();
    if (db) {
      await ReturnModel.create({
        returnId: returnData.id,
        orderId: returnData.orderId,
        marketplace: returnData.marketplace,
        sku: returnData.sku,
        batchId: returnData.batchId,
        returnQty: returnData.returnQty,
        reason: returnData.reason,
        condition: returnData.condition,
        refundAmount: returnData.refundAmount,
        reverseLogisticsFee: returnData.reverseLogisticsFee,
        date: returnData.date,
      });

      // If condition is resaleable, update batch stock automatically
      if (returnData.condition.includes("Resaleable") && returnData.batchId) {
        await BatchModel.findOneAndUpdate(
          { batchId: returnData.batchId },
          {
            $inc: {
              returnedQty: returnData.returnQty,
              netSoldQty: -returnData.returnQty,
              onHandQty: returnData.returnQty,
            },
          }
        );
      }
    }

    // Memory update
    memReturns.unshift(returnData);
    const batch = memBatches.find((b) => b.id === returnData.batchId);
    if (batch && returnData.condition.includes("Resaleable")) {
      batch.returnedQty += returnData.returnQty;
      batch.netSoldQty = Math.max(0, batch.grossSoldQty - batch.returnedQty);
      batch.onHandQty = Math.max(0, batch.producedQty - batch.netSoldQty);
      batch.blockedCapital = batch.onHandQty * batch.unitCogs;
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteReturnAction(returnId: string) {
  try {
    const db = await connectDB();
    if (db) {
      await ReturnModel.deleteOne({ returnId });
    }
    memReturns = memReturns.filter((r) => r.id !== returnId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addExpenseAction(expenseData: ExpenseRecord) {
  try {
    const db = await connectDB();
    if (db) {
      await ExpenseModel.create({
        expenseId: expenseData.id,
        category: expenseData.category,
        amount: expenseData.amount,
        date: expenseData.date,
        vendor: expenseData.vendor,
        description: expenseData.description,
        isRecurringMonthly: expenseData.isRecurringMonthly,
      });
    }

    memExpenses.unshift(expenseData);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExpenseAction(expenseId: string) {
  try {
    const db = await connectDB();
    if (db) {
      await ExpenseModel.deleteOne({ expenseId });
    }
    memExpenses = memExpenses.filter((e) => e.id !== expenseId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addSaleAction(saleData: SaleRecord) {
  try {
    const db = await connectDB();
    if (db) {
      await SaleModel.create({
        saleId: saleData.id,
        date: saleData.date,
        channel: saleData.channel,
        sku: saleData.sku,
        productName: saleData.productName,
        batchId: saleData.batchId,
        qty: saleData.qty,
        salePrice: saleData.salePrice,
        grossRevenue: saleData.grossRevenue,
        returnDeduction: saleData.returnDeduction,
        netRevenue: saleData.netRevenue,
      });

      // Update linked batch sold numbers if provided
      if (saleData.batchId) {
        await BatchModel.findOneAndUpdate(
          { batchId: saleData.batchId },
          {
            $inc: {
              grossSoldQty: saleData.qty,
              netSoldQty: saleData.qty,
              onHandQty: -saleData.qty,
            },
          }
        );
      }
    }

    memSales.unshift(saleData);
    if (saleData.batchId) {
      const b = memBatches.find((item) => item.id === saleData.batchId);
      if (b) {
        b.grossSoldQty += saleData.qty;
        b.netSoldQty = Math.max(0, b.grossSoldQty - b.returnedQty);
        b.onHandQty = Math.max(0, b.producedQty - b.netSoldQty);
        b.blockedCapital = b.onHandQty * b.unitCogs;
      }
    }

    return { success: true, sale: saleData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSaleAction(saleId: string) {
  try {
    const db = await connectDB();
    if (db) {
      await SaleModel.deleteOne({ saleId });
    }
    memSales = memSales.filter((s) => s.id !== saleId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveConfigAction(newConfig: BusinessOverheadConfig) {
  try {
    const db = await connectDB();
    if (db) {
      await OverheadConfigModel.findOneAndUpdate({}, { $set: newConfig }, { upsert: true });
    }
    memConfig = { ...newConfig };
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addExpenseCategoryAction(categoryName: string) {
  try {
    const trimmed = categoryName.trim();
    if (!trimmed) return { success: false, error: "Category name required" };

    const db = await connectDB();
    if (db) {
      await OverheadConfigModel.findOneAndUpdate(
        {},
        { $addToSet: { customExpenseCategories: trimmed } },
        { upsert: true }
      );
    }

    if (!memConfig.customExpenseCategories) {
      memConfig.customExpenseCategories = [];
    }
    if (!memConfig.customExpenseCategories.includes(trimmed)) {
      memConfig.customExpenseCategories.push(trimmed);
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

    const db = await connectDB();
    if (db) {
      await OverheadConfigModel.findOneAndUpdate(
        {},
        { $addToSet: { garmentCategories: trimmed } },
        { upsert: true }
      );
    }

    if (!memConfig.garmentCategories) {
      memConfig.garmentCategories = [...(initialConfig.garmentCategories || [])];
    }
    if (!memConfig.garmentCategories.includes(trimmed)) {
      memConfig.garmentCategories.push(trimmed);
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

    const db = await connectDB();
    if (db) {
      await OverheadConfigModel.findOneAndUpdate(
        {},
        { $pull: { garmentCategories: trimmed } },
        { upsert: true }
      );
    }

    if (!memConfig.garmentCategories) {
      memConfig.garmentCategories = [...(initialConfig.garmentCategories || [])];
    }
    memConfig.garmentCategories = memConfig.garmentCategories.filter(
      (c) => c !== trimmed
    );
    return { success: true, categories: memConfig.garmentCategories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
