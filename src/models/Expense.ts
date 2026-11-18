import mongoose, { Schema } from "mongoose";

const ExpenseSchema = new Schema(
  {
    expenseId: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      default: "Factory Salaries",
    },
    amount: { type: Number, required: true },
    date: { type: String, default: () => new Date().toISOString().split("T")[0] },
    vendor: { type: String, default: "" },
    description: { type: String, default: "" },
    isRecurringMonthly: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ExpenseModel = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

const OverheadConfigSchema = new Schema(
  {
    businessName: { type: String, default: "Atiq Studio" },
    ownerName: { type: String, default: "Atiq" },
    monthlySalary: { type: Number, default: 180000 },
    monthlyRent: { type: Number, default: 45000 },
    monthlyElectricity: { type: Number, default: 15000 },
    monthlyOther: { type: Number, default: 10000 },
    defaultFabricRate: { type: Number, default: 180 },
    defaultCutting: { type: Number, default: 18 },
    defaultStitching: { type: Number, default: 45 },
    defaultFinishing: { type: Number, default: 12 },
    defaultPackaging: { type: Number, default: 15 },
    defaultPricingMultiplier: { type: Number, default: 2.0 },
    defaultTargetCogsPct: { type: Number, default: 20 },
    defaultMarketplaceCommission: { type: Number, default: 22.5 },
    defaultGstPct: { type: Number, default: 5 },
    defaultLogisticsCost: { type: Number, default: 65 },
    defaultReverseLogisticsCost: { type: Number, default: 35 },
    defaultMarketingCost: { type: Number, default: 45 },
    defaultExpectedReturnsPct: { type: Number, default: 10 },
    defaultCarryingCostPct: { type: Number, default: 18 },
    garmentCategories: {
      type: [String],
      default: ["Westernwear", "Homewear", "Ethnicwear", "Kidswear", "Accessories"],
    },
    fabricTypes: {
      type: [String],
      default: [
        "100% Cotton",
        "Rayon 14kg",
        "Georgette",
        "Polyester Crepe",
        "Linen Blend",
        "Denim / Twill",
        "Silk Blend",
        "Lycra / Rib Knit",
        "Other Fabric",
      ],
    },
    customExpenseCategories: {
      type: [String],
      default: [
        "Factory Salaries",
        "Premises Rent",
        "Electricity & Power",
        "Admin & Office",
        "Machinery & Repair",
        "Logistics & Courier Bills",
        "Marketing & Meta Ads",
        "Packaging Consumables",
        "Other",
      ],
    },
    marketplacesConfig: {
      type: Array,
      default: [],
    },
    ageThresholdActive: { type: Number, default: 30 },
    ageThresholdAgeing: { type: Number, default: 60 },
    ageThresholdLiquidation: { type: Number, default: 90 },
    ageThresholdDead: { type: Number, default: 120 },
  },
  { timestamps: true }
);

export const OverheadConfigModel =
  mongoose.models.OverheadConfig || mongoose.model("OverheadConfig", OverheadConfigSchema);
