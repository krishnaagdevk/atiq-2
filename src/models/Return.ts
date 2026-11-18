import mongoose, { Schema } from "mongoose";

const ReturnSchema = new Schema(
  {
    returnId: { type: String, required: true, unique: true },
    orderId: { type: String, default: "" },
    marketplace: {
      type: String,
      enum: ["Myntra", "Amazon", "Flipkart", "Shopify", "Offline"],
      default: "Myntra",
    },
    sku: { type: String, required: true, uppercase: true },
    batchId: { type: String, default: "" },
    returnQty: { type: Number, required: true, min: 1 },
    reason: {
      type: String,
      enum: [
        "Size / Fit Issue",
        "Fabric Quality / Defect",
        "Not as Described",
        "Changed Mind",
        "RTO Undelivered",
      ],
      default: "Size / Fit Issue",
    },
    condition: {
      type: String,
      enum: [
        "Resaleable (Restocked)",
        "Minor Defect (Repairable)",
        "Damaged (Liquidation)",
      ],
      default: "Resaleable (Restocked)",
    },
    refundAmount: { type: Number, default: 0 },
    reverseLogisticsFee: { type: Number, default: 45 },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
  },
  { timestamps: true },
);

export const ReturnModel =
  mongoose.models.Return || mongoose.model("Return", ReturnSchema);
