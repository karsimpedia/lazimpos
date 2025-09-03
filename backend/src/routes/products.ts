import { Router } from "express";
import { fetchSupplierProducts } from "../services/products.supplier.js";

const router = Router();

router.get("/produk", async (req: any, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  const type = String(req.query.type || "").toUpperCase();
  const status = String(req.query.status || "").toUpperCase();
  const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit || "100"), 10), 1), 500);
  const skip = (page - 1) * limit;
  const force = req.query.refresh === "true";

  let list = await fetchSupplierProducts(!!force).catch(() => []);

  let filtered = list.filter(p => {
    if (type && p.type !== type) return false;
    if (status && (p.status || "ACTIVE") !== status) return false;
    if (q) {
      const hay = (p.name + " " + p.code + " " + (p.category || "")).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (!req.query.status && (p.status || "ACTIVE") !== "ACTIVE") return false;
    return true;
  });

  const total = filtered.length;
  const slice = filtered.slice(skip, skip + limit).map(p => ({
    id: `SUPP:${p.code}`,
    code: p.code,
    name: p.name,
    nominal: p.nominal ?? null,
    basePrice: p.price ?? null,
    sellPrice: p.price ?? null, // harga otoritatif dari server pulsa
    type: p.type,
    category: p.category || null,
    status: p.status || "ACTIVE",
  }));

  res.json({ page, limit, total, data: slice });
});

export default router;
