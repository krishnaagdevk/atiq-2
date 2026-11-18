"use client";

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Calculator,
  Layers,
  TrendingUp,
  RotateCcw,
  Receipt,
  Shirt,
  Settings,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Menu,
  X,
  Trash2,
  Search,
  DollarSign,
  Truck,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Info,
  Download,
  Percent,
  Building2,
  Calendar,
  Filter,
  PackageX,
  ExternalLink,
  Pencil,
  Store,
  ShoppingBag,
  Sliders,
  Scissors,
  Tag,
  FileSpreadsheet,
  Printer,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import * as XLSX from "xlsx";

import {
  ProductCosting,
  ProductionBatch,
  ReturnRecord,
  ExpenseRecord,
  SaleRecord,
  BusinessOverheadConfig,
  MarketplaceChannelConfig,
  TrimsBreakdown,
  TrimRowItem,
  GARMENT_CATEGORIES,
} from "@/lib/types";
import {
  formatINR,
  formatPct,
  calculateGarmentEconomics,
  simulateChannelEconomics,
} from "@/lib/formulas";
import { defaultMarketplacesConfig } from "@/lib/seed";
import {
  saveProductAction,
  deleteProductAction,
  addBatchAction,
  deleteBatchAction,
  updateBatchStatusAction,
  addReturnAction,
  deleteReturnAction,
  addExpenseAction,
  deleteExpenseAction,
  addSaleAction,
  deleteSaleAction,
  saveConfigAction,
  addExpenseCategoryAction,
  addGarmentCategoryAction,
  deleteGarmentCategoryAction,
} from "@/actions/crm";

interface AtiqAppProps {
  initialData: {
    products: ProductCosting[];
    batches: ProductionBatch[];
    returns: ReturnRecord[];
    expenses: ExpenseRecord[];
    sales: SaleRecord[];
    config: BusinessOverheadConfig;
  };
}

const DEFAULT_TRIMS_DETAIL: TrimsBreakdown = {
  preset: "Dresses (Concealed Zipper, Fusing, Hook)",
  buttonsCost: 0,
  zipperType: "Concealed Zipper",
  zipperCost: 10,
  fusingLiningCost: 8,
  shoulderPadType: "None",
  shoulderPadCost: 0,
  eyeHookCost: 2,
  labelsAndThreadCost: 4,
};

const DEFAULT_TRIM_ROW_ITEMS: TrimRowItem[] = [
  {
    id: "trim-1",
    type: "zipper",
    name: "Concealed Zipper",
    quantity: 1,
    price: 10,
  },
  {
    id: "trim-2",
    type: "button",
    name: "Horn Buttons",
    quantity: 2,
    price: 2,
  },
  {
    id: "trim-3",
    type: "fusing",
    name: "Collar Bukram Fusing",
    quantity: 1,
    price: 8,
  },
  {
    id: "trim-4",
    type: "eyehook",
    name: "Hook & Bar",
    quantity: 1,
    price: 2,
  },
];

const TRIM_PRESET_OPTIONS = [
  "Dresses (Concealed Zipper, Fusing, Hook)",
  "Tops & Shirts (Buttons, Collar Fusing)",
  "Trousers & Pants (CFC Zipper, Hook & Bar)",
  "Co-ord Sets (Concealed Zipper, Hooks)",
  "Blazers & Jackets (Shoulder Pads, Horn Buttons, Lining)",
  "Jumpsuits (Long Concealed Zipper, Hook)",
  "Basic / Minimal Trims (Labels & Thread only)",
];

const TRIM_PRESETS: Record<string, TrimsBreakdown> = {
  "Dresses (Concealed Zipper, Fusing, Hook)": {
    preset: "Dresses (Concealed Zipper, Fusing, Hook)",
    buttonsCost: 0,
    zipperType: "Concealed Zipper",
    zipperCost: 10,
    fusingLiningCost: 8,
    shoulderPadType: "None",
    shoulderPadCost: 0,
    eyeHookCost: 2,
    labelsAndThreadCost: 4,
  },
  "Tops & Shirts (Buttons, Collar Fusing)": {
    preset: "Tops & Shirts (Buttons, Collar Fusing)",
    buttonsCost: 8,
    zipperType: "None",
    zipperCost: 0,
    fusingLiningCost: 5,
    shoulderPadType: "None",
    shoulderPadCost: 0,
    eyeHookCost: 0,
    labelsAndThreadCost: 3,
  },
  "Trousers & Pants (CFC Zipper, Hook & Bar)": {
    preset: "Trousers & Pants (CFC Zipper, Hook & Bar)",
    buttonsCost: 2,
    zipperType: "CFC Zipper",
    zipperCost: 8,
    fusingLiningCost: 6,
    shoulderPadType: "None",
    shoulderPadCost: 0,
    eyeHookCost: 4,
    labelsAndThreadCost: 3,
  },
  "Co-ord Sets (Concealed Zipper, Hooks)": {
    preset: "Co-ord Sets (Concealed Zipper, Hooks)",
    buttonsCost: 4,
    zipperType: "Concealed Zipper",
    zipperCost: 10,
    fusingLiningCost: 6,
    shoulderPadType: "None",
    shoulderPadCost: 0,
    eyeHookCost: 2,
    labelsAndThreadCost: 4,
  },
  "Blazers & Jackets (Shoulder Pads, Horn Buttons, Lining)": {
    preset: "Blazers & Jackets (Shoulder Pads, Horn Buttons, Lining)",
    buttonsCost: 14,
    zipperType: "None",
    zipperCost: 0,
    fusingLiningCost: 20,
    shoulderPadType: "Molded Tailored Pad",
    shoulderPadCost: 10,
    eyeHookCost: 0,
    labelsAndThreadCost: 4,
  },
  "Jumpsuits (Long Concealed Zipper, Hook)": {
    preset: "Jumpsuits (Long Concealed Zipper, Hook)",
    buttonsCost: 4,
    zipperType: "Concealed Zipper",
    zipperCost: 12,
    fusingLiningCost: 6,
    shoulderPadType: "None",
    shoulderPadCost: 0,
    eyeHookCost: 2,
    labelsAndThreadCost: 4,
  },
  "Basic / Minimal Trims (Labels & Thread only)": {
    preset: "Basic / Minimal Trims (Labels & Thread only)",
    buttonsCost: 0,
    zipperType: "None",
    zipperCost: 0,
    fusingLiningCost: 0,
    shoulderPadType: "None",
    shoulderPadCost: 0,
    eyeHookCost: 0,
    labelsAndThreadCost: 4,
  },
  // Category key aliases for instant matching when product category is selected:
  Dresses: {
    preset: "Dresses (Concealed Zipper, Fusing, Hook)",
    buttonsCost: 0,
    zipperType: "Concealed Zipper",
    zipperCost: 10,
    fusingLiningCost: 8,
    shoulderPadType: "None",
    shoulderPadCost: 0,
    eyeHookCost: 2,
    labelsAndThreadCost: 4,
  },
  "Tops & Shirts": {
    preset: "Tops & Shirts (Buttons, Collar Fusing)",
    buttonsCost: 8,
    zipperType: "None",
    zipperCost: 0,
    fusingLiningCost: 5,
    shoulderPadType: "None",
    shoulderPadCost: 0,
    eyeHookCost: 0,
    labelsAndThreadCost: 3,
  },
  "Trousers & Pants": {
    preset: "Trousers & Pants (CFC Zipper, Hook & Bar)",
    buttonsCost: 2,
    zipperType: "CFC Zipper",
    zipperCost: 8,
    fusingLiningCost: 6,
    shoulderPadType: "None",
    shoulderPadCost: 0,
    eyeHookCost: 4,
    labelsAndThreadCost: 3,
  },
  "Co-ord Sets": {
    preset: "Co-ord Sets (Concealed Zipper, Hooks)",
    buttonsCost: 4,
    zipperType: "Concealed Zipper",
    zipperCost: 10,
    fusingLiningCost: 6,
    shoulderPadType: "None",
    shoulderPadCost: 0,
    eyeHookCost: 2,
    labelsAndThreadCost: 4,
  },
  "Blazers & Jackets": {
    preset: "Blazers & Jackets (Shoulder Pads, Horn Buttons, Lining)",
    buttonsCost: 14,
    zipperType: "None",
    zipperCost: 0,
    fusingLiningCost: 20,
    shoulderPadType: "Molded Tailored Pad",
    shoulderPadCost: 10,
    eyeHookCost: 0,
    labelsAndThreadCost: 4,
  },
  Jumpsuits: {
    preset: "Jumpsuits (Long Concealed Zipper, Hook)",
    buttonsCost: 4,
    zipperType: "Concealed Zipper",
    zipperCost: 12,
    fusingLiningCost: 6,
    shoulderPadType: "None",
    shoulderPadCost: 0,
    eyeHookCost: 2,
    labelsAndThreadCost: 4,
  },
  "Western Dress / Gown": {
    preset: "Dresses (Concealed Zipper, Fusing, Hook)",
    buttonsCost: 0,
    zipperType: "Concealed Zipper",
    zipperCost: 10,
    fusingLiningCost: 8,
    shoulderPadType: "None",
    shoulderPadCost: 0,
    eyeHookCost: 2,
    labelsAndThreadCost: 4,
  },
  "Blazer / Tailored Jacket": {
    preset: "Blazers & Jackets (Shoulder Pads, Horn Buttons, Lining)",
    buttonsCost: 14,
    zipperType: "None",
    zipperCost: 0,
    fusingLiningCost: 20,
    shoulderPadType: "Molded Tailored Pad",
    shoulderPadCost: 10,
    eyeHookCost: 0,
    labelsAndThreadCost: 4,
  },
};

const FABRIC_BENCHMARKS: Record<string, number> = {
  "100% Cotton": 180,
  "Rayon 14kg": 140,
  Georgette: 120,
  "Polyester Crepe": 130,
  "Linen Blend": 240,
  "Denim / Twill": 260,
  "Silk Blend": 320,
  "Lycra / Rib Knit": 210,
  "Other Fabric": 180,
};

