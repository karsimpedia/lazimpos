import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../prismaClient.js";

const router = Router();
const SECRET = process.env.PULSA_CALLBACK_HMAC_SECRET || "";

function verify(body: any, sig: string) {
  const raw = JSON.stringify(body || {});
  const calc = crypto.createHmac("sha256", SECRET).update(raw).digest("hex");
  const a = Buffer.from(sig || "", "utf8");
  const b = Buffer.from(calc, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function mapStatus(s: string) {
  const v = (s || "").toUpperCase();
  if (["OK","SUKSES","SUCCESS"].includes(v)) return "SUCCESS";
  if (["PROSES","PENDING","PROCESS"].includes(v)) return "PENDING";
  return "FAILED";
}

router.post("/callback/pulsa", async (req, res) => {
  const sig = String(req.header("X-Signature") || "");
  if (!verify(req.body, sig)) return res.status(401).json({ error: "invalid signature" });

  const ref = String(req.body.ref || req.body.refID || req.body.invoiceId || "");
  const status = mapStatus(req.body.status);
  const sell = req.body.sell_price ?? req.body.price ?? null;

  await prisma.callbackLog.create({
    data: { source: "PULSA", ref, payload: req.body, validSig: true }
  });

  await prisma.digitalTransaction.update({
    where: { invoiceId: ref },
    data: {
      status: status as any,
      sellPrice: sell != null ? BigInt(sell) : undefined,
      responseRaw: req.body
    }
  });

  res.json({ ok: true });
});

export default router;
