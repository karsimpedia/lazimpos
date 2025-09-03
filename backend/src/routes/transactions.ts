import { Router } from "express";
import axios from "axios";
import crypto from "crypto";
import { prisma } from "../prismaClient.js";
import { render, digest } from "../utils/crypto.js";

const router = Router();
const BASE = process.env.PULSA_BASE_URL!;
const PATH = process.env.PULSA_TRX_PATH || "/transaksi";

router.post("/transactions", async (req, res) => {
  const { productCode, target } = req.body || {};
  if (!productCode || !target) return res.status(400).json({ error: "productCode & target wajib" });

  const invoiceId = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  await prisma.digitalTransaction.create({
    data: {
      invoiceId,
      productCode,
      productName: productCode,
      target,
      sellPrice: 0n,
      status: "PENDING"
    }
  });

  const ctx = {
    memberId: process.env.PULSA_MEMBER_ID || "",
    product: productCode,
    dest: String(target),
    refID: invoiceId,
    pin: process.env.PULSA_PIN || "",
    password: process.env.PULSA_PASSWORD || ""
  };
  const sign = digest(process.env.PULSA_TRX_SIGN_ALGO || "sha1|base64url", render(process.env.PULSA_TRX_SIGN_TPL || "OtomaX|{{memberId}}|{{product}}|{{dest}}|{{refID}}|{{pin}}|{{password}}", ctx));

  const upstream = await axios.get(`${BASE}${PATH}`, {
    params: { memberID: ctx.memberId, product: productCode, dest: target, refID: invoiceId, sign },
    timeout: 15000, validateStatus: () => true
  });

  const statusText = String(upstream.data?.status || "").toUpperCase();
  const buyPrice = upstream.data?.buy_price != null ? BigInt(upstream.data.buy_price) : null;
  const name = upstream.data?.name || upstream.data?.produk || productCode;
  const supplierRef = upstream.data?.refID || null;

  await prisma.digitalTransaction.update({
    where: { invoiceId },
    data: {
      productName: name,
      supplierRef,
      sellPrice: upstream.data?.sell_price != null ? BigInt(upstream.data.sell_price) :
                 upstream.data?.price != null ? BigInt(upstream.data.price) :
                 buyPrice ?? 0n,
      responseRaw: upstream.data
    }
  });

  if (["OK","SUKSES","SUCCESS","FAILED","GAGAL"].includes(statusText)) {
    const final = ["OK","SUKSES","SUCCESS"].includes(statusText) ? "SUCCESS" : "FAILED";
    await prisma.digitalTransaction.update({ where: { invoiceId }, data: { status: final as any } });
  }

  res.status(upstream.status).json({ invoiceId, upstream: upstream.data });
});

export default router;
