import { Router } from "express";
import { prisma } from "../prismaClient.js";

const r = Router();

r.post("/purchases/receive/:id", async (req, res) => {
  const id = String(req.params.id);
  const purchase = await prisma.purchase.findUnique({ where: { id }, include: { items: true } });
  if (!purchase) return res.status(404).json({ error: "purchase not found" });
  if (purchase.status === "RECEIVED") return res.status(400).json({ error: "already received" });

  await prisma.$transaction(async (tx) => {
    for (const it of purchase.items) {
      await tx.stockLedger.create({
        data: { storeId: purchase.storeId, productId: it.productId, moveType: "IN", qty: it.qty, refType: "PURCHASE", refId: id }
      });
      await tx.stock.upsert({
        where: { storeId_productId: { storeId: purchase.storeId, productId: it.productId } },
        update: { qty: { increment: it.qty } },
        create: { storeId: purchase.storeId, productId: it.productId, qty: it.qty }
      });
      await tx.product.update({ where: { id: it.productId }, data: { costPrice: it.costPrice } });
    }
    await tx.purchase.update({ where: { id }, data: { status: "RECEIVED" } });
  });

  res.json({ ok: true });
});

export default r;