export default function AtiqCRMApp({ initialData }: AtiqAppProps) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Core Data State
  const [products, setProducts] = useState<ProductCosting[]>(
    initialData.products || [],
  );
  const [batches, setBatches] = useState<ProductionBatch[]>(
    initialData.batches || [],
  );
  const [returns, setReturns] = useState<ReturnRecord[]>(
    initialData.returns || [],
  );
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(
    initialData.expenses || [],
  );
  const [sales, setSales] = useState<SaleRecord[]>(initialData.sales || []);
  const [config, setConfig] = useState<BusinessOverheadConfig>(
    initialData.config,
  );

  // Time Filter State for Reports & Revenue
  const [timePeriod, setTimePeriod] = useState<
    "today" | "month" | "year" | "all"
  >("month");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Liquidation Calculator Interactive Modal/Card State
  const [selectedLiquidationBatchId, setSelectedLiquidationBatchId] =
    useState<string>(
      batches.find(
        (b) =>
          b.status === "Ageing" ||
          b.status === "Liquidation" ||
          b.status === "Dead stock",
      )?.id ||
        batches[0]?.id ||
        "",
    );
  const [liquidationRecoveryPct, setLiquidationRecoveryPct] =
    useState<number>(60);

  // Active Costing Calculator Selection
  const [selectedSku, setSelectedSku] = useState<string>(
    products[0]?.sku || "",
  );
  const [costingMobileTab, setCostingMobileTab] = useState<"inputs" | "result">(
    "inputs",
  );
  const activeProduct =
    products.find((p) => p.sku === selectedSku) || products[0];

  // Dynamic Year
  const currentYear = new Date().getFullYear();
  const currentMonthYearName = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Costing Form State
  const [costForm, setCostForm] = useState({
    sku:
      activeProduct?.sku || `ATQ-NEW-${Math.floor(100 + Math.random() * 900)}`,
    name: activeProduct?.name || "New Garment Style",
    category:
      activeProduct?.category || config.garmentCategories?.[0] || "Dresses",
    fabricType:
      activeProduct?.fabricType || config.fabricTypes?.[0] || "100% Cotton",
    fabricQty: activeProduct?.fabricQty || 1.4,
    fabricRate: activeProduct?.fabricRate || config.defaultFabricRate || 180,
    trimsCost: activeProduct?.trimsCost || 24,
    trimsDetail: activeProduct?.trimsDetail || DEFAULT_TRIMS_DETAIL,
    trimItems:
      activeProduct?.trimItems && activeProduct.trimItems.length > 0
        ? activeProduct.trimItems
        : activeProduct?.trimsDetail?.items &&
            activeProduct.trimsDetail.items.length > 0
          ? activeProduct.trimsDetail.items
          : DEFAULT_TRIM_ROW_ITEMS,
    cuttingCost: activeProduct?.cuttingCost || config.defaultCutting || 18,
    stitchingCost:
      activeProduct?.stitchingCost || config.defaultStitching || 42,
    finishingCost:
      activeProduct?.finishingCost || config.defaultFinishing || 12,
    packagingCost:
      activeProduct?.packagingCost || config.defaultPackaging || 14,
    otherCost: activeProduct?.otherCost || 0,
    mrp: activeProduct?.mrp || 1499,
    discountPct: activeProduct?.discountPct || 10,
    gstPct: activeProduct?.gstPct || config.defaultGstPct || 5,
    marketplaceCommissionPct:
      activeProduct?.marketplaceCommissionPct ||
      config.defaultMarketplaceCommission ||
      22.5,
    logisticsCost:
      activeProduct?.logisticsCost || config.defaultLogisticsCost || 65,
    reverseLogisticsCost:
      activeProduct?.reverseLogisticsCost ||
      config.defaultReverseLogisticsCost ||
      35,
    marketingCost:
      activeProduct?.marketingCost || config.defaultMarketingCost || 45,
    pricingMultiplier:
      activeProduct?.pricingMultiplier ||
      config.defaultPricingMultiplier ||
      2.0,
    targetCogsPct:
      activeProduct?.targetCogsPct || config.defaultTargetCogsPct || 20,
    expectedReturnsPct:
      activeProduct?.expectedReturnsPct ||
      config.defaultExpectedReturnsPct ||
      10,
    productionRunQty: 100,
    revivedFromSku: activeProduct?.revivedFromSku || "",
    revivedFromQty: activeProduct?.revivedFromQty || 0,
    isRevivedVersion: Boolean(activeProduct?.isRevivedVersion),
    revivalNotes: activeProduct?.revivalNotes || "",
  });

  // Dead SKU Inspection & Revival Wizard State
  const [selectedDeadSkuForDetails, setSelectedDeadSkuForDetails] =
    useState<string | null>(null);
  const [showRevivalModal, setShowRevivalModal] = useState(false);
  const [revivalForm, setRevivalForm] = useState({
    originSku: "",
    originName: "",
    originCategory: "Westernwear",
    originFabricType: "100% Cotton",
    originFabricQty: 1.35,
    originFabricRate: 180,
    originTrimsCost: 24,
    originCuttingCost: 18,
    originStitchingCost: 42,
    originFinishingCost: 12,
    originPackagingCost: 14,
    originOtherCost: 0,
    originMrp: 1499,
    originTrimItems: [] as TrimRowItem[],
    piecesAvailable: 50,
    newSku: "",
    newName: "",
    reworkAdditionalCost: 35,
    newMrp: 1499,
    revivalNotes: "",
  });

  // Dead Stock Policy and Info Modal State
  const [showDeadStockInfoModal, setShowDeadStockInfoModal] = useState(false);

  // Master Garment Categories (Config-Controlled with standard fallback)
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const garmentCategoriesList: string[] = useMemo(() => {
    return config.garmentCategories && config.garmentCategories.length > 0
      ? config.garmentCategories
      : (GARMENT_CATEGORIES as unknown as string[]);
  }, [config.garmentCategories]);

  const handleAddGarmentCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (garmentCategoriesList.includes(trimmed)) {
      setToast({
        message: `Category "${trimmed}" already exists`,
        type: "error",
      });
      return;
    }
    const res = await addGarmentCategoryAction(trimmed);
    if (res.success && res.categories) {
      setConfig((prev) => ({ ...prev, garmentCategories: res.categories }));
      setNewCategoryInput("");
      setToast({
        message: `Added "${trimmed}" to Garment Categories`,
        type: "success",
      });
    } else {
      setToast({
        message: res.error || "Failed to add category",
        type: "error",
      });
    }
  };

  const handleDeleteGarmentCategory = async (catToDelete: string) => {
    if (garmentCategoriesList.length <= 1) {
      setToast({
        message: "At least one garment category is required",
        type: "error",
      });
      return;
    }
    const res = await deleteGarmentCategoryAction(catToDelete);
    if (res.success && res.categories) {
      setConfig((prev) => ({ ...prev, garmentCategories: res.categories }));
      setToast({
        message: `Removed "${catToDelete}" from Garment Categories`,
        type: "success",
      });
    } else {
      setToast({
        message: res.error || "Failed to delete category",
        type: "error",
      });
    }
  };

  const handleResetGarmentCategories = async () => {
    const res = await saveConfigAction({
      ...config,
      garmentCategories: [...GARMENT_CATEGORIES],
    });
    if (res.success) {
      setConfig((prev) => ({
        ...prev,
        garmentCategories: [...GARMENT_CATEGORIES],
      }));
      setToast({
        message: "Reset to standard 6 garment categories",
        type: "success",
      });
    }
  };

  // Render standardized batch status badge with interactive 'i' info trigger
  const renderBatchStatusBadge = (status: ProductionBatch["status"]) => {
    let badgeColor = "bg-[#edf7f2] text-[#16835d] border-[#16835d]/20";
    let explanation = `Active (<${config.ageThresholdActive || 30} days): Fresh production run moving at regular sales velocity. Zero capital risk.`;

    if (status === "Ageing") {
      badgeColor = "bg-[#fff4e5] text-[#a66a1d] border-[#a66a1d]/20";
      explanation = `Ageing (${config.ageThresholdActive || 30}-${config.ageThresholdAgeing || 60} days): Sales slowing down. Requires promotional boost or discounts.`;
    } else if (status === "Liquidation") {
      badgeColor = "bg-[#fff0f0] text-[#c44e4e] border-[#c44e4e]/20";
      explanation = `Liquidation (${config.ageThresholdAgeing || 60}-${config.ageThresholdLiquidation || 90} days): Capital stuck. Recommended to markdown to recover manufacturing cost.`;
    } else if (status === "Dead stock") {
      badgeColor = "bg-[#450a0a] text-white border-red-900";
      explanation = `Dead Stock (>${config.ageThresholdLiquidation || 90} days): Stagnant inventory bleeding carrying cost (~18% p.a.). High priority clearance.`;
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}
        title={explanation}
      >
        {status}
      </span>
    );
  };

  const fabricTypesList = useMemo(() => {
    return config.fabricTypes && config.fabricTypes.length > 0
      ? config.fabricTypes
      : [
          "100% Cotton",
          "Rayon 14kg",
          "Georgette",
          "Polyester Crepe",
          "Linen Blend",
          "Denim / Twill",
          "Silk Blend",
          "Lycra / Rib Knit",
          "Other Fabric",
        ];
  }, [config.fabricTypes]);

  const updateTrimsField = (patch: Partial<TrimsBreakdown>) => {
    const current = costForm.trimsDetail || DEFAULT_TRIMS_DETAIL;
    const updatedDetail: TrimsBreakdown = {
      ...current,
      ...patch,
      preset: patch.preset !== undefined ? patch.preset : "Custom",
    };
    const b = Number(updatedDetail.buttonsCost) || 0;
    const z = Number(updatedDetail.zipperCost) || 0;
    const f = Number(updatedDetail.fusingLiningCost) || 0;
    const s = Number(updatedDetail.shoulderPadCost) || 0;
    const e = Number(updatedDetail.eyeHookCost) || 0;
    const l = Number(updatedDetail.labelsAndThreadCost) || 0;
    const total = b + z + f + s + e + l;
    setCostForm((prev) => ({
      ...prev,
      trimsCost: total,
      trimsDetail: updatedDetail,
    }));
  };

  const applyTrimsPreset = (presetKey: string) => {
    if (presetKey === "Custom") {
      updateTrimsField({ preset: "Custom" });
      return;
    }
    const preset = TRIM_PRESETS[presetKey];
    if (preset) {
      const b = Number(preset.buttonsCost) || 0;
      const z = Number(preset.zipperCost) || 0;
      const f = Number(preset.fusingLiningCost) || 0;
      const s = Number(preset.shoulderPadCost) || 0;
      const e = Number(preset.eyeHookCost) || 0;
      const l = Number(preset.labelsAndThreadCost) || 0;
      const total = b + z + f + s + e + l;
      setCostForm((prev) => ({
        ...prev,
        trimsCost: total,
        trimsDetail: { ...preset },
      }));
      showToast(`Applied trims preset: ${presetKey}`);
    }
  };

  // Dynamic Trims Item Handlers (fabric, zipper, button, fusing, lining, eyehook)
  const handleUpdateTrimItem = (
    id: string,
    field: "type" | "name" | "quantity" | "price",
    value: string,
  ) => {
    setCostForm((prev) => {
      const updated = (prev.trimItems || []).map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });
      const newTotal = updated.reduce((acc, it) => {
        const q = Number(it.quantity) || 0;
        const p = Number(it.price) || 0;
        return acc + q * p;
      }, 0);
      return {
        ...prev,
        trimItems: updated,
        trimsCost: Math.round(newTotal * 100) / 100,
      };
    });
  };

  const handleAddTrimItem = () => {
    const newItem: TrimRowItem = {
      id: `trim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "zipper",
      name: "",
      quantity: 1,
      price: "",
    };
    setCostForm((prev) => {
      const updated = [...(prev.trimItems || []), newItem];
      const newTotal = updated.reduce((acc, it) => {
        const q = Number(it.quantity) || 0;
        const p = Number(it.price) || 0;
        return acc + q * p;
      }, 0);
      return {
        ...prev,
        trimItems: updated,
        trimsCost: Math.round(newTotal * 100) / 100,
      };
    });
  };

  const handleDeleteTrimItem = (id: string) => {
    setCostForm((prev) => {
      const updated = (prev.trimItems || []).filter((item) => item.id !== id);
      const newTotal = updated.reduce((acc, it) => {
        const q = Number(it.quantity) || 0;
        const p = Number(it.price) || 0;
        return acc + q * p;
      }, 0);
      return {
        ...prev,
        trimItems: updated,
        trimsCost: Math.round(newTotal * 100) / 100,
      };
    });
  };

  // Batch Form State
  const [batchForm, setBatchForm] = useState({
    id: `BATCH-${currentYear}-${String(batches.length + 1).padStart(3, "0")}`,
    sku: products[0]?.sku || "",
    producedQty: 100,
    grossSoldQty: 0,
    returnedQty: 0,
    ageDays: 0,
    status: "Active" as ProductionBatch["status"],
  });

  // Return Form State
  const [returnForm, setReturnForm] = useState({
    orderId: "",
    marketplace: "Myntra" as ReturnRecord["marketplace"],
    sku: products[0]?.sku || "",
    batchId: batches[0]?.id || "",
    returnQty: 1,
    reason: "Size / Fit Issue" as ReturnRecord["reason"],
    condition: "Resaleable (Restocked)" as ReturnRecord["condition"],
    refundAmount: products[0]?.mrp || 1499,
    reverseLogisticsFee: config.defaultReverseLogisticsCost || 45,
  });

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    category: "Factory Salaries",
    amount: 15000,
    vendor: "Local Vendor",
    description: "Factory Operational expense",
    isRecurringMonthly: true,
  });
  const [newCustomCategoryInput, setNewCustomCategoryInput] = useState("");

  // Sale Form State
  const [saleForm, setSaleForm] = useState({
    channel: "Myntra" as SaleRecord["channel"],
    sku: products[0]?.sku || "",
    batchId: batches[0]?.id || "",
    qty: 10,
    salePrice: products[0]?.mrp ? Math.round(products[0].mrp * 0.9) : 1349,
    date: new Date().toISOString().split("T")[0],
  });

  // Toast Helper
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Marketplaces Directory State (initialized from config or defaults)
  const [marketplaces, setMarketplaces] = useState<MarketplaceChannelConfig[]>(
    config.marketplacesConfig && config.marketplacesConfig.length > 0
      ? config.marketplacesConfig
      : defaultMarketplacesConfig,
  );

  // Marketplace Simulator State
  const [simPromoDiscount, setSimPromoDiscount] = useState<number>(10);
  const [isAddChannelModalOpen, setIsAddChannelModalOpen] = useState(false);
  const [newChannelForm, setNewChannelForm] =
    useState<MarketplaceChannelConfig>({
      id: "",
      name: "",
      commissionPct: 18.0,
      fixedFee: 15,
      shippingFee: 70,
      reverseShippingFee: 75,
      expectedReturnsPct: 20,
      gstOnCommissionPct: 18,
      status: "Active",
    });

  const handleUpdateChannel = (
    id: string,
    updates: Partial<MarketplaceChannelConfig>,
  ) => {
    const updated = marketplaces.map((ch) =>
      ch.id === id ? { ...ch, ...updates } : ch,
    );
    setMarketplaces(updated);
    setConfig((prev) => ({ ...prev, marketplacesConfig: updated }));
  };

  const handleToggleChannelStatus = (id: string) => {
    const updated = marketplaces.map((ch) =>
      ch.id === id
        ? {
            ...ch,
            status: (ch.status === "Active" ? "Paused" : "Active") as
              | "Active"
              | "Paused",
          }
        : ch,
    );
    setMarketplaces(updated);
    setConfig((prev) => ({ ...prev, marketplacesConfig: updated }));
  };

  const handleDeleteChannel = (id: string) => {
    const updated = marketplaces.filter((ch) => ch.id !== id);
    setMarketplaces(updated);
    setConfig((prev) => ({ ...prev, marketplacesConfig: updated }));
    showToast("Channel removed from directory.");
  };

  const handleAddChannel = () => {
    if (!newChannelForm.name.trim()) {
      showToast("Please enter a marketplace channel name.", "error");
      return;
    }
    const id =
      newChannelForm.id ||
      newChannelForm.name.toLowerCase().replace(/[^a-z0-9]/g, "-") +
        `-${Date.now().toString().slice(-4)}`;
    const channelToAdd: MarketplaceChannelConfig = {
      ...newChannelForm,
      id,
      name: newChannelForm.name.trim(),
    };
    const updated = [...marketplaces.filter((c) => c.id !== id), channelToAdd];
    setMarketplaces(updated);
    setConfig((prev) => ({ ...prev, marketplacesConfig: updated }));
    setIsAddChannelModalOpen(false);
    setNewChannelForm({
      id: "",
      name: "",
      commissionPct: 18.0,
      fixedFee: 15,
      shippingFee: 70,
      reverseShippingFee: 75,
      expectedReturnsPct: 20,
      gstOnCommissionPct: 18,
      status: "Active",
    });
    showToast(`Added ${channelToAdd.name} to marketplace directory!`);
  };

  const handleApplyChannelPresetToSku = (channel: MarketplaceChannelConfig) => {
    setCostForm((prev) => ({
      ...prev,
      marketplaceCommissionPct: channel.commissionPct,
      logisticsCost: channel.shippingFee,
      reverseLogisticsCost: channel.reverseShippingFee,
      expectedReturnsPct: channel.expectedReturnsPct,
    }));
    showToast(`Applied ${channel.name} rates to active SKU costing!`);
  };

  // Live Costing calculation
  const liveEco = calculateGarmentEconomics({
    fabricQty: Number(costForm.fabricQty) || 0,
    fabricRate: Number(costForm.fabricRate) || 0,
    trimsCost: Number(costForm.trimsCost) || 0,
    cuttingCost: Number(costForm.cuttingCost) || 0,
    stitchingCost: Number(costForm.stitchingCost) || 0,
    finishingCost: Number(costForm.finishingCost) || 0,
    packagingCost: Number(costForm.packagingCost) || 0,
    otherCost: Number(costForm.otherCost) || 0,
    mrp: Number(costForm.mrp) || 0,
    discountPct: Number(costForm.discountPct) || 0,
    gstPct: Number(costForm.gstPct) || 0,
    marketplaceCommissionPct: Number(costForm.marketplaceCommissionPct) || 0,
    logisticsCost: Number(costForm.logisticsCost) || 0,
    reverseLogisticsCost: Number(costForm.reverseLogisticsCost) || 0,
    marketingCost: Number(costForm.marketingCost) || 0,
    pricingMultiplier: Number(costForm.pricingMultiplier) || 2.0,
    expectedReturnsPct: Number(costForm.expectedReturnsPct) || 0,
    targetCogsPct: Number(costForm.targetCogsPct) || 20,
  });

  // Switch active product in Costing Studio
  const handleSelectProduct = (sku: string) => {
    setSelectedSku(sku);
    const p = products.find((item) => item.sku === sku);
    if (p) {
      const productTrimItems: TrimRowItem[] =
        p.trimItems && p.trimItems.length > 0
          ? p.trimItems
          : p.trimsDetail?.items && p.trimsDetail.items.length > 0
            ? p.trimsDetail.items
            : [
                {
                  id: `trim-${p.sku}-1`,
                  type: "zipper",
                  name:
                    p.trimsDetail?.zipperType &&
                    p.trimsDetail.zipperType !== "None"
                      ? p.trimsDetail.zipperType
                      : "Concealed Zipper",
                  quantity: 1,
                  price:
                    p.trimsDetail?.zipperCost ?? Math.round(p.trimsCost * 0.4),
                },
                {
                  id: `trim-${p.sku}-2`,
                  type: "button",
                  name: "Buttons",
                  quantity: 2,
                  price: p.trimsDetail?.buttonsCost
                    ? Math.round(p.trimsDetail.buttonsCost / 2)
                    : Math.round(p.trimsCost * 0.15),
                },
                {
                  id: `trim-${p.sku}-3`,
                  type: "fusing",
                  name: "Fusing Bukram",
                  quantity: 1,
                  price:
                    p.trimsDetail?.fusingLiningCost ??
                    Math.round(p.trimsCost * 0.25),
                },
                {
                  id: `trim-${p.sku}-4`,
                  type: "eyehook",
                  name: "Hook & Bar",
                  quantity: 1,
                  price:
                    p.trimsDetail?.eyeHookCost ?? Math.round(p.trimsCost * 0.1),
                },
              ];

      setCostForm({
        sku: p.sku,
        name: p.name,
        category: p.category,
        fabricType: p.fabricType || "100% Cotton",
        fabricQty: p.fabricQty,
        fabricRate: p.fabricRate,
        trimsCost: p.trimsCost,
        trimItems: productTrimItems,
        trimsDetail: p.trimsDetail || {
          preset: "Custom",
          buttonsCost: Math.round(p.trimsCost * 0.25),
          zipperType: "Concealed Zipper",
          zipperCost: Math.round(p.trimsCost * 0.35),
          fusingLiningCost: Math.round(p.trimsCost * 0.2),
          shoulderPadType: "None",
          shoulderPadCost: 0,
          eyeHookCost: Math.round(p.trimsCost * 0.1),
          labelsAndThreadCost: Math.max(
            1,
            p.trimsCost -
              (Math.round(p.trimsCost * 0.25) +
                Math.round(p.trimsCost * 0.35) +
                Math.round(p.trimsCost * 0.2) +
                Math.round(p.trimsCost * 0.1)),
          ),
        },
        cuttingCost: p.cuttingCost,
        stitchingCost: p.stitchingCost,
        finishingCost: p.finishingCost,
        packagingCost: p.packagingCost,
        otherCost: p.otherCost,
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
        productionRunQty: 100,
        revivedFromSku: p.revivedFromSku || "",
        revivedFromQty: p.revivedFromQty || 0,
        isRevivedVersion: Boolean(p.isRevivedVersion),
        revivalNotes: p.revivalNotes || "",
      });
    }
  };

  // Reset costing form to empty/new style
  const handleNewCostingForm = () => {
    const defaultCat = config.garmentCategories?.[0] || "Westernwear";
    const newSku = `ATQ-${defaultCat.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    setCostForm({
      sku: newSku,
      name: "New Style Sample",
      category: defaultCat,
      fabricType: config.fabricTypes?.[0] || "100% Cotton",
      fabricQty: 1.35,
      fabricRate: config.defaultFabricRate || 180,
      trimsCost: 24,
      trimItems: [...DEFAULT_TRIM_ROW_ITEMS],
      trimsDetail: { ...DEFAULT_TRIMS_DETAIL },
      cuttingCost: config.defaultCutting || 18,
      stitchingCost: config.defaultStitching || 42,
      finishingCost: config.defaultFinishing || 12,
      packagingCost: config.defaultPackaging || 14,
      otherCost: 0,
      mrp: 1499,
      discountPct: 10,
      gstPct: config.defaultGstPct || 5,
      marketplaceCommissionPct: config.defaultMarketplaceCommission || 22.5,
      logisticsCost: config.defaultLogisticsCost || 65,
      reverseLogisticsCost: config.defaultReverseLogisticsCost || 35,
      marketingCost: config.defaultMarketingCost || 45,
      pricingMultiplier: config.defaultPricingMultiplier || 2.0,
      targetCogsPct: config.defaultTargetCogsPct || 20,
      expectedReturnsPct: config.defaultExpectedReturnsPct || 10,
      productionRunQty: 100,
      revivedFromSku: "",
      revivedFromQty: 0,
      isRevivedVersion: false,
      revivalNotes: "",
    });
    setSelectedSku(newSku);
    setActiveTab("costing");
    showToast(`Ready to cost new style ${newSku}`);
  };

  // Save Product Costing
  const handleSaveProduct = async () => {
    if (!costForm.sku.trim() || !costForm.name.trim()) {
      showToast("Please provide both SKU ID and Product Name.", "error");
      return;
    }

    const newProd: Omit<ProductCosting, "id"> = {
      sku: costForm.sku.trim().toUpperCase(),
      name: costForm.name.trim(),
      category: costForm.category,
      fabricType: costForm.fabricType || "100% Cotton",
      marketplaces: ["Myntra", "Amazon", "Flipkart", "Shopify"],
      fabricQty: Number(costForm.fabricQty),
      fabricRate: Number(costForm.fabricRate),
      trimsCost: Number(costForm.trimsCost),
      trimItems: costForm.trimItems,
      trimsDetail: {
        ...costForm.trimsDetail,
        items: costForm.trimItems,
      },
      cuttingCost: Number(costForm.cuttingCost),
      stitchingCost: Number(costForm.stitchingCost),
      finishingCost: Number(costForm.finishingCost),
      packagingCost: Number(costForm.packagingCost),
      otherCost: Number(costForm.otherCost),
      totalCogs: liveEco.totalCogs,
      mrp: Number(costForm.mrp),
      discountPct: Number(costForm.discountPct),
      gstPct: Number(costForm.gstPct),
      marketplaceCommissionPct: Number(costForm.marketplaceCommissionPct),
      logisticsCost: Number(costForm.logisticsCost),
      reverseLogisticsCost: Number(costForm.reverseLogisticsCost),
      marketingCost: Number(costForm.marketingCost),
      pricingMultiplier: Number(costForm.pricingMultiplier),
      targetCogsPct: Number(costForm.targetCogsPct),
      expectedReturnsPct: Number(costForm.expectedReturnsPct),
      recommendedMrp: liveEco.recommendedMrp,
      cogsPct: liveEco.cogsPct,
      cm1: liveEco.cm1,
      cm2: liveEco.cm2,
      cm3: liveEco.cm3,
      status: "Active",
      revivedFromSku: costForm.isRevivedVersion
        ? costForm.revivedFromSku
        : undefined,
      revivedFromQty: costForm.isRevivedVersion
        ? Number(costForm.revivedFromQty)
        : undefined,
      isRevivedVersion: Boolean(costForm.isRevivedVersion),
      revivalNotes: costForm.isRevivedVersion
        ? costForm.revivalNotes
        : undefined,
    };

    const res = await saveProductAction(newProd);
    if (res.success && res.product) {
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.sku === res.product!.sku);
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = res.product!;
          return clone;
        }
        return [res.product!, ...prev];
      });
      setSelectedSku(res.product.sku);
      showToast(`Style ${res.product.sku} costing saved successfully!`);
    } else {
      showToast(
        `Error saving product: ${res.error || "Check inputs"}`,
        "error",
      );
    }
  };

  // Delete Product SKU
  const handleDeleteProduct = async (sku: string) => {
    if (!confirm(`Are you sure you want to delete style ${sku}?`)) return;
    const res = await deleteProductAction(sku);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.sku !== sku));
      if (selectedSku === sku) {
        setSelectedSku(products[0]?.sku || "");
      }
      showToast(`Style ${sku} deleted.`);
    } else {
      showToast("Failed to delete style.", "error");
    }
  };

  // Open Revival Modal for a Dead SKU
  const handleOpenRevivalModal = (skuId: string, customQty?: number) => {
    const p = products.find((prod) => prod.sku === skuId);
    const relatedBatches = batches.filter(
      (b) => b.sku === skuId && b.status !== "Active",
    );
    const totalDeadPieces =
      customQty ??
      (relatedBatches.reduce((acc, b) => acc + b.onHandQty, 0) || 50);

    const baseName =
      p?.name || relatedBatches[0]?.productName || "Garment Style";
    const suggestedNewSku = `${skuId}-REV`;
    const suggestedNewName = `${baseName} (Revived Remake)`;

    setRevivalForm({
      originSku: skuId,
      originName: baseName,
      originCategory: p?.category || "Westernwear",
      originFabricType: p?.fabricType || "100% Cotton",
      originFabricQty: p?.fabricQty || 1.35,
      originFabricRate: p?.fabricRate || 180,
      originTrimsCost: p?.trimsCost || 24,
      originCuttingCost: p?.cuttingCost || 18,
      originStitchingCost: p?.stitchingCost || 42,
      originFinishingCost: p?.finishingCost || 12,
      originPackagingCost: p?.packagingCost || 14,
      originOtherCost: p?.otherCost || 0,
      originMrp: p?.mrp || 1499,
      originTrimItems:
        p?.trimItems && p.trimItems.length > 0
          ? [...p.trimItems]
          : [...DEFAULT_TRIM_ROW_ITEMS],
      piecesAvailable: totalDeadPieces,
      newSku: suggestedNewSku,
      newName: suggestedNewName,
      reworkAdditionalCost: 35,
      newMrp: p?.mrp || 1499,
      revivalNotes: `Recreated ${totalDeadPieces} pieces from dead stock ${skuId} with updated trims and design overhaul.`,
    });
    setShowRevivalModal(true);
  };

  // Launch and customize in Costing Studio
  const handleReviveInCostingStudio = () => {
    if (!revivalForm.newSku.trim() || !revivalForm.newName.trim()) {
      showToast("Please provide both New SKU ID and Style Name.", "error");
      return;
    }

    setCostForm((prev) => ({
      ...prev,
      sku: revivalForm.newSku.trim().toUpperCase(),
      name: revivalForm.newName.trim(),
      category: revivalForm.originCategory,
      fabricType: revivalForm.originFabricType,
      fabricQty: revivalForm.originFabricQty,
      fabricRate: revivalForm.originFabricRate,
      trimsCost: revivalForm.originTrimsCost,
      trimItems: revivalForm.originTrimItems,
      cuttingCost: revivalForm.originCuttingCost,
      stitchingCost: revivalForm.originStitchingCost,
      finishingCost: revivalForm.originFinishingCost,
      packagingCost: revivalForm.originPackagingCost,
      otherCost: Number(revivalForm.reworkAdditionalCost) || 0,
      mrp: Number(revivalForm.newMrp) || revivalForm.originMrp,
      productionRunQty: Number(revivalForm.piecesAvailable) || 50,
      isRevivedVersion: true,
      revivedFromSku: revivalForm.originSku,
      revivedFromQty: Number(revivalForm.piecesAvailable) || 50,
      revivalNotes: revivalForm.revivalNotes,
    }));

    setSelectedSku(revivalForm.newSku.trim().toUpperCase());
    setShowRevivalModal(false);
    setActiveTab("costing");
    showToast(
      `Revived SKU ${revivalForm.newSku} loaded in Costing Studio with Dead SKU tag!`,
    );
  };

  // Instant Save and Launch Revived SKU
  const handleInstantSaveRevivedSku = async () => {
    if (!revivalForm.newSku.trim() || !revivalForm.newName.trim()) {
      showToast("Please provide both New SKU ID and Style Name.", "error");
      return;
    }

    const reworkCost = Number(revivalForm.reworkAdditionalCost) || 0;
    const piecesQty = Number(revivalForm.piecesAvailable) || 50;

    const newProd: Omit<ProductCosting, "id"> = {
      sku: revivalForm.newSku.trim().toUpperCase(),
      name: revivalForm.newName.trim(),
      category: revivalForm.originCategory,
      fabricType: revivalForm.originFabricType,
      marketplaces: ["Myntra", "Amazon", "Flipkart", "Shopify"],
      fabricQty: revivalForm.originFabricQty,
      fabricRate: revivalForm.originFabricRate,
      trimsCost: revivalForm.originTrimsCost,
      trimItems: revivalForm.originTrimItems,
      cuttingCost: revivalForm.originCuttingCost,
      stitchingCost: revivalForm.originStitchingCost,
      finishingCost: revivalForm.originFinishingCost,
      packagingCost: revivalForm.originPackagingCost,
      otherCost: reworkCost,
      totalCogs:
        revivalForm.originFabricQty * revivalForm.originFabricRate +
        revivalForm.originTrimsCost +
        revivalForm.originCuttingCost +
        revivalForm.originStitchingCost +
        revivalForm.originFinishingCost +
        revivalForm.originPackagingCost +
        reworkCost,
      mrp: Number(revivalForm.newMrp) || revivalForm.originMrp,
      discountPct: 10,
      gstPct: 5,
      marketplaceCommissionPct: 22.5,
      logisticsCost: 65,
      reverseLogisticsCost: 35,
      marketingCost: 45,
      pricingMultiplier: 2.0,
      targetCogsPct: 20,
      expectedReturnsPct: 10,
      recommendedMrp: Number(revivalForm.newMrp) || revivalForm.originMrp,
      cogsPct: 25,
      cm1: (Number(revivalForm.newMrp) || 1499) * 0.85,
      cm2: 500,
      cm3: 390,
      status: "Active",
      isRevivedVersion: true,
      revivedFromSku: revivalForm.originSku,
      revivedFromQty: piecesQty,
      revivalNotes: revivalForm.revivalNotes,
    };

    const res = await saveProductAction(newProd);
    if (res.success && res.product) {
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.sku === res.product!.sku);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = res.product!;
          return updated;
        }
        return [res.product!, ...prev];
      });

      // Also create a fresh Production Batch for the recreated 50 pieces!
      const newBatchId = `BATCH-${new Date().getFullYear()}-${String(batches.length + 1).padStart(3, "0")}`;
      const batchRes = await addBatchAction({
        id: newBatchId,
        sku: res.product.sku,
        productName: res.product.name,
        producedQty: piecesQty,
        grossSoldQty: 0,
        returnedQty: 0,
        netSoldQty: 0,
        onHandQty: piecesQty,
        ageDays: 1,
        status: "Active",
        unitCogs: res.product.totalCogs,
        blockedCapital: res.product.totalCogs * piecesQty,
        liquidationPrice: Math.round(res.product.totalCogs * 0.75),
        productionDate: new Date().toISOString().split("T")[0],
      });

      if (batchRes.success && batchRes.batch) {
        setBatches((prev) => [batchRes.batch!, ...prev]);
      }

      setShowRevivalModal(false);
      showToast(
        `🎉 Successfully created Revived SKU ${res.product.sku} (${piecesQty} pcs remade from ${revivalForm.originSku})!`,
      );
      setActiveTab("skus");
    } else {
      showToast(res.error || "Failed to save revived SKU.", "error");
    }
  };

  // Add Batch
  const handleAddBatch = async () => {
    if (!batchForm.sku) {
      showToast("Please choose a garment style for this batch.", "error");
      return;
    }
    const linkedProd = products.find((p) => p.sku === batchForm.sku);
    const unitCogs = linkedProd ? linkedProd.totalCogs : liveEco.totalCogs;
    const netSold = Math.max(0, batchForm.grossSoldQty - batchForm.returnedQty);
    const onHand = Math.max(0, batchForm.producedQty - netSold);

    const newBatch: ProductionBatch = {
      id: batchForm.id.trim().toUpperCase(),
      sku: batchForm.sku,
      productName: linkedProd?.name || "Garment Style",
      producedQty: Number(batchForm.producedQty) || 1,
      grossSoldQty: Number(batchForm.grossSoldQty) || 0,
      returnedQty: Number(batchForm.returnedQty) || 0,
      netSoldQty: netSold,
      onHandQty: onHand,
      ageDays: Number(batchForm.ageDays) || 0,
      unitCogs: unitCogs,
      blockedCapital: onHand * unitCogs,
      status: batchForm.status,
      liquidationPrice: Math.round(unitCogs * 0.75),
      productionDate: new Date().toISOString().split("T")[0],
    };

    const res = await addBatchAction(newBatch);
    if (res.success) {
      setBatches((prev) => [newBatch, ...prev]);
      setBatchForm({
        id: `BATCH-${currentYear}-${String(batches.length + 2).padStart(3, "0")}`,
        sku: products[0]?.sku || "",
        producedQty: 100,
        grossSoldQty: 0,
        returnedQty: 0,
        ageDays: 0,
        status: "Active",
      });
      showToast(`Batch ${newBatch.id} logged into register!`);
    } else {
      showToast("Error adding batch.", "error");
    }
  };

  // Delete Batch
  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm(`Delete batch ${batchId}?`)) return;
    const res = await deleteBatchAction(batchId);
    if (res.success) {
      setBatches((prev) => prev.filter((b) => b.id !== batchId));
      showToast(`Batch ${batchId} deleted.`);
    } else {
      showToast("Failed to delete batch.", "error");
    }
  };

  // Change Batch Status (Liquidation / Dead Stock Action)
  const handleUpdateBatchStatus = async (
    batchId: string,
    status: ProductionBatch["status"],
    price?: number,
  ) => {
    const res = await updateBatchStatusAction(batchId, status, price);
    if (res.success) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === batchId
            ? {
                ...b,
                status,
                ...(price !== undefined ? { liquidationPrice: price } : {}),
              }
            : b,
        ),
      );
      showToast(`Batch ${batchId} updated to ${status}!`);
    } else {
      showToast("Error updating batch.", "error");
    }
  };

  // Add Return
  const handleAddReturn = async () => {
    if (!returnForm.sku) {
      showToast("Please select SKU for return.", "error");
      return;
    }
    const returnItem: ReturnRecord = {
      id: `RET-${Date.now().toString().slice(-5)}`,
      orderId:
        returnForm.orderId.trim() ||
        `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      marketplace: returnForm.marketplace,
      sku: returnForm.sku,
      batchId: returnForm.batchId,
      returnQty: Number(returnForm.returnQty) || 1,
      reason: returnForm.reason,
      condition: returnForm.condition,
      refundAmount: Number(returnForm.refundAmount) || 0,
      reverseLogisticsFee: Number(returnForm.reverseLogisticsFee) || 45,
      date: new Date().toISOString().split("T")[0],
    };

    const res = await addReturnAction(returnItem);
    if (res.success) {
      setReturns((prev) => [returnItem, ...prev]);
      // Also update linked batch in local state if resaleable
      if (returnItem.condition.includes("Resaleable") && returnItem.batchId) {
        setBatches((prev) =>
          prev.map((b) => {
            if (b.id === returnItem.batchId) {
              const newRet = b.returnedQty + returnItem.returnQty;
              const newNet = Math.max(0, b.grossSoldQty - newRet);
              const newHand = Math.max(0, b.producedQty - newNet);
              return {
                ...b,
                returnedQty: newRet,
                netSoldQty: newNet,
                onHandQty: newHand,
                blockedCapital: newHand * b.unitCogs,
              };
            }
            return b;
          }),
        );
      }
      showToast(`Return logged for ${returnItem.sku}! Stock updated.`);
      setReturnForm((prev) => ({ ...prev, orderId: "", returnQty: 1 }));
    } else {
      showToast("Error saving return.", "error");
    }
  };

  // Delete Return
  const handleDeleteReturn = async (id: string) => {
    if (!confirm("Delete this return record?")) return;
    const res = await deleteReturnAction(id);
    if (res.success) {
      setReturns((prev) => prev.filter((r) => r.id !== id));
      showToast("Return record removed.");
    } else {
      showToast("Failed to delete return.", "error");
    }
  };

  // Add Expense
  const handleAddExpense = async () => {
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      showToast("Please enter a valid expense amount.", "error");
      return;
    }
    const expItem: ExpenseRecord = {
      id: `EXP-${Date.now().toString().slice(-6)}`,
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      date: new Date().toISOString().split("T")[0],
      vendor: expenseForm.vendor.trim() || "Vendor",
      description: expenseForm.description.trim() || "Operational expense",
      isRecurringMonthly: expenseForm.isRecurringMonthly,
    };

    const res = await addExpenseAction(expItem);
    if (res.success) {
      setExpenses((prev) => [expItem, ...prev]);
      showToast(`Expense of ${formatINR(expItem.amount)} logged!`);
      setExpenseForm((prev) => ({ ...prev, amount: 0, description: "" }));
    } else {
      showToast("Failed to add expense.", "error");
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Delete this expense entry?")) return;
    const res = await deleteExpenseAction(id);
    if (res.success) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast("Expense removed.");
    } else {
      showToast("Failed to delete expense.", "error");
    }
  };

  // Add Custom Category
  const handleAddCustomCategory = async () => {
    if (!newCustomCategoryInput.trim()) return;
    const res = await addExpenseCategoryAction(newCustomCategoryInput.trim());
    if (res.success && res.categories) {
      setConfig((prev) => ({
        ...prev,
        customExpenseCategories: res.categories,
      }));
      setExpenseForm((prev) => ({
        ...prev,
        category: newCustomCategoryInput.trim(),
      }));
      setNewCustomCategoryInput("");
      showToast(`Added category: ${newCustomCategoryInput.trim()}`);
    } else {
      showToast("Could not add category.", "error");
    }
  };

  // Add Sale
  const handleAddSale = async () => {
    if (!saleForm.sku || saleForm.qty <= 0) {
      showToast("Please select a SKU and valid quantity sold.", "error");
      return;
    }
    const p = products.find((prod) => prod.sku === saleForm.sku);
    const gross = saleForm.qty * saleForm.salePrice;
    const returnDeduction = p
      ? Math.round(gross * (p.expectedReturnsPct / 100))
      : 0;
    const net = gross - returnDeduction;

    const newSale: SaleRecord = {
      id: `SALE-${Date.now().toString().slice(-5)}`,
      date: saleForm.date,
      channel: saleForm.channel,
      sku: saleForm.sku,
      productName: p?.name || "Garment Style",
      batchId: saleForm.batchId || undefined,
      qty: Number(saleForm.qty),
      salePrice: Number(saleForm.salePrice),
      grossRevenue: gross,
      returnDeduction: returnDeduction,
      netRevenue: net,
    };

    const res = await addSaleAction(newSale);
    if (res.success && res.sale) {
      setSales((prev) => [res.sale!, ...prev]);
      if (saleForm.batchId) {
        setBatches((prev) =>
          prev.map((b) => {
            if (b.id === saleForm.batchId) {
              const newSold = b.grossSoldQty + Number(saleForm.qty);
              const newNet = Math.max(0, newSold - b.returnedQty);
              const newHand = Math.max(0, b.producedQty - newNet);
              return {
                ...b,
                grossSoldQty: newSold,
                netSoldQty: newNet,
                onHandQty: newHand,
                blockedCapital: newHand * b.unitCogs,
              };
            }
            return b;
          }),
        );
      }
      showToast(`Logged sale of ${newSale.qty} pcs on ${newSale.channel}!`);
    } else {
      showToast("Error recording sale.", "error");
    }
  };

  // Delete Sale
  const handleDeleteSale = async (id: string) => {
    if (!confirm("Delete this sale record?")) return;
    const res = await deleteSaleAction(id);
    if (res.success) {
      setSales((prev) => prev.filter((s) => s.id !== id));
      showToast("Sale record removed.");
    } else {
      showToast("Failed to delete sale.", "error");
    }
  };

  // Save Settings Config
  const handleSaveConfig = async () => {
    const res = await saveConfigAction(config);
    if (res.success) {
      showToast("Master settings saved! Applies to new calculations.");
    } else {
      showToast("Error saving configuration.", "error");
    }
  };

  // -------------------------------------------------------------
  // AGGREGATE CALCULATIONS
  // -------------------------------------------------------------
  const totalStockOnHand = batches.reduce((acc, b) => acc + b.onHandQty, 0);
  const totalBlockedCapital = batches.reduce(
    (acc, b) => acc + b.blockedCapital,
    0,
  );
  const avgCogsPct =
    products.length > 0
      ? products.reduce((acc, p) => acc + p.cogsPct, 0) / products.length
      : 0;

  const atRiskBatches = batches.filter(
    (b) =>
      b.status === "Ageing" ||
      b.status === "Liquidation" ||
      b.status === "Dead stock",
  );
  const atRiskQty = atRiskBatches.reduce((acc, b) => acc + b.onHandQty, 0);
  const atRiskVal = atRiskBatches.reduce(
    (acc, b) => acc + b.blockedCapital,
    0,
  );

  // Aggregated Dead & At-Risk SKUs for Inspection & Revival Studio
  const deadSkusList = useMemo(() => {
    const list: {
      sku: string;
      productName: string;
      category: string;
      fabricType: string;
      onHandQty: number;
      blockedCapital: number;
      ageDays: number;
      status: ProductionBatch["status"];
      batchIds: string[];
      product?: ProductCosting;
      batches: ProductionBatch[];
    }[] = [];

    const map = new Map<string, ProductionBatch[]>();
    atRiskBatches.forEach((b) => {
      const arr = map.get(b.sku) || [];
      arr.push(b);
      map.set(b.sku, arr);
    });

    map.forEach((bList, sku) => {
      const p = products.find((prod) => prod.sku === sku);
      const totalQty = bList.reduce((acc, b) => acc + b.onHandQty, 0);
      const totalCap = bList.reduce((acc, b) => acc + b.blockedCapital, 0);
      const maxAge = Math.max(...bList.map((b) => b.ageDays));
      const worstStatus = bList.some((b) => b.status === "Dead stock")
        ? ("Dead stock" as const)
        : bList.some((b) => b.status === "Liquidation")
          ? ("Liquidation" as const)
          : ("Ageing" as const);

      list.push({
        sku,
        productName: p?.name || bList[0]?.productName || "Unknown Style",
        category: p?.category || "Apparel",
        fabricType: p?.fabricType || "100% Cotton",
        onHandQty: totalQty,
        blockedCapital: totalCap,
        ageDays: maxAge,
        status: worstStatus,
        batchIds: bList.map((b) => b.id),
        product: p,
        batches: bList,
      });
    });

    return list.sort((a, b) => b.blockedCapital - a.blockedCapital);
  }, [atRiskBatches, products]);

  // Selected Dead SKU for deep details inspection
  const activeInspectedDeadSku = useMemo(() => {
    if (!selectedDeadSkuForDetails) {
      return deadSkusList[0] || null;
    }
    return (
      deadSkusList.find((d) => d.sku === selectedDeadSkuForDetails) ||
      deadSkusList[0] ||
      null
    );
  }, [deadSkusList, selectedDeadSkuForDetails]);

  const carryingRate = (config.defaultCarryingCostPct || 18) / 100;
  const monthlyBleed = Math.round((totalBlockedCapital * carryingRate) / 12);

  const totalMonthlyOverheads =
    Number(config.monthlySalary || 0) +
    Number(config.monthlyRent || 0) +
    Number(config.monthlyElectricity || 0) +
    Number(config.monthlyOther || 0);

  // Filtered Sales by Time Period
  const filteredSales = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentMonthPrefix = today.substring(0, 7); // YYYY-MM
    const currentYearPrefix = today.substring(0, 4); // YYYY

    return sales.filter((s) => {
      if (timePeriod === "today") return s.date === today;
      if (timePeriod === "month") return s.date.startsWith(currentMonthPrefix);
      if (timePeriod === "year") return s.date.startsWith(currentYearPrefix);
      return true; // all
    });
  }, [sales, timePeriod]);

  const totalGrossRevenue = filteredSales.reduce(
    (acc, s) => acc + s.grossRevenue,
    0,
  );
  const totalReturnDeduction = filteredSales.reduce(
    (acc, s) => acc + s.returnDeduction,
    0,
  );
  const totalNetRevenue = filteredSales.reduce(
    (acc, s) => acc + s.netRevenue,
    0,
  );
  const totalUnitsSold = filteredSales.reduce((acc, s) => acc + s.qty, 0);

  // Total Gross Contribution (CM2) from net delivered units
  const totalProductGrossCM2 = batches.reduce((acc, b) => {
    const p = products.find((prod) => prod.sku === b.sku);
    return acc + (p ? p.cm2 * b.netSoldQty : 0);
  }, 0);

  // True Net Profit (CM2 - Overheads)
  const trueNetProfit = totalProductGrossCM2 - totalMonthlyOverheads;

  // Logistics Analysis
  const totalForwardCourierSpend = sales.reduce((acc, s) => {
    const p = products.find((prod) => prod.sku === s.sku);
    return acc + (p ? p.logisticsCost * s.qty : 65 * s.qty);
  }, 0);
  const totalReverseCourierSpend = returns.reduce(
    (acc, r) => acc + (r.reverseLogisticsFee || 45),
    0,
  );
  const totalReturnRefundSpend = returns.reduce(
    (acc, r) => acc + (r.refundAmount || 0),
    0,
  );

  // Selected Liquidation Batch Object
  const selectedLiqBatch =
    batches.find((b) => b.id === selectedLiquidationBatchId) ||
    atRiskBatches[0] ||
    batches[0];
  const targetRecoveryPrice = selectedLiqBatch
    ? Math.round(selectedLiqBatch.unitCogs * (liquidationRecoveryPct / 100))
    : 0;
  const projectedRecoveryRupees = selectedLiqBatch
    ? targetRecoveryPrice * selectedLiqBatch.onHandQty
    : 0;
  const projectedLossVsCost = selectedLiqBatch
    ? selectedLiqBatch.blockedCapital - projectedRecoveryRupees
    : 0;

  // Export Complete Profit & Loss Report to Excel (.xlsx)
  const handleExportPnLToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // 1. P&L Executive Summary Sheet
      const netDeliveredGarments = batches.reduce((a, b) => a + b.netSoldQty, 0);
      const summaryData = [
        ["Generated On", new Date().toLocaleString("en-IN")],
        ["Reporting Period", currentMonthYearName],
        [],
        ["EXECUTIVE METRICS", "VALUE", "NOTES"],
        ["Net Delivered Garments", netDeliveredGarments, "Garments kept by end customers"],
        ["Total Product Gross Margin (CM2)", totalProductGrossCM2, "Delivered units gross contribution before factory overheads"],
        ["Fixed Factory Overhead Burn", totalMonthlyOverheads, "Salaries, Rent, Power & Misc"],
        ["True Net Factory Profit", trueNetProfit, trueNetProfit >= 0 ? "Cash Surplus ✓" : "Factory in Net Burn ⚠"],
        [],
        ["SALES & REVENUE SUMMARY", "VALUE", "NOTES"],
        ["Gross Sales Revenue", totalGrossRevenue, "Total sales value booked"],
        ["Return Deductions & Logistics", totalReturnDeduction, "Returns, RTO losses & reverse shipping"],
        ["Net Revenue Realised", totalNetRevenue, "Final realised revenue"],
        ["Total Units Sold", totalUnitsSold, "Volume sold in selected period"],
        [],
        ["FACTORY OVERHEAD BUDGETS (MONTHLY)", "BUDGET (INR)"],
        ["Monthly Salaries & Wages", Number(config.monthlySalary || 0)],
        ["Monthly Factory Rent", Number(config.monthlyRent || 0)],
        ["Monthly Electricity & Power", Number(config.monthlyElectricity || 0)],
        ["Monthly Miscellaneous / Other", Number(config.monthlyOther || 0)],
        ["Total Monthly Overhead Budget", totalMonthlyOverheads],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary["!cols"] = [{ wch: 36 }, { wch: 22 }, { wch: 48 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "P&L Summary");

      // 2. SKU-Wise Profitability Breakdown
      const skuHeaders = [
        "Style SKU",
        "Style Name",
        "Garment Category",
        "MRP (₹)",
        "Making Cost / COGS (₹)",
        "CM1 Realisation (₹)",
        "CM2 Gross (₹)",
        "CM3 Pocket Cash (₹)",
        "Margin %",
        "Profitability Status",
      ];

      const skuRows = products.map((p) => {
        const marginPct = p.mrp ? (p.cm3 / p.mrp) * 100 : 0;
        const status =
          marginPct >= 15
            ? "High Margin (>15%)"
            : marginPct >= 5
              ? "Healthy Margin (5-15%)"
              : marginPct >= 0
                ? "Thin Margin (0-5%)"
                : "Loss Making (<0%)";

        return [
          p.sku,
          p.name,
          p.category,
          p.mrp,
          p.totalCogs,
          p.cm1,
          p.cm2,
          p.cm3,
          Number(marginPct.toFixed(2)),
          status,
        ];
      });

      const wsSku = XLSX.utils.aoa_to_sheet([
        ["SKU-WISE PROFITABILITY BREAKDOWN & UNIT ECONOMICS"],
        ["Report Period", currentMonthYearName],
        [],
        skuHeaders,
        ...skuRows,
      ]);
      wsSku["!cols"] = [
        { wch: 18 },
        { wch: 28 },
        { wch: 18 },
        { wch: 12 },
        { wch: 22 },
        { wch: 18 },
        { wch: 16 },
        { wch: 18 },
        { wch: 12 },
        { wch: 24 },
      ];
      XLSX.utils.book_append_sheet(wb, wsSku, "SKU Profitability");

      // 3. Factory Expenses & Overheads
      const expenseHeaders = [
        "Date",
        "Expense Category",
        "Description",
        "Vendor / Payee",
        "Amount (₹)",
        "Recurring Monthly",
      ];
      const expenseRows = expenses.map((e) => [
        e.date,
        e.category,
        e.description || "-",
        e.vendor || "-",
        e.amount,
        e.isRecurringMonthly ? "Yes" : "No",
      ]);

      const wsExpenses = XLSX.utils.aoa_to_sheet([
        ["FACTORY OVERHEAD EXPENSES LOG"],
        ["Monthly Fixed Target Burn", totalMonthlyOverheads],
        [],
        expenseHeaders,
        ...expenseRows,
      ]);
      wsExpenses["!cols"] = [
        { wch: 14 },
        { wch: 22 },
        { wch: 32 },
        { wch: 20 },
        { wch: 14 },
        { wch: 18 },
      ];
      XLSX.utils.book_append_sheet(wb, wsExpenses, "Factory Overheads");

      // Trigger instant browser download
      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `Atiq_Studio_PnL_Report_${dateStr}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setToast({
        message: `P&L Report exported to Excel (${fileName}) successfully!`,
        type: "success",
      });
    } catch (err: unknown) {
      console.error("Failed to export Excel report:", err);
      setToast({
        message: "Failed to export Excel file. Please try again.",
        type: "error",
      });
    }
  };

  // Navigation Items
  const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard, tag: "Pulse" },
    {
      id: "costing",
      label: "Costing Studio",
      icon: Calculator,
      tag: "P0 Core",
    },
    {
      id: "revenue",
      label: "Revenue Timeline",
      icon: DollarSign,
      tag: "Daily/Mo",
    },
    {
      id: "profitability",
      label: "Profit & Loss",
      icon: TrendingUp,
      tag: "Reports",
    },
    {
      id: "stock_top",
      label: "Stock Overview",
      icon: Layers,
      tag: `${batches.length} Batches`,
    },
    { id: "batches", label: "Batch Register", icon: Shirt, tag: "Inventory" },
    {
      id: "liquidation",
      label: "Dead Stock Risk",
      icon: PackageX,
      tag: `${atRiskBatches.length} At Risk`,
    },
    {
      id: "dead_revival",
      label: "Dead SKU Revival",
      icon: Sparkles,
      tag: "Remake",
    },
    {
      id: "returns",
      label: "Returns Watch",
      icon: RotateCcw,
      tag: `${returns.length} Logs`,
    },
    { id: "logistics", label: "Logistics Watch", icon: Truck, tag: "Couriers" },
    {
      id: "expenses",
      label: "Factory Expenses",
      icon: Receipt,
      tag: "Overheads",
    },
    {
      id: "skus",
      label: "Style Catalog",
      icon: Shirt,
      tag: `${products.length} SKUs`,
    },
    { id: "settings", label: "Settings", icon: Settings, tag: "Admin" },
  ];

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#f5f6f8] text-[#17202d] font-sans antialiased">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-sm transition-all duration-300 ${
            toast.type === "success"
              ? "bg-[#111c2d] text-white border-[#c58b4b]/40"
              : "bg-[#7f1d1d] text-white border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#c58b4b]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-300" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-35 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111c2d] text-white flex flex-col transition-transform duration-200 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#223147]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c58b4b] text-[#111c2d] flex items-center justify-center font-black text-lg shadow-sm">
              {(config.businessName || "A")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white uppercase">
                {config.businessName || "ATIQ STUDIO"}
              </h1>
              <p className="text-[10px] text-[#9eabba] uppercase tracking-wider">
                Garment CRM
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-[#9eabba] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="px-4 py-2.5 text-[10px] font-bold text-[#8290a2] uppercase tracking-widest">
          Garment Operations
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#26354b] text-white shadow-xs font-semibold"
                    : "text-[#b8c2d0] hover:bg-[#1a273b] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-[#c58b4b]" : "text-[#7e8c9f]"}`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.tag && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-[#c58b4b] text-[#111c2d] font-bold"
                        : "bg-[#1c293d] text-[#8e9cae]"
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-[#223147] bg-[#0c1421]/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f5eadc] text-[#815b31] font-bold flex items-center justify-center text-xs">
              {(config.ownerName || "A")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {config.ownerName || "Atiq"} (Owner)
              </p>
              <p className="text-[10px] text-[#64d7a9] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#64d7a9] animate-pulse"></span>
                Database Connected
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden md:pl-64">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#e7eaf0] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs text-[#748092] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`font-semibold transition-colors hover:text-[#c58b4b] ${
                  activeTab === "dashboard"
                    ? "text-[#17202d] font-bold"
                    : "text-[#748092]"
                }`}
              >
                Studio Overview
              </button>
              {activeTab !== "dashboard" && (
                <>
                  <span>/</span>
                  <span className="font-bold text-[#17202d] capitalize">
                    {navItems.find((n) => n.id === activeTab)?.label}
                  </span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Tab Pages */}
        <main className="p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6 min-w-0 overflow-x-hidden">
          {/* ======================================================== */}
          {/* MODULE 1: DASHBOARD (OVERVIEW)                            */}
          {/* ======================================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Header Greeting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    Garment Business Health Pulse
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17202d]">
                    Welcome, {config.ownerName || "Atiq"}. Here is your cost &
                    stock situation.
                  </h2>
                  <p className="text-xs text-[#748092] mt-0.5">
                    Clear visibility into sample costs, unsold batch exposure,
                    and net in-pocket cash.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("liquidation")}
                    className="px-3 py-2 bg-white border border-[#e7eaf0] text-xs font-semibold rounded-lg text-[#17202d] hover:bg-gray-50 shadow-2xs"
                  >
                    Check Stock Risk ({atRiskBatches.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("revenue")}
                    className="px-3 py-2 bg-[#c58b4b] text-[#111c2d] text-xs font-bold rounded-lg hover:bg-[#b57a39] shadow-xs"
                  >
                    + Log Daily Sales
                  </button>
                </div>
              </div>

              {/* Top 4 KPI Cards (Redirectable to Source Modules) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Costed SKUs -> Costing Studio */}
                <div
                  onClick={() => setActiveTab("skus")}
                  className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs hover:border-[#c58b4b] hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                  title="Click to open Costing Studio"
                >
                  <div>
                    <div className="flex items-center justify-between text-[#748092] text-xs font-medium">
                      <span>Styles Costed</span>
                      <Shirt className="w-4 h-4 text-[#c58b4b] group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-extrabold text-[#17202d] mt-2">
                      {products.length}
                    </div>
                    <div className="text-[11px] text-[#748092] mt-1 flex items-center gap-1">
                      <span className="text-[#16835d] font-semibold">
                        Active Catalog
                      </span>
                      <span>· ready for sampling</span>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#f0f2f5] flex items-center justify-between text-[11px] font-bold text-[#c58b4b] group-hover:text-[#a56f35]">
                    <span>Open Costing Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* KPI 2: Target COGS % -> Costing Studio */}
                <div
                  onClick={() => setActiveTab("costing")}
                  className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs hover:border-[#c58b4b] hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                  title="Click to review Garment Economics & Benchmarks"
                >
                  <div>
                    <div className="flex items-center justify-between text-[#748092] text-xs font-medium">
                      <span>Average Making Cost / MRP</span>
                      <Percent className="w-4 h-4 text-[#c58b4b] group-hover:scale-110 transition-transform" />
                    </div>
                    <div
                      className={`text-2xl font-extrabold mt-2 ${
                        avgCogsPct <= (config.defaultTargetCogsPct || 20)
                          ? "text-[#16835d]"
                          : "text-[#c44e4e]"
                      }`}
                    >
                      {formatPct(avgCogsPct)}
                    </div>
                    <div className="text-[11px] text-[#748092] mt-1">
                      {avgCogsPct <= (config.defaultTargetCogsPct || 20) ? (
                        <span className="text-[#16835d] font-semibold">
                          ✓ Meets {config.defaultTargetCogsPct || 20}% target
                        </span>
                      ) : (
                        <span className="text-[#c44e4e] font-semibold">
                          ⚠ Exceeds {config.defaultTargetCogsPct || 20}% target
                          ceiling
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#f0f2f5] flex items-center justify-between text-[11px] font-bold text-[#c58b4b] group-hover:text-[#a56f35]">
                    <span>Check Target Economics</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* KPI 3: Stock On-Hand -> Stock Overview */}
                <div
                  onClick={() => setActiveTab("stock_top")}
                  className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs hover:border-[#c58b4b] hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                  title="Click to view Stock-Wise Valuation"
                >
                  <div>
                    <div className="flex items-center justify-between text-[#748092] text-xs font-medium">
                      <span>Warehouse Stock On-Hand</span>
                      <Layers className="w-4 h-4 text-[#c58b4b] group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-extrabold text-[#17202d] mt-2">
                      {totalStockOnHand} pcs
                    </div>
                    <div className="text-[11px] text-[#748092] mt-1 flex items-center gap-1">
                      <span className="text-[#a66a1d] font-semibold">
                        {atRiskQty} pcs at risk
                      </span>
                      <span>(&gt;{config.ageThresholdActive || 30} days)</span>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#f0f2f5] flex items-center justify-between text-[11px] font-bold text-[#c58b4b] group-hover:text-[#a56f35]">
                    <span>Inspect Stock Valuation</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* KPI 4: Blocked Capital -> Dead Stock & Liquidation */}
                <div
                  onClick={() => setActiveTab("liquidation")}
                  className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs hover:border-red-400 hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                  title="Click to manage Dead Stock & Liquidation"
                >
                  <div>
                    <div className="flex items-center justify-between text-[#748092] text-xs font-medium">
                      <span className="flex items-center gap-1.5">
                        <span>Blocked Capital at Cost</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeadStockInfoModal(true);
                          }}
                          className="text-gray-400 hover:text-[#c58b4b] transition-colors p-0.5"
                          title="View Dead Stock Ageing Policy & Conditions"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </span>
                      <Building2 className="w-4 h-4 text-[#c44e4e] group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-extrabold text-[#c44e4e] mt-2">
                      {formatINR(totalBlockedCapital, true)}
                    </div>
                    <div className="text-[11px] text-[#748092] mt-1">
                      <span>
                        Bleeding ~{formatINR(monthlyBleed)}/mo at{" "}
                        {config.defaultCarryingCostPct || 18}%/yr
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#f0f2f5] flex items-center justify-between text-[11px] font-bold text-[#c44e4e] group-hover:text-red-700">
                    <span>Act on Dead Stock</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Middle 2 Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Cost Breakdown */}
                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#17202d]">
                        Cost Structure: {activeProduct?.name || "Everyday Tee"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab("costing")}
                        className="text-[11px] font-semibold bg-[#f5eadc] hover:bg-[#ebd8c0] text-[#815b31] px-2.5 py-1 rounded-md transition flex items-center gap-1"
                        title="Click to edit BOM in Costing Studio"
                      >
                        <span>Making Cost: {formatINR(liveEco.totalCogs)}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-[#748092] mt-1">
                      Direct per-piece making costs for this garment before
                      platform deductions.
                    </p>

                    <div className="space-y-3 mt-5">
                      {[
                        {
                          label: "Fabric (Kapda)",
                          val: liveEco.fabricCost,
                          color: "bg-[#111c2d]",
                        },
                        {
                          label: "Trims & Buttons",
                          val: costForm.trimsCost,
                          color: "bg-[#c58b4b]",
                        },
                        {
                          label: "Cutting Masterji",
                          val: costForm.cuttingCost,
                          color: "bg-[#2563eb]",
                        },
                        {
                          label: "Stitching / Silai",
                          val: costForm.stitchingCost,
                          color: "bg-[#16835d]",
                        },
                        {
                          label: "Finishing & QC",
                          val: costForm.finishingCost,
                          color: "bg-[#748092]",
                        },
                        {
                          label: "Packaging & Bag",
                          val: costForm.packagingCost + costForm.otherCost,
                          color: "bg-[#d97706]",
                        },
                      ].map((item, idx) => {
                        const pct =
                          liveEco.totalCogs > 0
                            ? (item.val / liveEco.totalCogs) * 100
                            : 0;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#566273] font-medium">
                                {item.label}
                              </span>
                              <span className="font-bold text-[#17202d]">
                                {formatINR(item.val)} ({formatPct(pct)})
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#f0f2f5] rounded-full overflow-hidden">
                              <div
                                className={`h-full ${item.color} rounded-full transition-all duration-300`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#e7eaf0] flex items-center justify-between text-xs text-[#748092]">
                    <span>
                      {config.ownerName || "Atiq"}'s{" "}
                      {config.defaultTargetCogsPct || 20}% Ceiling for MRP{" "}
                      {formatINR(costForm.mrp)}
                    </span>
                    <span className="font-bold text-[#17202d]">
                      Max:{" "}
                      {formatINR(
                        costForm.mrp *
                          ((config.defaultTargetCogsPct || 20) / 100),
                      )}
                    </span>
                  </div>
                </div>

                {/* Margin Waterfall Flow */}
                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#17202d]">
                        Money Journey (Waterfall per Sold Piece)
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab("costing")}
                        className="text-[11px] font-semibold text-[#c58b4b] hover:text-[#a56f35] hover:underline flex items-center gap-1"
                      >
                        <span>{activeProduct?.sku}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-[#748092] mt-1">
                      See step-by-step what remains after customer discounts,
                      returns, GST, and courier cuts.
                    </p>

                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-xs">
                        <div>
                          <span className="font-bold text-[#17202d]">
                            MRP (Selling Label Tag)
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            Before customer discounts
                          </p>
                        </div>
                        <span className="font-extrabold text-sm">
                          {formatINR(costForm.mrp)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-[#edf7f2] rounded-xl text-xs">
                        <div>
                          <span className="font-bold text-[#16835d]">
                            CM1: Net Realisation (ex-GST)
                          </span>
                          <p className="text-[10px] text-[#16835d]">
                            After {costForm.discountPct}% disc,{" "}
                            {costForm.expectedReturnsPct}% returns &{" "}
                            {costForm.gstPct}% GST
                          </p>
                        </div>
                        <span className="font-extrabold text-[#16835d]">
                          {formatINR(liveEco.cm1)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-[#eff6ff] rounded-xl text-xs">
                        <div>
                          <span className="font-bold text-[#2563eb]">
                            CM2: Gross Contribution
                          </span>
                          <p className="text-[10px] text-[#2563eb]">
                            CM1 minus {costForm.marketplaceCommissionPct}%
                            platform fee & {formatINR(liveEco.totalCogs)} making
                            cost
                          </p>
                        </div>
                        <span
                          className={`font-extrabold ${
                            liveEco.cm2 >= 0
                              ? "text-[#2563eb]"
                              : "text-[#c44e4e]"
                          }`}
                        >
                          {formatINR(liveEco.cm2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#111c2d] text-white rounded-xl text-xs shadow-md">
                        <div>
                          <span className="font-bold text-[#c58b4b]">
                            CM3: Net Pocket Cash
                          </span>
                          <p className="text-[10px] text-gray-300">
                            CM2 minus {formatINR(liveEco.totalLogistics)}{" "}
                            logistics & {formatINR(liveEco.marketing)} Meta ad
                            CAC
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-base font-extrabold ${
                              liveEco.cm3 >= 0
                                ? "text-[#64d7a9]"
                                : "text-[#ff8f8f]"
                            }`}
                          >
                            {formatINR(liveEco.cm3)}
                          </span>
                          <span className="block text-[10px] text-gray-400">
                            Margin:{" "}
                            {costForm.mrp
                              ? formatPct((liveEco.cm3 / costForm.mrp) * 100)
                              : "0%"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#e7eaf0] text-xs text-[#748092] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-[#c58b4b] shrink-0" />
                      <span>
                        Rent & fixed tailor salaries kept separate below CM3
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("expenses")}
                      className="font-bold text-xs text-[#c58b4b] hover:underline shrink-0"
                    >
                      View Overheads →
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Benchmark Register */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#17202d]">
                      Product Economics & {config.defaultTargetCogsPct || 20}%
                      Benchmark Check
                    </h3>
                    <p className="text-xs text-[#748092]">
                      Garments with making cost &gt;{" "}
                      {config.defaultTargetCogsPct || 20}% of MRP risk losing
                      money once marketplace takes its cut.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#748092]">
                    Showing {products.length} registered styles
                  </span>
                </div>

                <div className="overflow-x-auto no-scrollbar -mx-5 sm:mx-0 px-5 sm:px-0">
                  <table className="w-full text-left text-xs min-w-180">
                    <thead>
                      <tr className="border-b border-[#e7eaf0] text-[#748092] text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Style / SKU</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Making Cost</th>
                        <th className="py-2.5 px-3">MRP</th>
                        <th className="py-2.5 px-3">Cost %</th>
                        <th className="py-2.5 px-3">Multiplier</th>
                        <th className="py-2.5 px-3">CM3 Pocket</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {products.map((p) => {
                        const isSafe =
                          p.cogsPct <= (config.defaultTargetCogsPct || 20);
                        return (
                          <tr
                            key={p.sku}
                            className="hover:bg-gray-50/80 transition-colors"
                          >
                            <td className="py-3 px-3">
                              <span className="font-bold text-[#17202d]">
                                {p.sku}
                              </span>
                              <span className="block text-[11px] text-[#748092]">
                                {p.name}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[#566273]">
                              {p.category}
                            </td>
                            <td className="py-3 px-3 font-semibold text-[#17202d]">
                              {formatINR(p.totalCogs)}
                            </td>
                            <td className="py-3 px-3 font-semibold text-[#17202d]">
                              {formatINR(p.mrp)}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center gap-1 font-bold ${
                                  isSafe ? "text-[#16835d]" : "text-[#c44e4e]"
                                }`}
                              >
                                {formatPct(p.cogsPct)}
                                {!isSafe && (
                                  <AlertTriangle className="w-3 h-3 text-[#c44e4e]" />
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[#566273]">
                              {p.pricingMultiplier}×
                            </td>
                            <td
                              className={`py-3 px-3 font-bold ${
                                p.cm3 >= 0 ? "text-[#16835d]" : "text-[#c44e4e]"
                              }`}
                            >
                              {formatINR(p.cm3)}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isSafe
                                    ? "bg-[#edf7f2] text-[#16835d]"
                                    : "bg-[#fff0f0] text-[#c44e4e]"
                                }`}
                              >
                                {isSafe
                                  ? `Within ${config.defaultTargetCogsPct || 20}%`
                                  : "High Cost Risk"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => {
                                  handleSelectProduct(p.sku);
                                  setActiveTab("costing");
                                }}
                                className="text-xs font-bold text-[#c58b4b] hover:text-[#9c6a32] underline"
                              >
                                Open Calculator
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 2: COSTING STUDIO (100% MOBILE RESPONSIVE)         */}
          {/* ======================================================== */}
          {activeTab === "costing" && (
            <div className="space-y-5 sm:space-y-6 min-w-0 w-full">
              {/* Top Banner & Control Deck */}
              <div className="flex flex-col gap-3.5 min-w-0 w-full">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    P0 Core · Garment Costing Engine
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17202d] truncate">
                    Product Costing & Pricing Studio
                  </h2>
                  <p className="text-xs text-[#748092]">
                    Test sample fabric consumption and full batch production
                    economics BEFORE cutting fabric.
                  </p>
                </div>

                {/* SKU Selector & Actions Bar (Fully Responsive) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#e7eaf0] shadow-2xs w-full min-w-0">
                  <div className="flex-1 min-w-0 w-full sm:max-w-md">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#748092] mb-1 sm:hidden">
                      Select Garment Style
                    </label>
                    <select
                      value={selectedSku}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-[#dfe4eb] text-xs font-bold rounded-xl text-[#17202d] shadow-2xs outline-none truncate"
                    >
                      {products.map((p) => (
                        <option key={p.sku} value={p.sku}>
                          {p.sku} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleSaveProduct}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-[#111c2d] hover:bg-[#1e2f47] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95 text-center whitespace-nowrap"
                    >
                      Save SKU Costing
                    </button>
                    <button
                      onClick={handleNewCostingForm}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#c58b4b] hover:bg-[#b57a39] text-[#111c2d] text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95 whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#111c2d]" />
                      <span>New Style</span>
                    </button>
                  </div>
                </div>

                {/* Revived Style Origin Banner */}
                {costForm.isRevivedVersion && (
                  <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#17202d] uppercase tracking-wider block">
                          Revived Style Version (Remade from Dead Stock)
                        </span>
                        <p className="text-[11px] text-[#566273]">
                          Recreated using{" "}
                          <strong className="text-[#17202d]">
                            {costForm.revivedFromQty} units
                          </strong>{" "}
                          from original Dead SKU{" "}
                          <strong className="text-amber-900 font-mono">
                            {costForm.revivedFromSku}
                          </strong>
                          .
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 bg-white border border-amber-300 rounded-lg text-amber-900 shrink-0">
                      ⚡ Tag: Remade from {costForm.revivedFromSku}
                    </span>
                  </div>
                )}

                {/* Mobile View Switcher Tab Bar (Visible on mobile only) */}
                <div className="flex lg:hidden bg-white border border-[#e7eaf0] rounded-2xl p-1 shadow-2xs w-full">
                  <button
                    onClick={() => setCostingMobileTab("inputs")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      costingMobileTab === "inputs"
                        ? "bg-[#111c2d] text-white shadow-xs"
                        : "text-[#748092] hover:text-[#17202d]"
                    }`}
                  >
                    <Shirt className="w-3.5 h-3.5 text-[#c58b4b]" />
                    <span>Costing Inputs</span>
                  </button>
                  <button
                    onClick={() => setCostingMobileTab("result")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      costingMobileTab === "result"
                        ? "bg-[#111c2d] text-white shadow-xs"
                        : "text-[#748092] hover:text-[#17202d]"
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#c58b4b]" />
                    <span>Margin Verdict ({formatINR(liveEco.totalCogs)})</span>
                  </button>
                </div>
              </div>

              {/* Two Column Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start w-full min-w-0">
                {/* Left 7 Columns: All Inputs */}
                <div
                  className={`lg:col-span-7 space-y-5 sm:space-y-6 min-w-0 w-full ${
                    costingMobileTab === "inputs" ? "block" : "hidden lg:block"
                  }`}
                >
                  {/* Section A: Garment Identity */}
                  <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 min-w-0 w-full">
                    <div className="flex items-center justify-between border-b border-[#e7eaf0] pb-3">
                      <h3 className="font-bold text-sm text-[#17202d] flex items-center gap-2 truncate">
                        <Shirt className="w-4 h-4 text-[#c58b4b] shrink-0" />
                        <span>1. Garment Style Identity</span>
                      </h3>
                      <span className="text-[10px] text-[#748092] uppercase font-bold tracking-wider">
                        Style Master
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 min-w-0">
                      <div>
                        <label className="block text-[11px] font-bold text-[#566273] mb-1 truncate">
                          SKU ID / Code
                        </label>
                        <input
                          type="text"
                          value={costForm.sku}
                          onChange={(e) =>
                            setCostForm({ ...costForm, sku: e.target.value })
                          }
                          className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-bold focus:border-[#c58b4b] outline-none uppercase bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#566273] mb-1 truncate">
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={costForm.name}
                          onChange={(e) =>
                            setCostForm({ ...costForm, name: e.target.value })
                          }
                          className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium focus:border-[#c58b4b] outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#566273] mb-1 truncate">
                          Garment Category
                        </label>
                        <select
                          value={costForm.category}
                          onChange={(e) => {
                            const newCat = e.target.value;
                            setCostForm((prev) => ({
                              ...prev,
                              category: newCat,
                            }));
                          }}
                          className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-semibold focus:border-[#c58b4b] outline-none bg-white"
                        >
                          {garmentCategoriesList.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#566273] mb-1 truncate">
                          Production Run Target
                        </label>
                        <input
                          type="text"
                          value={costForm.productionRunQty}
                          onChange={(e) =>
                            setCostForm({
                              ...costForm,
                              productionRunQty: Number(e.target.value),
                            })
                          }
                          className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-bold focus:border-[#c58b4b] outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#566273] mb-1 truncate">
                          Pricing Multiplier
                        </label>
                        <input
                          type="text"
                          step="0.1"
                          value={costForm.pricingMultiplier}
                          onChange={(e) =>
                            setCostForm({
                              ...costForm,
                              pricingMultiplier: Number(e.target.value),
                            })
                          }
                          className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-bold focus:border-[#c58b4b] outline-none bg-amber-50/50"
                        />
                        <span className="text-[10px] text-[#a66a1d] block mt-0.5 truncate">
                          Recommended: 2.0x - 2.5x
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Making Cost per Piece */}
                  <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e7eaf0] pb-3">
                      <div>
                        <h3 className="font-bold text-sm text-[#17202d] flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-[#c58b4b] shrink-0" />
                          <span>2. Making Cost per Piece (COGS)</span>
                        </h3>
                        <p className="text-[11px] text-[#748092]">
                          Kapda (fabric), Trims (buttons, zippers, fusing, pads,
                          hooks), Silai, Cutting & Packaging
                        </p>
                      </div>
                      <span className="self-start sm:self-auto text-xs font-black text-[#17202d] bg-gray-100 px-2.5 py-1 rounded-lg">
                        Total Making Cost: {formatINR(liveEco.totalCogs)}
                      </span>
                    </div>

                    {/* 2.1 Fabric (Kapda) Specification */}
                    <div className="bg-[#fcfdfd] border border-[#e7eaf0] rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#f0f2f5] pb-2">
                        <span className="text-[11px] font-bold text-[#17202d] flex items-center gap-1.5 uppercase tracking-wider">
                          <Layers className="w-3.5 h-3.5 text-[#c58b4b]" />
                          <span>Kapda (Fabric) Specification</span>
                        </span>
                        <span className="text-[11px] font-bold text-[#16835d]">
                          Fabric Subtotal: {formatINR(liveEco.fabricCost)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                        <div>
                          <label className="block text-[11px] font-bold text-[#566273] mb-1">
                            Fabric Type (Dropdown)
                          </label>
                          <select
                            value={costForm.fabricType || "100% Cotton"}
                            onChange={(e) => {
                              const fType = e.target.value;
                              const benchmark = FABRIC_BENCHMARKS[fType];
                              setCostForm((prev) => ({
                                ...prev,
                                fabricType: fType,
                                fabricRate: benchmark || prev.fabricRate,
                              }));
                            }}
                            className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-semibold focus:border-[#c58b4b] outline-none bg-white"
                          >
                            {fabricTypesList.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#566273] mb-1">
                            Fabric Used (Metres)
                          </label>
                          <input
                            type="text"
                            step="0.05"
                            value={costForm.fabricQty}
                            onChange={(e) =>
                              setCostForm({
                                ...costForm,
                                fabricQty: Number(e.target.value),
                              })
                            }
                            className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#566273] mb-1">
                            Fabric Rate (₹ / Metre)
                          </label>
                          <input
                            type="text"
                            value={costForm.fabricRate}
                            onChange={(e) =>
                              setCostForm({
                                ...costForm,
                                fabricRate: Number(e.target.value),
                              })
                            }
                            className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2.2 Trims & Materials Dynamic Specification */}
                    <div className="bg-[#fcfdfd] border border-[#e7eaf0] rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#f0f2f5] pb-2">
                        <span className="text-[11px] font-bold text-[#17202d] flex items-center gap-1.5 uppercase tracking-wider">
                          <Scissors className="w-3.5 h-3.5 text-[#c58b4b]" />
                          <span>Trims & Accessories Specification</span>
                        </span>
                        <span className="text-[11px] font-bold text-[#16835d]">
                          Trims Subtotal: {formatINR(costForm.trimsCost)}
                        </span>
                      </div>

                      {/* Dynamic Trims Row Table */}
                      <div className="space-y-3">
                        <div className="overflow-x-auto no-scrollbar -mx-3.5 sm:mx-0 px-3.5 sm:px-0">
                          <table className="w-full text-left text-xs min-w-160">
                            <thead>
                              <tr className="border-b border-[#e7eaf0] text-[#748092] text-[10px] font-bold uppercase tracking-wider">
                                <th className="py-2 px-2.5 w-36">Item Type</th>
                                <th className="py-2 px-2.5">Name / Description</th>
                                <th className="py-2 px-2.5 w-28">Quantity Use</th>
                                <th className="py-2 px-2.5 w-28">Price (₹)</th>
                                <th className="py-2 px-2.5 w-24 text-right">Row Cost</th>
                                <th className="py-2 px-2 w-10 text-center"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {(costForm.trimItems || []).map((item, idx) => {
                                const rowCost =
                                  (Number(item.quantity) || 0) *
                                  (Number(item.price) || 0);
                                return (
                                  <tr
                                    key={item.id || idx}
                                    className="hover:bg-gray-50/80 transition"
                                  >
                                    {/* 1. Dropdown with given names */}
                                    <td className="py-2 px-2.5">
                                      <select
                                        value={item.type}
                                        onChange={(e) =>
                                          handleUpdateTrimItem(
                                            item.id,
                                            "type",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-semibold text-[#17202d] bg-white outline-none focus:border-[#c58b4b]"
                                      >
                                        <option value="fabric">fabric</option>
                                        <option value="zipper">zipper</option>
                                        <option value="button">button</option>
                                        <option value="fusing">fusing</option>
                                        <option value="lining">lining</option>
                                        <option value="eyehook">eyehook</option>
                                      </select>
                                    </td>

                                    {/* 2. <name> raw text field */}
                                    <td className="py-2 px-2.5">
                                      <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) =>
                                          handleUpdateTrimItem(
                                            item.id,
                                            "name",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Name / Spec (e.g. CFC #3, 18L)"
                                        className="w-full px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-medium text-[#17202d] bg-white outline-none focus:border-[#c58b4b]"
                                      />
                                    </td>

                                    {/* 3. <quantity use> raw text field */}
                                    <td className="py-2 px-2.5">
                                      <input
                                        type="text"
                                        value={item.quantity}
                                        onChange={(e) =>
                                          handleUpdateTrimItem(
                                            item.id,
                                            "quantity",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Qty (e.g. 1)"
                                        className="w-full px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-medium text-[#17202d] bg-white outline-none focus:border-[#c58b4b]"
                                      />
                                    </td>

                                    {/* 4. <price> raw text field */}
                                    <td className="py-2 px-2.5">
                                      <input
                                        type="text"
                                        value={item.price}
                                        onChange={(e) =>
                                          handleUpdateTrimItem(
                                            item.id,
                                            "price",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Price ₹ (e.g. 10)"
                                        className="w-full px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-medium text-[#17202d] bg-white outline-none focus:border-[#c58b4b]"
                                      />
                                    </td>

                                    {/* 5. Row Cost calculation */}
                                    <td className="py-2 px-2.5 text-right font-bold text-[#17202d] whitespace-nowrap">
                                      ₹{rowCost.toFixed(2)}
                                    </td>

                                    {/* 6. Delete Row */}
                                    <td className="py-2 px-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteTrimItem(item.id)
                                        }
                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition hover:bg-red-50 cursor-pointer"
                                        title="Remove item"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Action row & Total Cost */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-[#f0f2f5]">
                          <button
                            type="button"
                            onClick={handleAddTrimItem}
                            className="px-3.5 py-2 bg-[#edf7f2] hover:bg-[#d8efe2] text-[#16835d] text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 border border-[#16835d]/25 cursor-pointer w-fit shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add Row</span>
                          </button>

                          <div className="flex items-center gap-3 bg-[#f8f9fb] px-4 py-2 rounded-xl border border-[#e2e6eb]">
                            <span className="text-xs font-semibold text-[#566273]">
                              Total Trims Cost:
                            </span>
                            <span className="text-sm font-black text-[#16835d]">
                              {formatINR(costForm.trimsCost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2.3 Operations, Silai & Labour */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#748092]">
                        Cutting, Silai & Packaging Operations
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 min-w-0">
                        <div>
                          <label className="block text-[11px] font-bold text-[#566273] mb-1">
                            Cutting Masterji (₹/pc)
                          </label>
                          <input
                            type="text"
                            value={costForm.cuttingCost}
                            onChange={(e) =>
                              setCostForm({
                                ...costForm,
                                cuttingCost: Number(e.target.value),
                              })
                            }
                            className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#566273] mb-1">
                            Stitching / Silai (₹/pc)
                          </label>
                          <input
                            type="text"
                            value={costForm.stitchingCost}
                            onChange={(e) =>
                              setCostForm({
                                ...costForm,
                                stitchingCost: Number(e.target.value),
                              })
                            }
                            className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#566273] mb-1">
                            Finishing & QC (₹/pc)
                          </label>
                          <input
                            type="text"
                            value={costForm.finishingCost}
                            onChange={(e) =>
                              setCostForm({
                                ...costForm,
                                finishingCost: Number(e.target.value),
                              })
                            }
                            className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#566273] mb-1">
                            Packaging (₹)
                          </label>
                          <input
                            type="text"
                            value={costForm.packagingCost}
                            onChange={(e) =>
                              setCostForm({
                                ...costForm,
                                packagingCost: Number(e.target.value),
                              })
                            }
                            className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#566273] mb-1">
                            Washing / Other (₹)
                          </label>
                          <input
                            type="text"
                            value={costForm.otherCost}
                            onChange={(e) =>
                              setCostForm({
                                ...costForm,
                                otherCost: Number(e.target.value),
                              })
                            }
                            className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section C: Selling & Marketplace Parameters */}
                  <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 min-w-0 w-full">
                    <div className="flex items-center justify-between border-b border-[#e7eaf0] pb-3">
                      <div>
                        <h3 className="font-bold text-sm text-[#17202d] flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-[#c58b4b] shrink-0" />
                          <span>3. Selling & Platform Deductions</span>
                        </h3>
                        <p className="text-[11px] text-[#748092]">
                          Discounts, platform commission cut, GST, and logistics
                        </p>
                      </div>
                      <span className="text-[10px] text-[#748092] font-bold uppercase">
                        Realisation
                      </span>
                    </div>

                    {/* Quick Marketplace Rate Presets (from Settings Directory) */}
                    <div className="bg-[#f5f6f8] border border-[#e7eaf0] rounded-xl p-3 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#17202d] flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-[#c58b4b]" />
                          <span>Quick Marketplace Rate Preset</span>
                        </span>
                        <span className="text-[10px] text-[#748092]">
                          Tap to auto-fill platform fee & courier
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {marketplaces.map((ch) => (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => handleApplyChannelPresetToSku(ch)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                              costForm.marketplaceCommissionPct ===
                              ch.commissionPct
                                ? "bg-[#111c2d] text-white shadow-xs"
                                : "bg-white border border-[#dfe4eb] text-[#17202d] hover:bg-[#ecefdf]"
                            }`}
                          >
                            <span>{ch.name}</span>
                            <span className="text-[10px] opacity-80">
                              ({ch.commissionPct}%)
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 min-w-0">
                      <div>
                        <label className="block text-[11px] font-bold text-[#566273] mb-1 truncate">
                          MRP Tag (₹)
                        </label>
                        <input
                          type="text"
                          value={costForm.mrp}
                          onChange={(e) =>
                            setCostForm({
                              ...costForm,
                              mrp: Number(e.target.value),
                            })
                          }
                          className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-extrabold text-[#111c2d] outline-none focus:border-[#c58b4b] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#566273] mb-1 truncate">
                          Discount (%)
                        </label>
                        <input
                          type="text"
                          value={costForm.discountPct}
                          onChange={(e) =>
                            setCostForm({
                              ...costForm,
                              discountPct: Number(e.target.value),
                            })
                          }
                          className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#566273] mb-1 truncate">
                          Returns (%)
                        </label>
                        <input
                          type="text"
                          value={costForm.expectedReturnsPct}
                          onChange={(e) =>
                            setCostForm({
                              ...costForm,
                              expectedReturnsPct: Number(e.target.value),
                            })
                          }
                          className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#566273] mb-1 truncate">
                          Platform Fee (%)
                        </label>
                        <input
                          type="text"
                          step="0.5"
                          value={costForm.marketplaceCommissionPct}
                          onChange={(e) =>
                            setCostForm({
                              ...costForm,
                              marketplaceCommissionPct: Number(e.target.value),
                            })
                          }
                          className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b] bg-white"
                        />
                        <span className="text-[10px] text-[#748092] block mt-0.5 truncate">
                          Myntra 22.5%
                        </span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#566273] mb-1 truncate">
                          Courier (₹)
                        </label>
                        <input
                          type="text"
                          value={costForm.logisticsCost}
                          onChange={(e) =>
                            setCostForm({
                              ...costForm,
                              logisticsCost: Number(e.target.value),
                            })
                          }
                          className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#566273] mb-1 truncate">
                          Meta Ad Spend (₹)
                        </label>
                        <input
                          type="text"
                          value={costForm.marketingCost}
                          onChange={(e) =>
                            setCostForm({
                              ...costForm,
                              marketingCost: Number(e.target.value),
                            })
                          }
                          className="w-full min-w-0 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b] bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: Output Verdict & Margin Waterfall */}
                <div
                  className={`lg:col-span-5 space-y-5 sm:space-y-6 lg:sticky lg:top-20 min-w-0 w-full ${
                    costingMobileTab === "result" ? "block" : "hidden lg:block"
                  }`}
                >
                  {/* Verdict & Recommended Price Box */}
                  <div className="bg-[#111c2d] text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-[#2a3c57] min-w-0 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-[#9eabba] font-bold uppercase tracking-wider truncate">
                        Production Making Cost
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${
                          liveEco.isCogsWithinTarget
                            ? "bg-[#16835d]/30 text-[#64d7a9] border border-[#16835d]"
                            : "bg-[#c44e4e]/30 text-[#ff8f8f] border border-[#c44e4e]"
                        }`}
                      >
                        {liveEco.isCogsWithinTarget
                          ? `✓ Within ${config.defaultTargetCogsPct || 20}% Target`
                          : `⚠ Exceeds ${config.defaultTargetCogsPct || 20}% Target`}
                      </span>
                    </div>

                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
                      {formatINR(liveEco.totalCogs)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Batch of {costForm.productionRunQty} pcs ={" "}
                      <span className="text-white font-bold">
                        {formatINR(
                          liveEco.totalCogs * costForm.productionRunQty,
                        )}
                      </span>{" "}
                      total making capital
                    </p>

                    <div className="mt-5 pt-4 border-t border-[#23354d] space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#aab5c3]">
                          Suggested MRP ({costForm.pricingMultiplier}× cost):
                        </span>
                        <span className="font-extrabold text-[#c58b4b] text-base">
                          {formatINR(liveEco.recommendedMrp)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#aab5c3]">
                          Actual Planned MRP:
                        </span>
                        <span className="font-bold text-white">
                          {formatINR(costForm.mrp)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#aab5c3]">
                          Current Making Cost / MRP:
                        </span>
                        <span
                          className={`font-black text-sm ${
                            liveEco.isCogsWithinTarget
                              ? "text-[#64d7a9]"
                              : "text-[#ff8f8f]"
                          }`}
                        >
                          {formatPct(liveEco.cogsPct)}
                        </span>
                      </div>
                    </div>

                    {/* Breakeven Units */}
                    <div className="mt-5 p-3.5 bg-[#17253a] rounded-xl border border-[#2b3e58] text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">
                          Minimum to Sell for Breakeven:
                        </span>
                        <span className="font-bold text-[#c58b4b]">
                          {liveEco.cm2 > 0
                            ? `${Math.ceil((liveEco.totalCogs * costForm.productionRunQty) / liveEco.cm2)} pcs`
                            : "Never (CM2 negative)"}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Out of {costForm.productionRunQty} pieces, you must sell
                        this much to recover batch making cost.
                      </p>
                    </div>
                  </div>

                  {/* Complete Waterfall Ledger Card */}
                  <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 min-w-0 w-full">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#17202d] border-b border-[#e7eaf0] pb-2">
                      Where the Money Goes (Per Piece)
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-600">MRP Label Tag</span>
                        <span className="font-semibold">
                          {formatINR(costForm.mrp)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 text-red-600">
                        <span>Less: Discount ({costForm.discountPct}%)</span>
                        <span>
                          -
                          {formatINR(
                            costForm.mrp * (costForm.discountPct / 100),
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 text-red-600">
                        <span>
                          Less: Return Loss provision (
                          {costForm.expectedReturnsPct}%)
                        </span>
                        <span>
                          -
                          {formatINR(
                            costForm.mrp *
                              (1 - costForm.discountPct / 100) *
                              (costForm.expectedReturnsPct / 100),
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 text-red-600">
                        <span>Less: GST removal ({costForm.gstPct}%)</span>
                        <span>-{formatINR(liveEco.gstDeduction)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 bg-[#edf7f2] px-2 rounded-lg font-bold text-[#16835d]">
                        <span>CM1 (Net Realisation ex-GST)</span>
                        <span>{formatINR(liveEco.cm1)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-red-600">
                        <span>
                          Less: Platform Fee (
                          {costForm.marketplaceCommissionPct}%)
                        </span>
                        <span>-{formatINR(liveEco.commissionDeduction)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-red-600">
                        <span>Less: Making Cost (Fabric + Silai)</span>
                        <span>-{formatINR(liveEco.totalCogs)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 bg-[#eff6ff] px-2 rounded-lg font-bold text-[#2563eb]">
                        <span>CM2 (Gross Contribution)</span>
                        <span>{formatINR(liveEco.cm2)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-red-600">
                        <span>Less: Forward + Reverse Courier</span>
                        <span>-{formatINR(liveEco.totalLogistics)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-red-600">
                        <span>Less: Marketing / Meta Ad CAC</span>
                        <span>-{formatINR(liveEco.marketing)}</span>
                      </div>
                      <div className="flex justify-between py-2 bg-[#111c2d] text-white px-3 rounded-xl font-extrabold text-sm">
                        <span>CM3 (Net In-Hand Pocket Cash)</span>
                        <span
                          className={
                            liveEco.cm3 >= 0
                              ? "text-[#64d7a9]"
                              : "text-[#ff8f8f]"
                          }
                        >
                          {formatINR(liveEco.cm3)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Batch Production Economics & Net Pocket Cash Tiles */}
                  <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 min-w-0 w-full">
                    <div className="flex items-center justify-between border-b border-[#e7eaf0] pb-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#17202d] flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#c58b4b]" />
                        <span>Batch Production Return ({costForm.productionRunQty} pcs)</span>
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          liveEco.cm3 >= 0
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {liveEco.cm3 >= 0 ? "Profitable Run" : "Loss Risk"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-semibold text-[#748092] block uppercase tracking-wider">
                          Making Capital
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#17202d] mt-0.5 block">
                          {formatINR(
                            liveEco.totalCogs * costForm.productionRunQty,
                          )}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Total batch cost
                        </span>
                      </div>

                      <div className="p-3 bg-[#edf7f2] rounded-xl border border-[#c4e3d3]">
                        <span className="text-[10px] font-semibold text-[#16835d] block uppercase tracking-wider">
                          Net Pocket Cash
                        </span>
                        <span
                          className={`text-sm sm:text-base font-black mt-0.5 block ${
                            liveEco.cm3 >= 0
                              ? "text-[#16835d]"
                              : "text-red-600"
                          }`}
                        >
                          {formatINR(liveEco.cm3 * costForm.productionRunQty)}
                        </span>
                        <span className="text-[10px] text-[#16835d]">
                          CM3 × {costForm.productionRunQty} pcs
                        </span>
                      </div>

                      <div className="p-3 bg-[#eff6ff] rounded-xl border border-[#d0e1fd]">
                        <span className="text-[10px] font-semibold text-[#2563eb] block uppercase tracking-wider">
                          Gross Margin (CM2)
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#2563eb] mt-0.5 block">
                          {formatINR(liveEco.cm2 * costForm.productionRunQty)}
                        </span>
                        <span className="text-[10px] text-[#2563eb]">
                          Before courier & ads
                        </span>
                      </div>

                      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                        <span className="text-[10px] font-semibold text-[#a66a1d] block uppercase tracking-wider">
                          Return on Capital
                        </span>
                        <span className="text-sm sm:text-base font-black text-[#a66a1d] mt-0.5 block">
                          {liveEco.totalCogs > 0
                            ? `${Math.round((liveEco.cm3 / liveEco.totalCogs) * 100)}%`
                            : "0%"}
                        </span>
                        <span className="text-[10px] text-[#a66a1d]">
                          Net CM3 / COGS
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* COGS Composition Breakdown */}
                  <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 min-w-0 w-full">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#17202d] border-b border-[#e7eaf0] pb-2 flex items-center justify-between">
                      <span>Making Cost Distribution</span>
                      <span className="text-[10px] text-[#748092] font-semibold lowercase">
                        100% of total cogs
                      </span>
                    </h4>

                    {(() => {
                      const fabricTotal =
                        Number(costForm.fabricQty) *
                        Number(costForm.fabricRate);
                      const trimsTotal = Number(costForm.trimsCost);
                      const operationsTotal =
                        Number(costForm.cuttingCost) +
                        Number(costForm.stitchingCost) +
                        Number(costForm.finishingCost) +
                        Number(costForm.packagingCost) +
                        Number(costForm.otherCost);
                      const cogsTotal = liveEco.totalCogs || 1;

                      const fabricPct = Math.min(
                        100,
                        Math.round((fabricTotal / cogsTotal) * 100),
                      );
                      const trimsPct = Math.min(
                        100 - fabricPct,
                        Math.round((trimsTotal / cogsTotal) * 100),
                      );
                      const opsPct = Math.max(0, 100 - fabricPct - trimsPct);

                      return (
                        <div className="space-y-2.5 text-xs">
                          <div>
                            <div className="flex justify-between text-gray-600 mb-1">
                              <span>Fabric (Kapda)</span>
                              <span className="font-semibold text-[#17202d]">
                                {formatINR(fabricTotal)} ({fabricPct}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#c58b4b] h-1.5 rounded-full"
                                style={{ width: `${fabricPct}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-gray-600 mb-1">
                              <span>Trims & Accessories</span>
                              <span className="font-semibold text-[#17202d]">
                                {formatINR(trimsTotal)} ({trimsPct}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#16835d] h-1.5 rounded-full"
                                style={{ width: `${trimsPct}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-gray-600 mb-1">
                              <span>Silai, Cutting & Packaging</span>
                              <span className="font-semibold text-[#17202d]">
                                {formatINR(operationsTotal)} ({opsPct}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#2563eb] h-1.5 rounded-full"
                                style={{ width: `${opsPct}%` }}
                              />
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#748092]">
                            <span>Max Breakeven Ad CAC Cap:</span>
                            <span className="font-bold text-[#c58b4b]">
                              {formatINR(liveEco.cm2)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Multi-Marketplace Channel Profit Simulator */}
              <div
                className={`w-full min-w-0 bg-white border border-[#e7eaf0] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5 ${
                  costingMobileTab === "result" ? "block" : "hidden lg:block"
                }`}
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#e7eaf0] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-[#c58b4b]" />
                      <h3 className="font-bold text-base sm:text-lg text-[#17202d]">
                        Multi-Marketplace Channel Profit Simulator
                      </h3>
                    </div>
                    <p className="text-xs text-[#748092] mt-0.5">
                      Live profit comparison of{" "}
                      <span className="font-bold text-[#17202d]">
                        {costForm.name || costForm.sku}
                      </span>{" "}
                      across all e-commerce channels based on rates configured
                      in Settings.
                    </p>
                  </div>

                  {/* Simulator Controls */}
                  <div className="flex flex-wrap items-center gap-3 bg-[#f5f6f8] px-3.5 py-2 rounded-xl border border-[#dfe4eb]">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-[#c58b4b]" />
                      <span className="text-xs font-bold text-[#17202d]">
                        Test Promo Discount:
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={simPromoDiscount}
                        onChange={(e) =>
                          setSimPromoDiscount(Number(e.target.value))
                        }
                        className="w-24 sm:w-32 accent-[#c58b4b] cursor-pointer"
                      />
                      <span className="text-xs font-black text-[#17202d] w-9 text-right">
                        {simPromoDiscount}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Channels Comparison Table */}
                <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full text-left text-xs min-w-180">
                    <thead>
                      <tr className="border-b border-[#e7eaf0] text-[#748092] uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Marketplace Channel</th>
                        <th className="py-2.5 px-3 text-right">
                          Selling Price
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          Platform Cut + GST
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          Making Cost (COGS)
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          Logistics & Returns
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          Net Pocket Cash (CM3)
                        </th>
                        <th className="py-2.5 px-3 text-center">
                          Net Margin %
                        </th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f2f5]">
                      {marketplaces.map((channel) => {
                        const sim = simulateChannelEconomics({
                          mrp: Number(costForm.mrp),
                          totalCogs: liveEco.totalCogs,
                          discountPct: simPromoDiscount,
                          gstPct: Number(costForm.gstPct),
                          marketingCost: Number(costForm.marketingCost),
                          channel,
                        });

                        const isApplied =
                          costForm.marketplaceCommissionPct ===
                            channel.commissionPct &&
                          costForm.logisticsCost === channel.shippingFee;

                        return (
                          <tr
                            key={channel.id}
                            className={`hover:bg-[#fbfcfd] transition ${
                              channel.status === "Paused"
                                ? "opacity-60 bg-gray-50/50"
                                : ""
                            }`}
                          >
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#17202d]">
                                  {channel.name}
                                </span>
                                {channel.status === "Paused" ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                                    PAUSED
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-[#748092]">
                                    ({channel.commissionPct}% comm ·{" "}
                                    {channel.expectedReturnsPct}% returns)
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-3 text-right font-bold text-[#17202d]">
                              {formatINR(sim.discountedPrice)}
                            </td>

                            <td className="py-3 px-3 text-right text-red-600 font-semibold">
                              -{formatINR(sim.totalPlatformCut)}
                            </td>

                            <td className="py-3 px-3 text-right text-gray-700 font-medium">
                              -{formatINR(liveEco.totalCogs)}
                            </td>

                            <td className="py-3 px-3 text-right text-red-600 font-semibold">
                              -{formatINR(sim.totalLogistics)}
                            </td>

                            <td className="py-3 px-3 text-right">
                              <span
                                className={`text-sm font-black ${
                                  sim.cm3 > 0
                                    ? "text-[#16835d]"
                                    : "text-[#d9383a]"
                                }`}
                              >
                                {formatINR(sim.cm3)}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  sim.statusBadge === "Healthy Profit"
                                    ? "bg-[#eaf8f1] text-[#16835d]"
                                    : sim.statusBadge === "Moderate Margin"
                                      ? "bg-[#fff7e6] text-[#b87405]"
                                      : "bg-[#fdeeed] text-[#d9383a]"
                                }`}
                              >
                                {formatPct(sim.netMarginPct)} ({sim.statusBadge}
                                )
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  handleApplyChannelPresetToSku(channel)
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition active:scale-95 ${
                                  isApplied
                                    ? "bg-[#16835d] text-white cursor-default"
                                    : "bg-[#111c2d] hover:bg-[#1e2f47] text-white"
                                }`}
                              >
                                {isApplied ? "Applied ✓" : "Apply to SKU"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Non-tech garment owner insight footer */}
                <div className="bg-[#f9faf4] border border-[#e2e7d3] rounded-xl p-3.5 text-xs text-[#525f43] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#758a56] shrink-0" />
                    <span>
                      💡 <strong>Channel Strategy Tip:</strong> Compare Myntra
                      vs Direct Website — high returns and 22.5% platform cut
                      require a higher MRP buffer, whereas Shopify or retail
                      gives maximum in-hand cash.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="text-xs font-bold text-[#17202d] hover:underline whitespace-nowrap self-end sm:self-auto"
                  >
                    Manage Channel Rates in Settings →
                  </button>
                </div>
              </div>

              {/* Mobile Floating Quick Summary Bar (Only when on mobile and in 'inputs' tab) */}
              {costingMobileTab === "inputs" && (
                <div className="lg:hidden fixed bottom-4 left-3 right-3 z-30 bg-[#111c2d] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-[#2a3c57] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">
                      Making Cost
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-white">
                        {formatINR(liveEco.totalCogs)}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          liveEco.isCogsWithinTarget
                            ? "text-[#64d7a9]"
                            : "text-[#ff8f8f]"
                        }`}
                      >
                        ({formatPct(liveEco.cogsPct)} MRP)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setCostingMobileTab("result")}
                    className="px-3.5 py-1.5 bg-[#c58b4b] text-[#111c2d] text-xs font-bold rounded-xl shadow-xs whitespace-nowrap active:scale-95 flex items-center gap-1"
                  >
                    <span>View Result</span>
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 3: REVENUE TIMELINE (DAILY / MONTHLY / YEARLY)     */}
          {/* ======================================================== */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    Revenue & Realisation Engine
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17202d]">
                    Daily, Monthly & Yearly Revenue
                  </h2>
                  <p className="text-xs text-[#748092] mt-0.5">
                    Track gross earnings, customer refunds, and net bank
                    deposits by time period.
                  </p>
                </div>

                {/* Time Range Filter Tabs */}
                <div className="flex items-center bg-white border border-[#e7eaf0] rounded-xl p-1 shadow-2xs">
                  {(["today", "month", "year", "all"] as const).map(
                    (period) => (
                      <button
                        key={period}
                        onClick={() => setTimePeriod(period)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                          timePeriod === period
                            ? "bg-[#111c2d] text-white shadow-xs"
                            : "text-[#748092] hover:text-[#17202d]"
                        }`}
                      >
                        {period === "month"
                          ? "This Month"
                          : period === "year"
                            ? "This Year"
                            : period === "today"
                              ? "Today"
                              : "All Time"}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* 5 Revenue KPI Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-[#748092]">
                    Gross Sales
                  </span>
                  <div className="text-xl font-black text-[#17202d] mt-1">
                    {formatINR(totalGrossRevenue)}
                  </div>
                  <span className="text-[10px] text-[#748092]">
                    Before return deductions
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-[#c44e4e]">
                    Return Deductions
                  </span>
                  <div className="text-xl font-black text-[#c44e4e] mt-1">
                    -{formatINR(totalReturnDeduction)}
                  </div>
                  <span className="text-[10px] text-[#748092]">
                    Refund loss provision
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-[#16835d]">
                    Net Revenue
                  </span>
                  <div className="text-xl font-black text-[#16835d] mt-1">
                    {formatINR(totalNetRevenue)}
                  </div>
                  <span className="text-[10px] text-[#16835d] font-semibold">
                    Clean realization
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-[#748092]">
                    Units Sold
                  </span>
                  <div className="text-xl font-black text-[#2563eb] mt-1">
                    {totalUnitsSold} pcs
                  </div>
                  <span className="text-[10px] text-[#748092]">
                    Delivered pieces
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-[#748092]">
                    Avg Realization / Unit
                  </span>
                  <div className="text-xl font-black text-[#17202d] mt-1">
                    {formatINR(
                      totalUnitsSold > 0 ? totalNetRevenue / totalUnitsSold : 0,
                    )}
                  </div>
                  <span className="text-[10px] text-[#748092]">
                    Net ₹ per garment
                  </span>
                </div>
              </div>

              {/* Log Sales Form */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#e7eaf0] pb-3">
                  <h3 className="font-bold text-sm text-[#17202d] flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#c58b4b]" />
                    Log Actual Sales Record
                  </h3>
                  <span className="text-xs text-[#748092]">
                    Updates delivered count and deducts from batch stock
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={saleForm.date}
                      onChange={(e) =>
                        setSaleForm({ ...saleForm, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Channel
                    </label>
                    <select
                      value={saleForm.channel}
                      onChange={(e) =>
                        setSaleForm({
                          ...saleForm,
                          channel: e.target.value as SaleRecord["channel"],
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-semibold"
                    >
                      <option>Myntra</option>
                      <option>Amazon</option>
                      <option>Flipkart</option>
                      <option>Shopify</option>
                      <option>Offline</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Garment Style
                    </label>
                    <select
                      value={saleForm.sku}
                      onChange={(e) => {
                        const s = e.target.value;
                        const p = products.find((x) => x.sku === s);
                        setSaleForm({
                          ...saleForm,
                          sku: s,
                          salePrice: p ? Math.round(p.mrp * 0.9) : 1349,
                        });
                      }}
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-bold"
                    >
                      {products.map((p) => (
                        <option key={p.sku} value={p.sku}>
                          {p.sku} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Quantity Sold
                    </label>
                    <input
                      type="text"
                      value={saleForm.qty}
                      onChange={(e) =>
                        setSaleForm({
                          ...saleForm,
                          qty: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Sale Price / pc (₹)
                    </label>
                    <input
                      type="text"
                      value={saleForm.salePrice}
                      onChange={(e) =>
                        setSaleForm({
                          ...saleForm,
                          salePrice: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-bold text-[#16835d]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end pt-2">
                  <button
                    onClick={handleAddSale}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#111c2d] hover:bg-[#1f2f47] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 text-center"
                  >
                    + Record Sale & Update Revenue
                  </button>
                </div>
              </div>

              {/* Channel Breakdown & Recent Sales Table */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#e7eaf0] pb-3">
                  <h3 className="font-bold text-sm text-[#17202d]">
                    Channel-Wise Sales Performance ({timePeriod.toUpperCase()})
                  </h3>
                  <span className="text-xs text-[#748092]">
                    {filteredSales.length} recorded sales entries
                  </span>
                </div>

                {/* Mobile View (sm:hidden): Native-feeling Clean Cards */}
                <div className="sm:hidden space-y-3">
                  {filteredSales.map((s) => (
                    <div
                      key={s.id}
                      className="bg-[#f5f6f8] border border-[#e7eaf0] rounded-xl p-3.5 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#111c2d] bg-white border border-[#dfe4eb] px-2.5 py-0.5 rounded-lg shadow-2xs">
                            {s.channel}
                          </span>
                          <span className="text-[10px] text-[#748092] font-semibold">
                            {s.date}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteSale(s.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition"
                          title="Delete sale entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <span className="font-extrabold text-xs text-[#17202d] block">
                          {s.sku}
                        </span>
                        <span className="text-[11px] text-[#748092] block truncate">
                          {s.productName}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#dfe4eb] text-center">
                        <div>
                          <span className="text-[9px] text-[#748092] uppercase font-bold block">
                            Qty Sold
                          </span>
                          <span className="font-bold text-xs text-[#2563eb]">
                            {s.qty} pcs
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#748092] uppercase font-bold block">
                            Price / pc
                          </span>
                          <span className="font-bold text-xs text-[#17202d]">
                            {formatINR(s.salePrice)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#748092] uppercase font-bold block">
                            Net Revenue
                          </span>
                          <span className="font-black text-xs text-[#16835d]">
                            {formatINR(s.netRevenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredSales.length === 0 && (
                    <div className="text-center py-6 text-xs text-[#748092]">
                      No sales recorded for this period.
                    </div>
                  )}
                </div>

                {/* Desktop / Tablet View (hidden sm:block): Full High-Density Table */}
                <div className="hidden sm:block overflow-x-auto no-scrollbar -mx-5 sm:mx-0 px-5 sm:px-0">
                  <table className="w-full text-left text-xs min-w-170">
                    <thead>
                      <tr className="border-b border-[#e7eaf0] text-[#748092] text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Channel</th>
                        <th className="py-2.5 px-3">Style / SKU</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Price / pc</th>
                        <th className="py-2.5 px-3 text-right">Gross ₹</th>
                        <th className="py-2.5 px-3 text-right">
                          Return Deduct
                        </th>
                        <th className="py-2.5 px-3 text-right">Net Revenue</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {filteredSales.map((s) => (
                        <tr
                          key={s.id}
                          className="hover:bg-gray-50/80 transition"
                        >
                          <td className="py-3 px-3 text-[#748092] whitespace-nowrap">
                            {s.date}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-bold text-[#17202d] bg-[#f5f6f8] px-2 py-0.5 rounded border border-[#dfe4eb]">
                              {s.channel}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-[#17202d] block whitespace-nowrap">
                              {s.sku}
                            </span>
                            <span className="text-[10px] text-[#748092] block truncate max-w-45">
                              {s.productName}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-[#2563eb] whitespace-nowrap">
                            {s.qty}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold whitespace-nowrap">
                            {formatINR(s.salePrice)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold whitespace-nowrap">
                            {formatINR(s.grossRevenue)}
                          </td>
                          <td className="py-3 px-3 text-right text-[#c44e4e] whitespace-nowrap">
                            -{formatINR(s.returnDeduction)}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-[#16835d] whitespace-nowrap">
                            {formatINR(s.netRevenue)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteSale(s.id)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded transition"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 4: PROFIT & LOSS REPORTS                           */}
          {/* ======================================================== */}
          {activeTab === "profitability" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    P1 · Decision Intelligence
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17202d]">
                    Profit & Loss (P&L) Reports
                  </h2>
                  <p className="text-xs text-[#748092] mt-0.5">
                    Examine which garments made real money and whether the
                    factory covered its fixed overheads.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPnLToExcel}
                    className="px-3.5 py-2 bg-[#16835d] hover:bg-[#126b4c] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                    title="Export complete Profit & Loss report to Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                    <span>Export to Excel</span>
                  </button>
                </div>
              </div>

              {/* Company Net Position Box */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#e7eaf0] pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#17202d]">
                      Company Net Profit & Burn Position Check
                    </h3>
                    <p className="text-xs text-[#748092]">
                      Total product contribution margin (CM2) minus factory
                      overheads
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#c58b4b] bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                    {currentMonthYearName}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <span className="text-xs text-[#748092] font-semibold">
                      Net Delivered Garments
                    </span>
                    <div className="text-2xl font-bold text-[#17202d] mt-1">
                      {batches.reduce((a, b) => a + b.netSoldQty, 0)} pcs
                    </div>
                    <span className="text-[11px] text-[#748092]">
                      Kept by customers
                    </span>
                  </div>

                  <div className="p-4 bg-[#eff6ff] rounded-xl">
                    <span className="text-xs text-[#2563eb] font-semibold">
                      Total Product Margin (CM2)
                    </span>
                    <div className="text-2xl font-bold text-[#2563eb] mt-1">
                      {formatINR(totalProductGrossCM2)}
                    </div>
                    <span className="text-[11px] text-[#2563eb]">
                      Before fixed overheads
                    </span>
                  </div>

                  <div className="p-4 bg-[#fff0f0] rounded-xl">
                    <span className="text-xs text-[#c44e4e] font-semibold">
                      Fixed Factory Burn
                    </span>
                    <div className="text-2xl font-bold text-[#c44e4e] mt-1">
                      {formatINR(totalMonthlyOverheads)}
                    </div>
                    <span className="text-[11px] text-[#c44e4e]">
                      Salary, rent & electricity
                    </span>
                  </div>

                  <div
                    className={`p-4 rounded-xl ${
                      trueNetProfit >= 0
                        ? "bg-[#edf7f2] border border-[#c4e3d3]"
                        : "bg-red-950 text-white"
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold ${
                        trueNetProfit >= 0 ? "text-[#16835d]" : "text-red-200"
                      }`}
                    >
                      True Net Factory Profit
                    </span>
                    <div
                      className={`text-2xl font-black mt-1 ${
                        trueNetProfit >= 0 ? "text-[#16835d]" : "text-white"
                      }`}
                    >
                      {formatINR(trueNetProfit)}
                    </div>
                    <span
                      className={`text-[11px] font-medium ${
                        trueNetProfit >= 0 ? "text-[#16835d]" : "text-red-300"
                      }`}
                    >
                      {trueNetProfit >= 0
                        ? "In-hand cash surplus ✓"
                        : "Factory in net burn ⚠"}
                    </span>
                  </div>
                </div>
              </div>

              {/* SKU-Wise P&L Breakdown */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-[#17202d]">
                    SKU-Wise Profitability Ranking
                  </h3>
                  <span className="text-xs text-[#748092]">
                    Ranked by per-piece CM3 margin %
                  </span>
                </div>

                <div className="overflow-x-auto no-scrollbar -mx-5 sm:mx-0 px-5 sm:px-0">
                  <table className="w-full text-left text-xs min-w-180">
                    <thead>
                      <tr className="border-b border-[#e7eaf0] text-[#748092] text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Style SKU</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">MRP</th>
                        <th className="py-2.5 px-3">Making Cost</th>
                        <th className="py-2.5 px-3">CM1 Realisation</th>
                        <th className="py-2.5 px-3">CM2 Gross</th>
                        <th className="py-2.5 px-3">CM3 Pocket Cash</th>
                        <th className="py-2.5 px-3">Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {products.map((p) => {
                        const marginPct = p.mrp ? (p.cm3 / p.mrp) * 100 : 0;
                        return (
                          <tr key={p.sku} className="hover:bg-gray-50/80">
                            <td className="py-3 px-3">
                              <span className="font-bold text-[#17202d]">
                                {p.sku}
                              </span>
                              <span className="block text-[11px] text-[#748092]">
                                {p.name}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[#566273]">
                              {p.category}
                            </td>
                            <td className="py-3 px-3 font-semibold">
                              {formatINR(p.mrp)}
                            </td>
                            <td className="py-3 px-3 text-[#748092]">
                              {formatINR(p.totalCogs)}
                            </td>
                            <td className="py-3 px-3 text-[#16835d]">
                              {formatINR(p.cm1)}
                            </td>
                            <td className="py-3 px-3 font-semibold text-[#2563eb]">
                              {formatINR(p.cm2)}
                            </td>
                            <td
                              className={`py-3 px-3 font-black ${
                                p.cm3 >= 0 ? "text-[#16835d]" : "text-[#c44e4e]"
                              }`}
                            >
                              {formatINR(p.cm3)}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  marginPct >= 15
                                    ? "bg-[#edf7f2] text-[#16835d]"
                                    : marginPct >= 5
                                      ? "bg-[#fff4e5] text-[#a66a1d]"
                                      : "bg-[#fff0f0] text-[#c44e4e]"
                                }`}
                              >
                                {formatPct(marginPct)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 5: STOCK-WISE OVERVIEW (TOP 100 ITEMS)             */}
          {/* ======================================================== */}
          {activeTab === "stock_top" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    Inventory Valuation
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17202d]">
                    Stock-Wise Overview (Ranked by Blocked Capital)
                  </h2>
                  <p className="text-xs text-[#748092] mt-0.5">
                    Sort and inspect batches by the exact rupee value stuck in
                    the factory floor.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeadStockInfoModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition"
                    title="View Dead Stock & Ageing Rules"
                  >
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ageing Policy</span>
                  </button>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#748092]" />
                    <input
                      type="text"
                      placeholder="Search SKU or Name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-[#dfe4eb] rounded-lg text-xs outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 sm:p-5 shadow-2xs min-w-0 w-full">
                <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full text-left text-xs min-w-195">
                    <thead>
                      <tr className="border-b border-[#e7eaf0] text-[#748092] text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Batch ID</th>
                        <th className="py-2.5 px-3">Style / SKU</th>
                        <th className="py-2.5 px-3">Produced</th>
                        <th className="py-2.5 px-3">Net Sold</th>
                        <th className="py-2.5 px-3">On Hand</th>
                        <th className="py-2.5 px-3">Unit Making Cost</th>
                        <th className="py-2.5 px-3">Blocked Rupee Capital</th>
                        <th className="py-2.5 px-3">Age</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {[...batches]
                        .filter(
                          (b) =>
                            b.sku
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            b.productName
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            b.id
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                        )
                        .sort((a, b) => b.blockedCapital - a.blockedCapital)
                        .map((b, idx) => (
                          <tr key={b.id} className="hover:bg-gray-50/80">
                            <td className="py-3 px-3 font-bold text-[#748092]">
                              #{idx + 1}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#17202d]">
                              {b.id}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-[#17202d]">
                                {b.sku}
                              </span>
                              <span className="block text-[10px] text-[#748092]">
                                {b.productName}
                              </span>
                            </td>
                            <td className="py-3 px-3">{b.producedQty}</td>
                            <td className="py-3 px-3 text-[#16835d] font-semibold">
                              {b.netSoldQty}
                            </td>
                            <td className="py-3 px-3 font-extrabold text-[#17202d]">
                              {b.onHandQty} pcs
                            </td>
                            <td className="py-3 px-3 text-[#748092]">
                              {formatINR(b.unitCogs)}
                            </td>
                            <td className="py-3 px-3 font-black text-[#c44e4e]">
                              {formatINR(b.blockedCapital)}
                            </td>
                            <td className="py-3 px-3 text-gray-600">
                              {b.ageDays}d
                            </td>
                            <td className="py-3 px-3">
                              {renderBatchStatusBadge(b.status)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 6: BATCH REGISTER                                  */}
          {/* ======================================================== */}
          {activeTab === "batches" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    P1 · Stock & Inventory Exposure
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17202d]">
                    Production Batch & Inventory Watch
                  </h2>
                  <p className="text-xs text-[#748092] mt-0.5">
                    Historical making cost stays locked at time of production so
                    past accounting remains clean.
                  </p>
                </div>
              </div>

              {/* 4 Stock Exposure KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                  <span className="text-xs text-[#748092] font-semibold">
                    Total Produced
                  </span>
                  <div className="text-2xl font-bold text-[#17202d] mt-1">
                    {batches.reduce((a, b) => a + b.producedQty, 0)} pcs
                  </div>
                  <span className="text-[11px] text-[#748092]">
                    Across {batches.length} tracked batches
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                  <span className="text-xs text-[#748092] font-semibold">
                    Net Customer Sold
                  </span>
                  <div className="text-2xl font-bold text-[#16835d] mt-1">
                    {batches.reduce((a, b) => a + b.netSoldQty, 0)} pcs
                  </div>
                  <span className="text-[11px] text-[#748092]">
                    Delivered and kept
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                  <span className="text-xs text-[#748092] font-semibold">
                    Warehouse On-Hand
                  </span>
                  <div className="text-2xl font-bold text-[#17202d] mt-1">
                    {totalStockOnHand} pcs
                  </div>
                  <span className="text-[11px] text-[#748092]">
                    Unsold & returned pieces
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                  <span className="text-xs text-[#748092] font-semibold">
                    Blocked Factory Capital
                  </span>
                  <div className="text-2xl font-bold text-[#c44e4e] mt-1">
                    {formatINR(totalBlockedCapital)}
                  </div>
                  <span className="text-[11px] text-[#c44e4e] font-semibold">
                    {atRiskBatches.length} batches needing liquidation
                  </span>
                </div>
              </div>

              {/* Add Batch Form */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#e7eaf0] pb-3">
                  <h3 className="font-bold text-sm text-[#17202d] flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#c58b4b]" />
                    Record New Batch Production Run
                  </h3>
                  <span className="text-xs text-[#748092]">
                    Historical unit cost stays locked
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Batch ID
                    </label>
                    <input
                      type="text"
                      value={batchForm.id}
                      onChange={(e) =>
                        setBatchForm({ ...batchForm, id: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Select Garment SKU
                    </label>
                    <select
                      value={batchForm.sku}
                      onChange={(e) =>
                        setBatchForm({ ...batchForm, sku: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-semibold"
                    >
                      {products.map((p) => (
                        <option key={p.sku} value={p.sku}>
                          {p.sku} — {p.name} (Making Cost{" "}
                          {formatINR(p.totalCogs)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Produced Qty
                    </label>
                    <input
                      type="text"
                      value={batchForm.producedQty}
                      onChange={(e) =>
                        setBatchForm({
                          ...batchForm,
                          producedQty: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Age in Days
                    </label>
                    <input
                      type="text"
                      value={batchForm.ageDays}
                      onChange={(e) =>
                        setBatchForm({
                          ...batchForm,
                          ageDays: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Status
                    </label>
                    <select
                      value={batchForm.status}
                      onChange={(e) =>
                        setBatchForm({
                          ...batchForm,
                          status: e.target.value as ProductionBatch["status"],
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-medium"
                    >
                      <option>Active</option>
                      <option>Ageing</option>
                      <option>Liquidation</option>
                      <option>Dead stock</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAddBatch}
                    className="px-4 py-2 bg-[#111c2d] hover:bg-[#1f2f47] text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    + Add to Batch Register
                  </button>
                </div>
              </div>

              {/* Batch Register Table */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 sm:p-5 shadow-2xs min-w-0 w-full">
                <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full text-left text-xs min-w-210">
                    <thead>
                      <tr className="border-b border-[#e7eaf0] text-[#748092] text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Batch ID</th>
                        <th className="py-2.5 px-3">Style / SKU</th>
                        <th className="py-2.5 px-3">Produced</th>
                        <th className="py-2.5 px-3">Gross Sold</th>
                        <th className="py-2.5 px-3">Returns</th>
                        <th className="py-2.5 px-3">Net Sold</th>
                        <th className="py-2.5 px-3">On Hand</th>
                        <th className="py-2.5 px-3">Unit Cost</th>
                        <th className="py-2.5 px-3">Blocked ₹</th>
                        <th className="py-2.5 px-3">Age</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {batches.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/80">
                          <td className="py-3 px-3 font-bold text-[#17202d]">
                            {b.id}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#17202d]">
                              {b.sku}
                            </span>
                            <span className="block text-[11px] text-[#748092] truncate max-w-35">
                              {b.productName}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold">
                            {b.producedQty}
                          </td>
                          <td className="py-3 px-3 text-[#2563eb]">
                            {b.grossSoldQty}
                          </td>
                          <td className="py-3 px-3 text-[#c44e4e]">
                            {b.returnedQty}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#16835d]">
                            {b.netSoldQty}
                          </td>
                          <td className="py-3 px-3 font-extrabold text-[#17202d]">
                            {b.onHandQty}
                          </td>
                          <td className="py-3 px-3 text-[#748092]">
                            {formatINR(b.unitCogs)}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#c44e4e]">
                            {formatINR(b.blockedCapital)}
                          </td>
                          <td className="py-3 px-3 font-medium text-gray-600">
                            {b.ageDays}d
                          </td>
                          <td className="py-3 px-3">
                            {renderBatchStatusBadge(b.status)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteBatch(b.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete batch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 7: DEAD STOCK & LIQUIDATION MANAGER                */}
          {/* ======================================================== */}
          {activeTab === "liquidation" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    Capital Recovery Engine
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17202d]">
                    Dead Stock & Liquidation Manager
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeadStockInfoModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition"
                    title="View Dead Stock & Ageing Rules"
                  >
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dead Stock Policy</span>
                  </button>
                </div>
              </div>

              {/* Alert Header */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    {formatINR(atRiskVal)} of factory cash is currently locked
                    in {atRiskQty} slow-moving pieces.
                  </h4>
                </div>
              </div>

              {/* Interactive Liquidation Recovery Calculator */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-sm text-[#17202d] border-b border-[#e7eaf0] pb-2">
                  Interactive Liquidation Price Calculator
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Select Stuck Batch
                    </label>
                    <select
                      value={selectedLiquidationBatchId}
                      onChange={(e) =>
                        setSelectedLiquidationBatchId(e.target.value)
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-semibold"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.id} ({b.sku}) — {b.onHandQty} pcs ({b.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-[#566273]">
                        Target Recovery Percentage
                      </label>
                      <span className="text-xs font-bold text-[#c58b4b]">
                        {liquidationRecoveryPct}% of cost
                      </span>
                    </div>
                    <input
                      type="text"
                      value={liquidationRecoveryPct}
                      onChange={(e) =>
                        setLiquidationRecoveryPct(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <button
                      onClick={() =>
                        handleUpdateBatchStatus(
                          selectedLiquidationBatchId,
                          "Liquidation",
                          targetRecoveryPrice,
                        )
                      }
                      className="w-full py-2 bg-[#111c2d] hover:bg-[#1e2f47] text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Apply Liquidation Tag & Price (
                      {formatINR(targetRecoveryPrice)})
                    </button>
                  </div>
                </div>

                {selectedLiqBatch && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#748092] block">
                        Original Unit Cost
                      </span>
                      <span className="font-bold text-[#17202d]">
                        {formatINR(selectedLiqBatch.unitCogs)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#748092] block">
                        Liquidation Price / pc
                      </span>
                      <span className="font-extrabold text-[#c58b4b]">
                        {formatINR(targetRecoveryPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#748092] block">
                        Total Cash Recovered
                      </span>
                      <span className="font-black text-[#16835d]">
                        +{formatINR(projectedRecoveryRupees)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#748092] block">
                        Write-Off Loss Saved
                      </span>
                      <span className="font-bold text-[#2563eb]">
                        {formatINR(projectedRecoveryRupees)} recovered
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stuck Stock Register */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-[#17202d]">
                    Ageing & Dead Batches Register
                  </h3>
                  <span className="text-xs text-[#748092]">
                    {atRiskBatches.length} items flagged
                  </span>
                </div>

                <div className="overflow-x-auto no-scrollbar -mx-5 sm:mx-0 px-5 sm:px-0">
                  <table className="w-full text-left text-xs min-w-195">
                    <thead>
                      <tr className="border-b border-[#e7eaf0] text-[#748092] text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Batch ID</th>
                        <th className="py-2.5 px-3">Style SKU</th>
                        <th className="py-2.5 px-3">On Hand</th>
                        <th className="py-2.5 px-3">Age in Days</th>
                        <th className="py-2.5 px-3">Unit Cost</th>
                        <th className="py-2.5 px-3">Blocked Capital</th>
                        <th className="py-2.5 px-3">Liquidation Price</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {batches
                        .filter((b) => b.status !== "Active")
                        .map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50/80">
                            <td className="py-3 px-3 font-bold text-[#17202d]">
                              {b.id}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-[#17202d]">
                                {b.sku}
                              </span>
                              <span className="block text-[10px] text-[#748092]">
                                {b.productName}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-extrabold text-[#c44e4e]">
                              {b.onHandQty} pcs
                            </td>
                            <td className="py-3 px-3 text-gray-700 font-semibold">
                              {b.ageDays}d
                            </td>
                            <td className="py-3 px-3 text-[#748092]">
                              {formatINR(b.unitCogs)}
                            </td>
                            <td className="py-3 px-3 font-black text-[#c44e4e]">
                              {formatINR(b.blockedCapital)}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#c58b4b]">
                              {b.liquidationPrice
                                ? formatINR(b.liquidationPrice)
                                : "—"}
                            </td>
                            <td className="py-3 px-3">
                              {renderBatchStatusBadge(b.status)}
                            </td>
                            <td className="py-3 px-3 text-right space-x-2">
                              <button
                                onClick={() =>
                                  handleOpenRevivalModal(b.sku, b.onHandQty)
                                }
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                title="Recreate or revive these stuck units into a new SKU version"
                              >
                                <Sparkles className="w-3 h-3 text-emerald-500" />
                                <span>Revive SKU</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateBatchStatus(
                                    b.id,
                                    "Liquidation",
                                    b.liquidationPrice,
                                  )
                                }
                                className="text-xs font-bold text-[#c58b4b] hover:underline"
                              >
                                Liquidate
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateBatchStatus(b.id, "Dead stock")
                                }
                                className="text-xs font-bold text-red-600 hover:underline"
                              >
                                Write Off
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 7B: DEAD SKU GRAVEYARD & REVIVAL STUDIO           */}
          {/* ======================================================== */}
          {activeTab === "dead_revival" && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    Stock Recovery & Re-creation
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17202d]">
                    Dead SKUs &amp; Revival Studio
                  </h2>
                  <p className="text-xs text-[#748092]">
                    Inspect stuck inventory and recreate dead pieces into profitable new SKU versions with origin tracking.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("liquidation")}
                    className="px-3 py-2 bg-white border border-[#e7eaf0] text-xs font-semibold rounded-xl text-[#17202d] hover:bg-gray-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <PackageX className="w-3.5 h-3.5 text-[#c58b4b]" />
                    <span>Dead Stock Risk</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("skus")}
                    className="px-3.5 py-2 bg-[#111c2d] hover:bg-[#1e2f47] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span>Style Catalog</span>
                  </button>
                </div>
              </div>

              {/* Top Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-xs text-[#748092] font-semibold">
                    Stuck Dead Units
                  </span>
                  <div className="text-2xl font-black text-[#c44e4e] mt-1">
                    {atRiskQty} pcs
                  </div>
                  <span className="text-[11px] text-[#748092]">
                    Available for remanufacturing
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-xs text-[#748092] font-semibold">
                    Locked Factory Capital
                  </span>
                  <div className="text-2xl font-black text-[#c44e4e] mt-1">
                    {formatINR(atRiskVal)}
                  </div>
                  <span className="text-[11px] text-[#748092]">
                    Capital at risk of complete loss
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-xs text-[#748092] font-semibold">
                    Stagnant Dead SKUs
                  </span>
                  <div className="text-2xl font-bold text-[#17202d] mt-1">
                    {deadSkusList.length} Styles
                  </div>
                  <span className="text-[11px] text-[#748092]">
                    Batches aged &gt;30–90 days
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-xs text-[#16835d] font-semibold">
                    Revived SKUs Created
                  </span>
                  <div className="text-2xl font-black text-[#16835d] mt-1">
                    {products.filter((p) => p.isRevivedVersion).length} Styles
                  </div>
                  <span className="text-[11px] text-[#16835d]">
                    Upcycled into fresh versions ✓
                  </span>
                </div>
              </div>

              {/* Selected Dead SKU Detailed Inspection Card */}
              {activeInspectedDeadSku && (
                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e7eaf0] pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#c58b4b] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          {activeInspectedDeadSku.category}
                        </span>
                        <h3 className="font-bold text-base text-[#17202d]">
                          {activeInspectedDeadSku.sku} — {activeInspectedDeadSku.productName}
                        </h3>
                        {renderBatchStatusBadge(activeInspectedDeadSku.status)}
                      </div>
                      <p className="text-xs text-[#748092] mt-0.5">
                        Deep SKU inspection: review original BOM, costs, and stuck units before recreation.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleOpenRevivalModal(
                          activeInspectedDeadSku.sku,
                          activeInspectedDeadSku.onHandQty,
                        )
                      }
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>
                        Recreate &amp; Revive ({activeInspectedDeadSku.onHandQty} pcs)
                      </span>
                    </button>
                  </div>

                  {/* Inspection Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-100">
                      <span className="text-[11px] text-[#748092] font-semibold block">
                        Stuck Inventory (On Hand)
                      </span>
                      <div className="text-xl font-black text-[#c44e4e] mt-1">
                        {activeInspectedDeadSku.onHandQty} pieces
                      </div>
                      <span className="text-[10px] text-red-600 font-medium">
                        Age: {activeInspectedDeadSku.ageDays} days in warehouse
                      </span>
                    </div>

                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-[11px] text-[#748092] font-semibold block">
                        Locked Capital
                      </span>
                      <div className="text-xl font-bold text-[#17202d] mt-1">
                        {formatINR(activeInspectedDeadSku.blockedCapital)}
                      </div>
                      <span className="text-[10px] text-[#748092]">
                        Unit COGS: {formatINR(activeInspectedDeadSku.product?.totalCogs || 0)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-[11px] text-[#748092] font-semibold block">
                        Fabric Specification
                      </span>
                      <div className="text-base font-bold text-[#17202d] mt-1 truncate">
                        {activeInspectedDeadSku.fabricType}
                      </div>
                      <span className="text-[10px] text-[#748092]">
                        {activeInspectedDeadSku.product?.fabricQty || 1.35}m @ {formatINR(activeInspectedDeadSku.product?.fabricRate || 180)}/m
                      </span>
                    </div>

                    <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <span className="text-[11px] text-[#16835d] font-semibold block">
                        Revival Opportunity
                      </span>
                      <div className="text-base font-bold text-[#16835d] mt-1">
                        Upcycle to New Style
                      </div>
                      <span className="text-[10px] text-emerald-700">
                        Remake {activeInspectedDeadSku.onHandQty} pcs to recover cash
                      </span>
                    </div>
                  </div>

                  {/* Remake Advice Banner */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#17202d] flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-[#c58b4b]" />
                        <span>Factory Rework Strategy for {activeInspectedDeadSku.sku}:</span>
                      </span>
                      <p className="text-[#566273] text-[11px]">
                        Instead of writing off {activeInspectedDeadSku.onHandQty} pieces for zero salvage, the tailoring team can alter sleeves, attach contrasting trims or lace, adjust necklines, or overdye to launch a brand new high-margin SKU.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleOpenRevivalModal(
                          activeInspectedDeadSku.sku,
                          activeInspectedDeadSku.onHandQty,
                        )
                      }
                      className="px-3.5 py-2 bg-[#111c2d] hover:bg-[#1e2f47] text-white text-xs font-bold rounded-xl shrink-0 transition active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      ✨ Launch Remake Wizard
                    </button>
                  </div>
                </div>
              )}

              {/* Dead SKUs Master Table */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#17202d]">
                      Dead &amp; Stuck SKU Directory
                    </h3>
                    <p className="text-xs text-[#748092]">
                      Click any SKU row to inspect details or launch revival
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#748092]">
                    {deadSkusList.length} Dead Styles
                  </span>
                </div>

                <div className="overflow-x-auto no-scrollbar -mx-5 sm:mx-0 px-5 sm:px-0">
                  <table className="w-full text-left text-xs min-w-180">
                    <thead>
                      <tr className="border-b border-[#e7eaf0] text-[#748092] text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Dead SKU</th>
                        <th className="py-2.5 px-3">Style Name &amp; Category</th>
                        <th className="py-2.5 px-3">Stuck Pieces</th>
                        <th className="py-2.5 px-3">Age in Days</th>
                        <th className="py-2.5 px-3">Blocked Capital</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {deadSkusList.map((item) => {
                        const isSelected =
                          activeInspectedDeadSku?.sku === item.sku;
                        return (
                          <tr
                            key={item.sku}
                            onClick={() => setSelectedDeadSkuForDetails(item.sku)}
                            className={`cursor-pointer transition ${
                              isSelected ? "bg-amber-50/50" : "hover:bg-gray-50/80"
                            }`}
                          >
                            <td className="py-3 px-3">
                              <span className="font-bold text-[#17202d]">
                                {item.sku}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-[#17202d] block">
                                {item.productName}
                              </span>
                              <span className="text-[10px] text-[#748092]">
                                {item.category} • {item.fabricType}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-extrabold text-[#c44e4e]">
                              {item.onHandQty} pcs
                            </td>
                            <td className="py-3 px-3 font-semibold text-gray-700">
                              {item.ageDays}d
                            </td>
                            <td className="py-3 px-3 font-black text-[#c44e4e]">
                              {formatINR(item.blockedCapital)}
                            </td>
                            <td className="py-3 px-3">
                              {renderBatchStatusBadge(item.status)}
                            </td>
                            <td
                              className="py-3 px-3 text-right space-x-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => setSelectedDeadSkuForDetails(item.sku)}
                                className="text-xs font-semibold text-[#748092] hover:text-[#17202d] hover:underline cursor-pointer"
                              >
                                Inspect
                              </button>
                              <button
                                onClick={() =>
                                  handleOpenRevivalModal(item.sku, item.onHandQty)
                                }
                                className="px-3 py-1.5 bg-[#edf7f2] hover:bg-[#d8efe2] text-[#16835d] text-xs font-bold rounded-lg border border-[#16835d]/20 transition inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-[#16835d]" />
                                <span>Revive</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Showcase of Revived SKUs */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#17202d] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Revived SKU Versions (Active Reworks)</span>
                    </h3>
                    <p className="text-xs text-[#748092]">
                      New styles created from original dead inventory batches
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {products.filter((p) => p.isRevivedVersion).length} Revived Styles
                  </span>
                </div>

                {products.filter((p) => p.isRevivedVersion).length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#748092] bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p>No revived versions created yet.</p>
                    <p className="mt-1">
                      Click <strong className="text-[#17202d]">&quot;Revive&quot;</strong> on any dead SKU above to remake stuck pieces into a new version.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {products
                      .filter((p) => p.isRevivedVersion)
                      .map((p) => (
                        <div
                          key={p.sku}
                          className="bg-[#fcfdfd] border border-[#d1fae5] rounded-xl p-4 space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-black uppercase text-[#16835d]">
                                {p.category}
                              </span>
                              <h4 className="font-bold text-sm text-[#17202d]">
                                {p.sku}
                              </h4>
                              <p className="text-xs text-[#748092]">{p.name}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#edf7f2] text-[#16835d]">
                              Active
                            </span>
                          </div>

                          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2 text-[11px] text-amber-900">
                            <span className="font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>Remade from Dead SKU:</span>
                            </span>
                            <span className="font-mono font-bold text-[#17202d]">
                              {p.revivedFromSku}
                            </span>{" "}
                            ({p.revivedFromQty || 50} pieces remanufactured)
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                            <div>
                              <span className="text-[10px] text-[#748092] block">
                                Making Cost
                              </span>
                              <span className="font-bold text-[#17202d]">
                                {formatINR(p.totalCogs)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#748092] block">
                                MRP
                              </span>
                              <span className="font-bold text-[#17202d]">
                                {formatINR(p.mrp)}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedSku(p.sku);
                              setActiveTab("costing");
                            }}
                            className="w-full py-1.5 bg-white border border-[#e2e8f0] hover:bg-gray-50 text-xs font-semibold rounded-lg text-[#17202d] transition cursor-pointer"
                          >
                            Open in Costing Studio
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 8: RETURNS WATCH                                   */}
          {/* ======================================================== */}
          {activeTab === "returns" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    Returns Watch & Loss Prevention
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17202d]">
                    Customer Returns & Reverse Logistics
                  </h2>
                  <p className="text-xs text-[#748092] mt-0.5">
                    Track returned quantities, root reasons (size vs fabric
                    defect), and courier bleed.
                  </p>
                </div>
              </div>

              {/* 4 Returns Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-[#748092]">
                    Total Returns Logged
                  </span>
                  <div className="text-2xl font-black text-[#17202d] mt-1">
                    {returns.reduce((a, r) => a + r.returnQty, 0)} pcs
                  </div>
                  <span className="text-[10px] text-[#748092]">
                    {returns.length} return events
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-[#748092]">
                    Highest Return Channel
                  </span>
                  <div className="text-2xl font-black text-[#2563eb] mt-1">
                    Myntra
                  </div>
                  <span className="text-[10px] text-[#748092]">
                    Homewear & Kurti highest
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-[#16835d]">
                    Resaleable Restocked
                  </span>
                  <div className="text-2xl font-black text-[#16835d] mt-1">
                    {returns
                      .filter((r) => r.condition.includes("Resaleable"))
                      .reduce((a, r) => a + r.returnQty, 0)}{" "}
                    pcs
                  </div>
                  <span className="text-[10px] text-[#16835d] font-semibold">
                    Added back to stock
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-[#c44e4e]">
                    Total Return Loss Spend
                  </span>
                  <div className="text-2xl font-black text-[#c44e4e] mt-1">
                    {formatINR(
                      totalReturnRefundSpend + totalReverseCourierSpend,
                    )}
                  </div>
                  <span className="text-[10px] text-[#c44e4e]">
                    Refunds + reverse shipping
                  </span>
                </div>
              </div>

              {/* Log Return Form */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#e7eaf0] pb-3">
                  <h3 className="font-bold text-sm text-[#17202d] flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#c58b4b]" />
                    Log Return Incident
                  </h3>
                  <span className="text-xs text-[#748092]">
                    Resaleable returns automatically restore warehouse stock
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Channel
                    </label>
                    <select
                      value={returnForm.marketplace}
                      onChange={(e) =>
                        setReturnForm({
                          ...returnForm,
                          marketplace: e.target
                            .value as ReturnRecord["marketplace"],
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs"
                    >
                      <option>Myntra</option>
                      <option>Amazon</option>
                      <option>Flipkart</option>
                      <option>Shopify</option>
                      <option>Offline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Select SKU
                    </label>
                    <select
                      value={returnForm.sku}
                      onChange={(e) => {
                        const s = e.target.value;
                        const p = products.find((x) => x.sku === s);
                        setReturnForm({
                          ...returnForm,
                          sku: s,
                          refundAmount: p?.mrp || 1499,
                        });
                      }}
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-semibold"
                    >
                      {products.map((p) => (
                        <option key={p.sku} value={p.sku}>
                          {p.sku} ({p.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Return Reason
                    </label>
                    <select
                      value={returnForm.reason}
                      onChange={(e) =>
                        setReturnForm({
                          ...returnForm,
                          reason: e.target.value as ReturnRecord["reason"],
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs"
                    >
                      <option>Size / Fit Issue</option>
                      <option>Fabric Quality / Defect</option>
                      <option>Not as Described</option>
                      <option>Changed Mind</option>
                      <option>RTO Undelivered</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Condition
                    </label>
                    <select
                      value={returnForm.condition}
                      onChange={(e) =>
                        setReturnForm({
                          ...returnForm,
                          condition: e.target
                            .value as ReturnRecord["condition"],
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs"
                    >
                      <option>Resaleable (Restocked)</option>
                      <option>Minor Defect (Repairable)</option>
                      <option>Damaged (Liquidation)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Return Qty
                    </label>
                    <input
                      type="text"
                      value={returnForm.returnQty}
                      onChange={(e) =>
                        setReturnForm({
                          ...returnForm,
                          returnQty: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Refund Amount (₹)
                    </label>
                    <input
                      type="text"
                      value={returnForm.refundAmount}
                      onChange={(e) =>
                        setReturnForm({
                          ...returnForm,
                          refundAmount: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Reverse Courier Fee (₹)
                    </label>
                    <input
                      type="text"
                      value={returnForm.reverseLogisticsFee}
                      onChange={(e) =>
                        setReturnForm({
                          ...returnForm,
                          reverseLogisticsFee: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddReturn}
                      className="w-full py-2 bg-[#111c2d] hover:bg-[#1f2f47] text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      + Save Return
                    </button>
                  </div>
                </div>
              </div>

              {/* Returns History */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 sm:p-5 shadow-2xs min-w-0 w-full">
                <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full text-left text-xs min-w-187.5">
                    <thead>
                      <tr className="border-b border-[#e7eaf0] text-[#748092] text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Channel</th>
                        <th className="py-2.5 px-3">Style SKU</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3">Condition</th>
                        <th className="py-2.5 px-3">Refund Amount</th>
                        <th className="py-2.5 px-3">Reverse Fee</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {returns.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/80">
                          <td className="py-3 px-3 text-[#748092]">{r.date}</td>
                          <td className="py-3 px-3 font-semibold text-[#111c2d]">
                            {r.marketplace}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#17202d]">
                            {r.sku}
                          </td>
                          <td className="py-3 px-3 font-extrabold text-[#c44e4e]">
                            {r.returnQty}
                          </td>
                          <td className="py-3 px-3 text-[#566273]">
                            {r.reason}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.condition.includes("Resaleable")
                                  ? "bg-[#edf7f2] text-[#16835d]"
                                  : "bg-[#fff0f0] text-[#c44e4e]"
                              }`}
                            >
                              {r.condition}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold">
                            {formatINR(r.refundAmount)}
                          </td>
                          <td className="py-3 px-3 text-[#c44e4e]">
                            {formatINR(r.reverseLogisticsFee)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteReturn(r.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete return"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 9: LOGISTICS & COURIER WATCH                       */}
          {/* ======================================================== */}
          {activeTab === "logistics" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    COTB · Cost of Doing Business
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17202d]">
                    Logistics & Courier Performance Watch
                  </h2>
                  <p className="text-xs text-[#748092] mt-0.5">
                    Forward shipping charges, RTO reverse freight, and courier
                    partner burn.
                  </p>
                </div>
              </div>

              {/* 3 Logistics KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                  <span className="text-xs font-bold text-[#748092]">
                    Forward Courier Outflow
                  </span>
                  <div className="text-2xl font-black text-[#17202d] mt-1">
                    {formatINR(totalForwardCourierSpend)}
                  </div>
                  <span className="text-[10px] text-[#748092]">
                    Across {sales.reduce((a, s) => a + s.qty, 0)} dispatched
                    parcels
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                  <span className="text-xs font-bold text-[#c44e4e]">
                    Reverse Pickup & RTO Fees
                  </span>
                  <div className="text-2xl font-black text-[#c44e4e] mt-1">
                    {formatINR(totalReverseCourierSpend)}
                  </div>
                  <span className="text-[10px] text-[#c44e4e]">
                    Direct freight loss on returns
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                  <span className="text-xs font-bold text-[#2563eb]">
                    Total Logistics Spend
                  </span>
                  <div className="text-2xl font-black text-[#2563eb] mt-1">
                    {formatINR(
                      totalForwardCourierSpend + totalReverseCourierSpend,
                    )}
                  </div>
                  <span className="text-[10px] text-[#2563eb]">
                    Shipping & reverse pickups combined
                  </span>
                </div>
              </div>

              {/* Logistics Breakdown Table */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                <h3 className="font-bold text-sm text-[#17202d] mb-3">
                  Courier Parameters & Rates per Style
                </h3>
                <div className="overflow-x-auto no-scrollbar -mx-5 sm:mx-0 px-5 sm:px-0">
                  <table className="w-full text-left text-xs min-w-180">
                    <thead>
                      <tr className="border-b border-[#e7eaf0] text-[#748092] text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Style SKU</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Forward Freight / pc</th>
                        <th className="py-2.5 px-3">Reverse Freight / pc</th>
                        <th className="py-2.5 px-3">Expected Return Rate</th>
                        <th className="py-2.5 px-3">Blended Logistics Cut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {products.map((p) => {
                        const blended =
                          p.logisticsCost +
                          p.reverseLogisticsCost * (p.expectedReturnsPct / 100);
                        return (
                          <tr key={p.sku} className="hover:bg-gray-50/80">
                            <td className="py-3 px-3">
                              <span className="font-bold text-[#17202d]">
                                {p.sku}
                              </span>
                              <span className="block text-[10px] text-[#748092]">
                                {p.name}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[#566273]">
                              {p.category}
                            </td>
                            <td className="py-3 px-3 font-semibold">
                              {formatINR(p.logisticsCost)}
                            </td>
                            <td className="py-3 px-3 text-[#c44e4e]">
                              {formatINR(p.reverseLogisticsCost)}
                            </td>
                            <td className="py-3 px-3">
                              {formatPct(p.expectedReturnsPct)}
                            </td>
                            <td className="py-3 px-3 font-black text-[#17202d]">
                              {formatINR(blended)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 10: FACTORY OVERHEADS & EXPENSES                   */}
          {/* ======================================================== */}
          {activeTab === "expenses" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    Company Burn Ledger
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17202d]">
                    Fixed Factory Overheads & Salaries
                  </h2>
                  <p className="text-xs text-[#748092] mt-0.5">
                    As {config.ownerName || "Atiq"} requested: Overheads are
                    tracked separately so garment contribution margin remains
                    pure.
                  </p>
                </div>
              </div>

              {/* Monthly Fixed Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                  <label className="text-[11px] font-bold text-[#566273]">
                    Monthly Salaries
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-bold text-[#748092]">₹</span>
                    <input
                      type="text"
                      value={config.monthlySalary}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          monthlySalary: Number(e.target.value),
                        })
                      }
                      className="w-full text-xl font-bold text-[#17202d] outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-[#748092]">
                    Tailors, masterji, helpers
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                  <label className="text-[11px] font-bold text-[#566273]">
                    Factory Rent
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-bold text-[#748092]">₹</span>
                    <input
                      type="text"
                      value={config.monthlyRent}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          monthlyRent: Number(e.target.value),
                        })
                      }
                      className="w-full text-xl font-bold text-[#17202d] outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-[#748092]">
                    Industrial unit rent
                  </span>
                </div>

                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs">
                  <label className="text-[11px] font-bold text-[#566273]">
                    Electricity & Power
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-bold text-[#748092]">₹</span>
                    <input
                      type="text"
                      value={config.monthlyElectricity}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          monthlyElectricity: Number(e.target.value),
                        })
                      }
                      className="w-full text-xl font-bold text-[#17202d] outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-[#748092]">
                    Machines & iron boilers
                  </span>
                </div>

                <div className="bg-[#111c2d] text-white rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-[#9eabba]">
                    Total Monthly Burn
                  </span>
                  <div className="text-2xl font-black text-[#c58b4b] mt-1">
                    {formatINR(totalMonthlyOverheads)}
                  </div>
                  <button
                    onClick={handleSaveConfig}
                    className="text-left text-[11px] text-gray-300 hover:text-white underline font-semibold mt-2"
                  >
                    Save Fixed Overheads
                  </button>
                </div>
              </div>

              {/* Log Operational Expense */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#e7eaf0] pb-3">
                  <h3 className="font-bold text-sm text-[#17202d]">
                    Log Daily / Ad-Hoc Expense
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Category
                    </label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-semibold"
                    >
                      {(
                        config.customExpenseCategories || [
                          "Factory Salaries",
                          "Premises Rent",
                          "Electricity & Power",
                          "Admin & Office",
                          "Machinery & Repair",
                          "Logistics & Courier Bills",
                          "Marketing & Meta Ads",
                          "Other",
                        ]
                      ).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="text"
                      value={expenseForm.amount}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          amount: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Vendor / Person
                    </label>
                    <input
                      type="text"
                      value={expenseForm.vendor}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          vendor: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddExpense}
                      className="w-full py-2 bg-[#111c2d] hover:bg-[#1f2f47] text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      + Save Expense
                    </button>
                  </div>
                </div>

                {/* Create Custom Category */}
                <div className="pt-2 flex items-center gap-2 text-xs">
                  <span className="text-[#748092] font-semibold text-[11px]">
                    + Add New Category:
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Fabric Dyeing Bills"
                    value={newCustomCategoryInput}
                    onChange={(e) => setNewCustomCategoryInput(e.target.value)}
                    className="px-2.5 py-1 border border-[#dfe4eb] rounded-lg text-xs outline-none"
                  />
                  <button
                    onClick={handleAddCustomCategory}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-[#17202d] font-bold rounded-lg text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Expense History Table */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-4 sm:p-5 shadow-2xs min-w-0 w-full">
                <h3 className="font-bold text-sm text-[#17202d] mb-3">
                  Recorded Expenses Ledger
                </h3>
                <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full text-left text-xs min-w-160">
                    <thead>
                      <tr className="border-b border-[#e7eaf0] text-[#748092] text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Vendor</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {expenses.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50/80">
                          <td className="py-3 px-3 text-[#748092]">{e.date}</td>
                          <td className="py-3 px-3 font-semibold text-[#111c2d]">
                            {e.category}
                          </td>
                          <td className="py-3 px-3 text-[#566273]">
                            {e.vendor}
                          </td>
                          <td className="py-3 px-3 text-[#748092]">
                            {e.description}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-[#17202d]">
                            {formatINR(e.amount)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteExpense(e.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 11: SKU CATALOG                                    */}
          {/* ======================================================== */}
          {activeTab === "skus" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    Garment Catalog
                  </span>

                  <p className="text-xs text-[#748092] mt-0.5">
                    All costed garment patterns with making cost and margin
                    health.
                  </p>
                </div>
                <button
                  onClick={handleNewCostingForm}
                  className="px-4 py-2 bg-[#c58b4b] text-[#111c2d] text-xs font-bold rounded-lg hover:bg-[#b57a39]"
                >
                  + Add New Style
                </button>
              </div>

              {/* SKU Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => {
                  const isSafe =
                    p.cogsPct <= (config.defaultTargetCogsPct || 20);
                  return (
                    <div
                      key={p.sku}
                      className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs space-y-4 hover:border-[#c58b4b]/50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#c58b4b]">
                            {p.category}
                          </span>
                          <h4 className="font-bold text-sm text-[#17202d] mt-0.5">
                            {p.sku}
                          </h4>
                          <p className="text-xs text-[#748092]">{p.name}</p>
                          {p.isRevivedVersion && p.revivedFromSku && (
                            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-50 text-amber-850 border border-amber-250">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                              <span>
                                Remade from Dead SKU: {p.revivedFromSku} (
                                {p.revivedFromQty || 50} pcs)
                              </span>
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSafe
                              ? "bg-[#edf7f2] text-[#16835d]"
                              : "bg-[#fff0f0] text-[#c44e4e]"
                          }`}
                        >
                          Cost: {formatPct(p.cogsPct)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl text-xs">
                        <div>
                          <span className="text-[10px] text-[#748092] block">
                            Making Cost
                          </span>
                          <span className="font-extrabold text-[#17202d]">
                            {formatINR(p.totalCogs)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#748092] block">
                            MRP Tag
                          </span>
                          <span className="font-extrabold text-[#17202d]">
                            {formatINR(p.mrp)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#748092] block">
                            Pocket Cash (CM3)
                          </span>
                          <span
                            className={`font-black ${p.cm3 >= 0 ? "text-[#16835d]" : "text-[#c44e4e]"}`}
                          >
                            {formatINR(p.cm3)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#748092] block">
                            Multiplier
                          </span>
                          <span className="font-bold text-[#17202d]">
                            {p.pricingMultiplier}×
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#e7eaf0]">
                        <span className="text-[10px] text-[#748092]">
                          Fab: {p.fabricQty}m @ {formatINR(p.fabricRate)}/m
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              handleSelectProduct(p.sku);
                              setActiveTab("costing");
                            }}
                            title="Edit SKU"
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.sku)}
                            className="text-gray-400 hover:text-red-500"
                            title="Delete SKU"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 12: SETTINGS (ADMIN ONLY)                          */}
          {/* ======================================================== */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c58b4b]">
                    Admin Only · P0 Security
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17202d]">
                    Master Cost Assumptions & Rules
                  </h2>
                  <p className="text-xs text-[#748092] mt-0.5">
                    Changes here apply PROSPECTIVELY to future calculations.
                    Saved historical batch costs are never overwritten.
                  </p>
                </div>
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-[#111c2d] hover:bg-[#1f2f47] text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Save Master Configuration
                </button>
              </div>

              {/* Business Identity */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs space-y-3">
                <h3 className="font-bold text-sm text-[#17202d]">
                  Brand & Business Identity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Business Brand Name
                    </label>
                    <input
                      type="text"
                      value={config.businessName || "Atiq Studio"}
                      onChange={(e) =>
                        setConfig({ ...config, businessName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566273] mb-1">
                      Owner / Decision Maker Name
                    </label>
                    <input
                      type="text"
                      value={config.ownerName || "Atiq"}
                      onChange={(e) =>
                        setConfig({ ...config, ownerName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#dfe4eb] rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Normalized Side-by-Side Cards: Equal Heights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Default Rates (6 Balanced Inputs) */}
                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#17202d] border-b border-[#e7eaf0] pb-2">
                      Default Factory Rates (Pre-filled in New Costing)
                    </h3>

                    <div className="space-y-3 mt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#17202d]">
                            Default Fabric Rate
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            ₹ per metre benchmark
                          </p>
                        </div>
                        <input
                          type="text"
                          value={config.defaultFabricRate}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultFabricRate: Number(e.target.value),
                            })
                          }
                          className="w-24 px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#17202d]">
                            Default Cutting Rate
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            ₹ per piece
                          </p>
                        </div>
                        <input
                          type="text"
                          value={config.defaultCutting}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultCutting: Number(e.target.value),
                            })
                          }
                          className="w-24 px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#17202d]">
                            Default Stitching Rate
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            ₹ per piece
                          </p>
                        </div>
                        <input
                          type="text"
                          value={config.defaultStitching}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultStitching: Number(e.target.value),
                            })
                          }
                          className="w-24 px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#17202d]">
                            Default Finishing & QC
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            ₹ per piece
                          </p>
                        </div>
                        <input
                          type="text"
                          value={config.defaultFinishing}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultFinishing: Number(e.target.value),
                            })
                          }
                          className="w-24 px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#17202d]">
                            Default Forward Courier
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            ₹ per shipment
                          </p>
                        </div>
                        <input
                          type="text"
                          value={config.defaultLogisticsCost}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultLogisticsCost: Number(e.target.value),
                            })
                          }
                          className="w-24 px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#17202d]">
                            Default Reverse Courier
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            ₹ per return
                          </p>
                        </div>
                        <input
                          type="text"
                          value={config.defaultReverseLogisticsCost}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultReverseLogisticsCost: Number(
                                e.target.value,
                              ),
                            })
                          }
                          className="w-24 px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#f0f2f5] text-[10px] text-[#748092]">
                    Pre-populated into newly created cost sheets
                  </div>
                </div>

                {/* Commercial Benchmarks (6 Balanced Inputs) */}
                <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#17202d] border-b border-[#e7eaf0] pb-2">
                      Commercial Multipliers & Benchmarks
                    </h3>

                    <div className="space-y-3 mt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#17202d]">
                            Pricing Multiplier
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            Making Cost × Multiplier = Suggested MRP
                          </p>
                        </div>
                        <input
                          type="text"
                          step="0.1"
                          value={config.defaultPricingMultiplier}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultPricingMultiplier: Number(e.target.value),
                            })
                          }
                          className="w-24 px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#17202d]">
                            Making Cost Target Limit
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            Maximum allowable % of MRP
                          </p>
                        </div>
                        <input
                          type="text"
                          value={config.defaultTargetCogsPct}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultTargetCogsPct: Number(e.target.value),
                            })
                          }
                          className="w-24 px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#17202d]">
                            Marketplace Platform Fee
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            Default referral cut %
                          </p>
                        </div>
                        <input
                          type="text"
                          step="0.5"
                          value={config.defaultMarketplaceCommission}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultMarketplaceCommission: Number(
                                e.target.value,
                              ),
                            })
                          }
                          className="w-24 px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#17202d]">
                            Carrying Cost Rate (% / year)
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            Inventory financing & space bleed
                          </p>
                        </div>
                        <input
                          type="text"
                          value={config.defaultCarryingCostPct || 18}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultCarryingCostPct: Number(e.target.value),
                            })
                          }
                          className="w-24 px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#17202d]">
                            Default GST Slab Rate
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            Standard garment GST
                          </p>
                        </div>
                        <input
                          type="text"
                          value={config.defaultGstPct || 5}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultGstPct: Number(e.target.value),
                            })
                          }
                          className="w-24 px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#17202d]">
                            Default Expected Return Rate
                          </span>
                          <p className="text-[10px] text-[#748092]">
                            Baseline provision % for returns
                          </p>
                        </div>
                        <input
                          type="text"
                          value={config.defaultExpectedReturnsPct || 10}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultExpectedReturnsPct: Number(e.target.value),
                            })
                          }
                          className="w-24 px-2.5 py-1.5 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#f0f2f5] text-[10px] text-[#748092]">
                    Threshold ceilings used in CM margin and cashflow analysis
                  </div>
                </div>
              </div>

              {/* Marketplace & Channel Commission Directory */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e7eaf0] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-[#c58b4b]" />
                      <h3 className="font-bold text-base sm:text-lg text-[#17202d]">
                        Marketplace & Channel Rate Directory
                      </h3>
                    </div>
                    <p className="text-xs text-[#748092] mt-0.5">
                      Configure referral commissions, closing fees, courier
                      costs, and expected return rates for each selling
                      platform. These directly power the Costing Studio
                      Multi-Channel Simulator.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddChannelModalOpen(true)}
                      className="px-3.5 py-2 bg-[#111c2d] hover:bg-[#1e2f47] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#c58b4b]" />
                      <span>Add Marketplace Channel</span>
                    </button>
                  </div>
                </div>

                {/* Directory Table */}
                <div className="overflow-x-auto no-scrollbar -mx-5 sm:mx-0 px-5 sm:px-0">
                  <table className="w-full text-left text-xs min-w-175">
                    <thead>
                      <tr className="border-b border-[#e7eaf0] text-[#748092] uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Platform Channel</th>
                        <th className="py-2.5 px-3 text-right">
                          Referral Cut (%)
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          Closing Fee (₹)
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          Forward Shipping (₹)
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          Reverse Courier (₹)
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          Expected Returns (%)
                        </th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f2f5]">
                      {marketplaces.map((ch) => (
                        <tr
                          key={ch.id}
                          className="hover:bg-[#fbfcfd] transition"
                        >
                          <td className="py-3 px-3">
                            <span className="font-bold text-sm text-[#17202d]">
                              {ch.name}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <input
                              type="text"
                              step="0.5"
                              value={ch.commissionPct}
                              onChange={(e) =>
                                handleUpdateChannel(ch.id, {
                                  commissionPct: Number(e.target.value),
                                })
                              }
                              className="w-20 px-2 py-1 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right outline-none focus:border-[#c58b4b]"
                            />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <input
                              type="text"
                              value={ch.fixedFee}
                              onChange={(e) =>
                                handleUpdateChannel(ch.id, {
                                  fixedFee: Number(e.target.value),
                                })
                              }
                              className="w-20 px-2 py-1 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right outline-none focus:border-[#c58b4b]"
                            />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <input
                              type="text"
                              value={ch.shippingFee}
                              onChange={(e) =>
                                handleUpdateChannel(ch.id, {
                                  shippingFee: Number(e.target.value),
                                })
                              }
                              className="w-20 px-2 py-1 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right outline-none focus:border-[#c58b4b]"
                            />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <input
                              type="text"
                              value={ch.reverseShippingFee}
                              onChange={(e) =>
                                handleUpdateChannel(ch.id, {
                                  reverseShippingFee: Number(e.target.value),
                                })
                              }
                              className="w-20 px-2 py-1 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right outline-none focus:border-[#c58b4b]"
                            />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <input
                              type="text"
                              value={ch.expectedReturnsPct}
                              onChange={(e) =>
                                handleUpdateChannel(ch.id, {
                                  expectedReturnsPct: Number(e.target.value),
                                })
                              }
                              className="w-20 px-2 py-1 border border-[#dfe4eb] rounded-lg text-xs font-bold text-right outline-none focus:border-[#c58b4b]"
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleChannelStatus(ch.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition active:scale-95 ${
                                ch.status === "Active"
                                  ? "bg-[#eaf8f1] text-[#16835d] hover:bg-[#d8f2e4]"
                                  : "bg-[#f5f6f8] text-[#748092] hover:bg-[#e7eaf0]"
                              }`}
                            >
                              {ch.status === "Active" ? "Active" : "Paused"}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteChannel(ch.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition"
                              title="Delete Channel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#e7eaf0]">
                  <p className="text-[11px] text-[#748092]">
                    💡 Click <strong>Save Master Configuration</strong> at the
                    top to commit these platform rate cards to database storage.
                  </p>
                  <button
                    onClick={handleSaveConfig}
                    className="px-4 py-2 bg-[#111c2d] hover:bg-[#1e2f47] text-white text-xs font-bold rounded-xl shadow-xs self-end sm:self-auto"
                  >
                    Save Rate Cards
                  </button>
                </div>
              </div>

              {/* Garment Categories & Master Taxonomies Manager (Config-Controlled) */}
              <div className="bg-white border border-[#e7eaf0] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e7eaf0] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-[#c58b4b]" />
                      <h3 className="font-bold text-base sm:text-lg text-[#17202d]">
                        Garment Categories & Master Taxonomies
                      </h3>
                    </div>
                    <p className="text-xs text-[#748092] mt-0.5">
                      Config-controlled product categories used across Costing
                      Studio, Batch Production, Inventory, and Sales. Changes
                      apply company-wide in real-time.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetGarmentCategories}
                    className="text-xs font-semibold text-[#566273] hover:text-[#17202d] underline self-start sm:self-auto"
                  >
                    Reset 
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left Column: Active Garment Categories & Add New */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#566273] uppercase tracking-wider mb-2">
                        Active Garment Categories (
                        {garmentCategoriesList.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {garmentCategoriesList.map((cat) => (
                          <div
                            key={cat}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f6fa] border border-[#dfe4eb] rounded-xl text-xs font-bold text-[#17202d]"
                          >
                            <span>{cat}</span>
                            {garmentCategoriesList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteGarmentCategory(cat)}
                                className="text-gray-400 hover:text-red-600 transition ml-1"
                                title={`Remove "${cat}"`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Inline Add Category Form */}
                    <form
                      onSubmit={handleAddGarmentCategory}
                      className="flex items-center gap-2 pt-2"
                    >
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        placeholder="Add new category (e.g. Ethnic Sets / Kurtis)"
                        className="flex-1 px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium outline-none focus:border-[#c58b4b] bg-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#111c2d] hover:bg-[#1e2f47] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 whitespace-nowrap"
                      >
                        + Add Category
                      </button>
                    </form>
                    <p className="text-[10px] text-[#748092]">
                      💡 Added categories will instantly appear in Costing
                      Studio and link to automated trims recommendations.
                    </p>
                  </div>

                  {/* Right Column: Boss Rohit Rawat Spec Reference */}
                  <div className="bg-[#fcfdfd] border border-[#e7eaf0] rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-[#c58b4b]" />
                      <h4 className="text-xs font-bold text-[#17202d] uppercase tracking-wider">
                        Trims & Accessories Standard Specification
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#566273] leading-relaxed">
                      Per manufacturing guidelines, Trims are divided into 5
                      standard components with automated dropdown selection in
                      Costing Studio:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                      <div className="bg-white p-2.5 rounded-lg border border-[#e7eaf0]">
                        <span className="font-bold text-[#17202d] block">
                          1. Buttons & Zippers
                        </span>
                        <span className="text-[#748092] text-[10px]">
                          • <strong>CFC Zippers:</strong> Continuous coil for
                          pants & jackets
                          <br />• <strong>Concealed Zippers:</strong> Invisible
                          finish for dresses & skirts
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-[#e7eaf0]">
                        <span className="font-bold text-[#17202d] block">
                          2. Fusing & Lining
                        </span>
                        <span className="text-[#748092] text-[10px]">
                          Collar/cuff bukram & astra inner lining fabric
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-[#e7eaf0]">
                        <span className="font-bold text-[#17202d] block">
                          3. Shoulder Pad
                        </span>
                        <span className="text-[#748092] text-[10px]">
                          Poly & molded pads for blazers & structured tops
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-[#e7eaf0]">
                        <span className="font-bold text-[#17202d] block">
                          4. Eye Hook & Clasps
                        </span>
                        <span className="text-[#748092] text-[10px]">
                          Pant hooks & bar, dress eyelets, kaj-hook closures
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#f0f4f9] px-3 py-2 rounded-lg text-[10px] text-[#4b5563] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#2b6cb0] shrink-0" />
                      <span>
                        In Costing Studio, select the{" "}
                        <strong>Trims Type (Dropdown)</strong> to auto-fill
                        these benchmark rates for each garment style.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Marketplace Channel Modal */}
      {isAddChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#dfe4eb] space-y-4">
            <div className="flex items-center justify-between border-b border-[#e7eaf0] pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#c58b4b]" />
                <h3 className="font-bold text-sm text-[#17202d]">
                  Add Marketplace Channel
                </h3>
              </div>
              <button
                onClick={() => setIsAddChannelModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets Chips */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#748092]">
                1-Click Preset Templates
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    name: "Nykaa Fashion",
                    comm: 25,
                    fee: 15,
                    ship: 75,
                    rev: 85,
                    ret: 20,
                  },
                  {
                    name: "Tata CLiQ",
                    comm: 22,
                    fee: 20,
                    ship: 70,
                    rev: 80,
                    ret: 24,
                  },
                  {
                    name: "FirstCry",
                    comm: 20,
                    fee: 15,
                    ship: 65,
                    rev: 75,
                    ret: 18,
                  },
                  {
                    name: "Custom B2B / Wholesale",
                    comm: 0,
                    fee: 0,
                    ship: 50,
                    rev: 0,
                    ret: 2,
                  },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      setNewChannelForm({
                        id: preset.name
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "-"),
                        name: preset.name,
                        commissionPct: preset.comm,
                        fixedFee: preset.fee,
                        shippingFee: preset.ship,
                        reverseShippingFee: preset.rev,
                        expectedReturnsPct: preset.ret,
                        gstOnCommissionPct: 18,
                        status: "Active",
                      })
                    }
                    className="px-2.5 py-1 bg-[#f5f6f8] hover:bg-[#e7eaf0] border border-[#dfe4eb] text-[#17202d] rounded-lg text-xs font-bold transition"
                  >
                    {preset.name} ({preset.comm}%)
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#566273] mb-1">
                  Marketplace Channel Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nykaa, Tata CLiQ, FirstCry, Meesho"
                  value={newChannelForm.name}
                  onChange={(e) =>
                    setNewChannelForm({
                      ...newChannelForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-[#dfe4eb] rounded-xl font-bold outline-none focus:border-[#c58b4b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#566273] mb-1">
                    Referral Cut (%)
                  </label>
                  <input
                    type="text"
                    step="0.5"
                    value={newChannelForm.commissionPct}
                    onChange={(e) =>
                      setNewChannelForm({
                        ...newChannelForm,
                        commissionPct: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#dfe4eb] rounded-xl font-bold outline-none focus:border-[#c58b4b]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#566273] mb-1">
                    Closing Fee (₹)
                  </label>
                  <input
                    type="text"
                    value={newChannelForm.fixedFee}
                    onChange={(e) =>
                      setNewChannelForm({
                        ...newChannelForm,
                        fixedFee: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#dfe4eb] rounded-xl font-bold outline-none focus:border-[#c58b4b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#566273] mb-1">
                    Forward Ship (₹)
                  </label>
                  <input
                    type="text"
                    value={newChannelForm.shippingFee}
                    onChange={(e) =>
                      setNewChannelForm({
                        ...newChannelForm,
                        shippingFee: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-[#dfe4eb] rounded-xl font-bold outline-none focus:border-[#c58b4b]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#566273] mb-1">
                    Reverse Courier (₹)
                  </label>
                  <input
                    type="text"
                    value={newChannelForm.reverseShippingFee}
                    onChange={(e) =>
                      setNewChannelForm({
                        ...newChannelForm,
                        reverseShippingFee: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-[#dfe4eb] rounded-xl font-bold outline-none focus:border-[#c58b4b]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#566273] mb-1">
                    Return Rate (%)
                  </label>
                  <input
                    type="text"
                    value={newChannelForm.expectedReturnsPct}
                    onChange={(e) =>
                      setNewChannelForm({
                        ...newChannelForm,
                        expectedReturnsPct: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-[#dfe4eb] rounded-xl font-bold outline-none focus:border-[#c58b4b]"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e7eaf0]">
              <button
                type="button"
                onClick={() => setIsAddChannelModalOpen(false)}
                className="px-4 py-2 border border-[#dfe4eb] hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddChannel}
                className="px-4 py-2 bg-[#111c2d] hover:bg-[#1e2f47] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Add Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dead Stock & Inventory Ageing Policy Modal */}
      {showDeadStockInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-[#dfe4eb] space-y-4">
            <div className="flex items-start justify-between border-b border-[#e7eaf0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#17202d]">
                    Inventory Ageing & Dead Stock Classification Rules
                  </h3>
                  <p className="text-[11px] text-[#748092]">
                    Thresholds governing warehouse stock classification,
                    carrying cost bleed, and liquidation triggers.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeadStockInfoModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-[#17202d] hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Tier 1: Active */}
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">
                      Active Catalog Stock
                    </span>
                    <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                      &lt; {config.ageThresholdActive || 30} Days
                    </span>
                  </div>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Fresh production batch in prime retail velocity. Sold at
                    regular MRP or nominal marketing discount (10-15%). Zero
                    inventory risk.
                  </p>
                </div>
              </div>

              {/* Tier 2: Ageing */}
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">
                      Ageing Stock (Warning Zone)
                    </span>
                    <span className="font-bold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                      {config.ageThresholdActive || 30} –{" "}
                      {config.ageThresholdAgeing || 60} Days
                    </span>
                  </div>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    Sales velocity slowing down. Risk of size breakage and
                    algorithmic rank loss on marketplaces. Recommended action:
                    boost Meta/Instagram retargeting or increase marketplace
                    promotion discount.
                  </p>
                </div>
              </div>

              {/* Tier 3: Liquidation */}
              <div className="p-3 rounded-xl border border-orange-200 bg-orange-50/60 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 shrink-0" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-orange-950">
                      Liquidation Stage (Capital Stuck)
                    </span>
                    <span className="font-bold text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200 text-[10px]">
                      {config.ageThresholdAgeing || 60} –{" "}
                      {config.ageThresholdLiquidation || 90} Days
                    </span>
                  </div>
                  <p className="text-orange-800 text-[11px] mt-0.5">
                    Batch is actively locking factory working capital. Atiq CRM
                    activates the Recovery Calculator to mark down selling price
                    to recover original manufacturing COGS before full
                    write-off.
                  </p>
                </div>
              </div>

              {/* Tier 4: Dead Stock */}
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/70 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-1 shrink-0" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-950">
                      Dead Stock (Severe Loss Risk)
                    </span>
                    <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200 text-[10px]">
                      &gt; {config.ageThresholdLiquidation || 90} Days
                    </span>
                  </div>
                  <p className="text-rose-800 text-[11px] mt-0.5">
                    Stagnant inventory bleeding ~
                    {config.defaultCarryingCostPct || 18}% annual holding cost
                    (warehouse rent, dust damage, handling). Immediate flash
                    clearance sale, bulk offline lot disposal, or fabric salvage
                    required.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e7eaf0] flex items-center justify-between text-xs text-[#748092]">
              <span>
                Configure thresholds in{" "}
                <strong>Settings &gt; Ageing Rules</strong>.
              </span>
              <button
                type="button"
                onClick={() => setShowDeadStockInfoModal(false)}
                className="px-4 py-1.5 bg-[#111c2d] text-white text-xs font-bold rounded-xl hover:bg-[#1f2d44]"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dead SKU Revival & Re-creation Wizard Modal */}
      {showRevivalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-[#dfe4eb] space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#e7eaf0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#17202d]">
                    Recreate Dead SKU into Fresh Version
                  </h3>
                  <p className="text-xs text-[#748092]">
                    Remake{" "}
                    <strong className="text-[#17202d]">
                      {revivalForm.piecesAvailable} stuck pieces
                    </strong>{" "}
                    from original SKU{" "}
                    <span className="font-mono font-bold text-[#c58b4b]">
                      {revivalForm.originSku}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRevivalModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-[#17202d] hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Permanent Origin Tag Preview */}
            <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Mandatory Origin Tag for New SKU</span>
              </span>
              <p className="text-xs font-bold text-[#17202d]">
                ⚡ Revived from Dead SKU: {revivalForm.originSku} (
                {revivalForm.piecesAvailable} pcs remanufactured)
              </p>
              <p className="text-[11px] text-[#566273]">
                This tag will be permanently attached to this new SKU version
                and will show in the Style Catalog, Costing Studio, and Batch
                Register.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#566273] mb-1">
                    New SKU ID *
                  </label>
                  <input
                    type="text"
                    value={revivalForm.newSku}
                    onChange={(e) =>
                      setRevivalForm({
                        ...revivalForm,
                        newSku: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. ATQ-WW-007-REV"
                    className="w-full px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-bold text-[#17202d] uppercase outline-none focus:border-[#c58b4b]"
                  />
                  <span className="text-[10px] text-[#748092] mt-0.5 block">
                    Suffix like -REV or -V2 recommended
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#566273] mb-1">
                    Pieces to Recreate / Remake *
                  </label>
                  <input
                    type="number"
                    value={revivalForm.piecesAvailable}
                    onChange={(e) =>
                      setRevivalForm({
                        ...revivalForm,
                        piecesAvailable: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-bold text-[#17202d] outline-none focus:border-[#c58b4b]"
                  />
                  <span className="text-[10px] text-[#748092] mt-0.5 block">
                    e.g. 50 stuck units to be converted
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#566273] mb-1">
                  New Product Style Name *
                </label>
                <input
                  type="text"
                  value={revivalForm.newName}
                  onChange={(e) =>
                    setRevivalForm({
                      ...revivalForm,
                      newName: e.target.value,
                    })
                  }
                  placeholder="e.g. Pure Linen Casual Shirt (Revived V2 - Remade)"
                  className="w-full px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium text-[#17202d] outline-none focus:border-[#c58b4b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#566273] mb-1">
                    Additional Rework Cost (₹/pc)
                  </label>
                  <input
                    type="number"
                    value={revivalForm.reworkAdditionalCost}
                    onChange={(e) =>
                      setRevivalForm({
                        ...revivalForm,
                        reworkAdditionalCost: Number(e.target.value),
                      })
                    }
                    placeholder="35"
                    className="w-full px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-bold text-[#17202d] outline-none focus:border-[#c58b4b]"
                  />
                  <span className="text-[10px] text-[#748092] mt-0.5 block">
                    Tailoring rework, new trims, or alteration
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#566273] mb-1">
                    New Target MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={revivalForm.newMrp}
                    onChange={(e) =>
                      setRevivalForm({
                        ...revivalForm,
                        newMrp: Number(e.target.value),
                      })
                    }
                    placeholder="1499"
                    className="w-full px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-bold text-[#17202d] outline-none focus:border-[#c58b4b]"
                  />
                  <span className="text-[10px] text-[#748092] mt-0.5 block">
                    Selling tag price for the new version
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#566273] mb-1">
                  Rework Specifications &amp; Factory Notes
                </label>
                <textarea
                  rows={2}
                  value={revivalForm.revivalNotes}
                  onChange={(e) =>
                    setRevivalForm({
                      ...revivalForm,
                      revivalNotes: e.target.value,
                    })
                  }
                  placeholder="e.g. Altered 50 pieces by adding new lace on collar and shortening hemline into cropped top."
                  className="w-full px-3 py-2 border border-[#dfe4eb] rounded-xl text-xs font-medium text-[#17202d] outline-none focus:border-[#c58b4b]"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-[#e7eaf0]">
              <button
                type="button"
                onClick={() => setShowRevivalModal(false)}
                className="w-full sm:w-auto px-4 py-2 border border-[#dfe4eb] rounded-xl text-xs font-semibold text-[#566273] hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReviveInCostingStudio}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-white border border-[#c58b4b] text-[#c58b4b] hover:bg-amber-50 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap"
                  title="Load into Costing Studio to review all BOM line items"
                >
                  Edit in Costing Studio
                </button>
                <button
                  type="button"
                  onClick={handleInstantSaveRevivedSku}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  ✨ Save &amp; Launch Revived SKU
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
