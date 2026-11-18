# Atiq Garment Costing & Profitability Management CRM

A clean, non-technical, user-friendly Garment Costing, Inventory Exposure, and Contribution Margin CRM built specifically for fashion manufacturers and marketplace sellers (Myntra, Amazon, Flipkart, Shopify).

---

## 🌟 What This System Solves

1. **Prevents Loss-Making Batches**: Know sample costs and full 100/200-piece batch economics before fabric is cut.
2. **True Profitability (CM1 → CM2 → CM3)**:
   - **CM1**: Net Realisation ex-GST after discounts & expected returns.
   - **CM2**: Gross Contribution after marketplace commission (e.g. 22.5%) and manufacturing COGS.
   - **CM3**: Real In-Pocket Cash after courier logistics (forward + reverse friction) and Meta ad CAC.
3. **20% COGS Ceiling Benchmark**: Immediate visual traffic light (Green if COGS ≤ 20% MRP, Red if above target).
4. **Unsold & Stuck Stock Watch**: Eliminates ₹1 Lakh+ warehouse inventory pile-ups by tracking Active, Ageing (30d), Liquidation (60d), and Dead Stock (90d+) with blocked capital calculation.
5. **Fixed Overheads Kept Separate**: Tailor salaries, factory rent, and electricity are tracked at company level without contaminating per-piece garment contribution margins.

---

## 🚀 How to Run Locally

```bash
cd work
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Tech Stack
- **Next.js 16** (App Router & Server Actions)
- **TypeScript** & **Tailwind CSS**
- **MongoDB Atlas** with resilient local in-memory fallback
- **Lucide Icons**
