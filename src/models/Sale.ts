import mongoose, { Schema, Document } from "mongoose";

export interface ISale extends Document {
  saleId: string;
  date: string;
  channel: string;
  sku: string;
  productName: string;
  batchId?: string;
  qty: number;
  salePrice: number;
  grossRevenue: number;
  returnDeduction: number;
  netRevenue: number;
}

const SaleSchema = new Schema<ISale>(
  {
    saleId: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    channel: { type: String, required: true },
    sku: { type: String, required: true },
    productName: { type: String, required: true },
    batchId: { type: String },
    qty: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    grossRevenue: { type: Number, required: true },
    returnDeduction: { type: Number, default: 0 },
    netRevenue: { type: Number, required: true },
  },
  { timestamps: true }
);

export const SaleModel =
  mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);
