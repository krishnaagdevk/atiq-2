import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      default: "Dresses",
      trim: true,
    },
    fabricType: { type: String, default: "100% Cotton" },
    marketplaces: { type: [String], default: ["Myntra", "Amazon", "Flipkart"] },
    fabricQty: { type: Number, default: 1.5 },
    fabricRate: { type: Number, default: 180 },
    trimsCost: { type: Number, default: 25 },
    trimsDetail: { type: Schema.Types.Mixed, default: {} },
    cuttingCost: { type: Number, default: 18 },
    stitchingCost: { type: Number, default: 45 },
    finishingCost: { type: Number, default: 12 },
    packagingCost: { type: Number, default: 15 },
    otherCost: { type: Number, default: 10 },
    totalCogs: { type: Number, default: 395 },
    mrp: { type: Number, default: 1499 },
    discountPct: { type: Number, default: 10 },
    gstPct: { type: Number, default: 5 },
    marketplaceCommissionPct: { type: Number, default: 22.5 },
    logisticsCost: { type: Number, default: 65 },
    reverseLogisticsCost: { type: Number, default: 35 },
    marketingCost: { type: Number, default: 45 },
    pricingMultiplier: { type: Number, default: 2.0 },
    targetCogsPct: { type: Number, default: 20 },
    expectedReturnsPct: { type: Number, default: 10 },
    recommendedMrp: { type: Number, default: 790 },
    cogsPct: { type: Number, default: 26.3 },
    cm1: { type: Number, default: 0 },
    cm2: { type: Number, default: 0 },
    cm3: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Paused", "Discontinued"], default: "Active" },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.models.Product || mongoose.model("Product", ProductSchema);
