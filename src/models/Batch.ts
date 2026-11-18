import mongoose, { Schema } from "mongoose";

const BatchSchema = new Schema(
  {
    batchId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    sku: { type: String, required: true, uppercase: true, trim: true },
    productName: { type: String, default: "" },
    producedQty: { type: Number, required: true, min: 1 },
    grossSoldQty: { type: Number, default: 0 },
    returnedQty: { type: Number, default: 0 },
    netSoldQty: { type: Number, default: 0 },
    onHandQty: { type: Number, default: 0 },
    ageDays: { type: Number, default: 0 },
    unitCogs: { type: Number, required: true }, // Locked historical cost snapshot
    blockedCapital: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Ageing", "Liquidation", "Dead stock"],
      default: "Active",
    },
    liquidationPrice: { type: Number, default: 0 },
    productionDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
  },
  { timestamps: true }
);

export const BatchModel = mongoose.models.Batch || mongoose.model("Batch", BatchSchema);
