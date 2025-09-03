import { Router } from "express";
import { prisma } from "../prismaClient.js";

const r = Router();

r.post("/stock/adjust", async (req, res) => {
  const { storeId, productId, qty, note } = req.body || {};
  if (!storeId || !productId || !qty) return res.status(400).json({ error: "storeId, productId, qty wajib" });

  await prisma.$transaction(async (tx) => {
    await tx.stockLedger.create({
      data: { storeId, productId, moveType: "ADJUST", qty: Number(qty), refType: "ADJUST", note: note || null }
    });
    await tx.stock.upsert({
      where: { storeId_productId: { storeId, productId } },
      update: { qty: { increment: Number(qty) } },
      create: { storeId, productId, qty: Number(qty) }
    });
  });

  res.json({ ok: true });
});

export default r;
