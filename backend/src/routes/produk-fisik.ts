import { Router } from "express";
import { prisma } from "../prismaClient.js";

const r = Router();

r.get("/produk-fisik", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit || "50"), 10), 1), 200);
  const skip = (page - 1) * limit;

  const where:any = { type: "FISIK", isActive: true };
  if (q) where.OR = [
    { name: { contains: q, mode: "insensitive" } },
    { code: { contains: q, mode: "insensitive" } },
    { barcode: { contains: q, mode: "insensitive" } },
  ];

  const [total, data] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where, skip, take: limit,
      orderBy: { updatedAt: "desc" },
      include: { category: true, taxRate: true }
    })
  ]);

  res.json({ page, limit, total, data });
});

r.post("/produk-fisik", async (req, res) => {
  const { code, name, categoryId, barcode, unit, costPrice, sellPrice, taxRateId, trackStock } = req.body || {};
  if (!code || !name || !categoryId) return res.status(400).json({ error: "code, name, categoryId wajib" });

  const p = await prisma.product.create({
    data: {
      code, name, categoryId,
      barcode: barcode || null,
      type: "FISIK",
      unit: unit || "PCS",
      costPrice: BigInt(costPrice || 0),
      sellPrice: BigInt(sellPrice || 0),
      margin: BigInt((sellPrice || 0) - (costPrice || 0)),
      taxRateId: taxRateId || null,
      trackStock: trackStock ?? true,
      isActive: true
    }
  });
  res.status(201).json(p);
});

r.put("/produk-fisik/:id", async (req, res) => {
  const id = String(req.params.id);
  const { name, categoryId, barcode, unit, costPrice, sellPrice, taxRateId, trackStock, isActive } = req.body || {};
  const p = await prisma.product.update({
    where: { id },
    data: {
      name, categoryId,
      barcode: barcode ?? undefined,
      unit: unit ?? undefined,
      costPrice: costPrice != null ? BigInt(costPrice) : undefined,
      sellPrice: sellPrice != null ? BigInt(sellPrice) : undefined,
      margin: sellPrice != null && costPrice != null ? BigInt(sellPrice - costPrice) : undefined,
      taxRateId: taxRateId ?? undefined,
      trackStock: trackStock ?? undefined,
      isActive: isActive ?? undefined
    }
  });
  res.json(p);
});

export default r;
