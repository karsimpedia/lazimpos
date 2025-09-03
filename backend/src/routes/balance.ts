import { Router } from "express";
import axios from "axios";
import { digest, render } from "../utils/crypto.js";

const router = Router();
const BASE = process.env.PULSA_BASE_URL!;
const PATH = process.env.PULSA_BALANCE_PATH || "/saldo";

router.get("/saldo", async (_req, res) => {
  const ts = String(Math.floor(Date.now()/1000));
  const ctx = { memberId: process.env.PULSA_MEMBER_ID || "", ts, secret: process.env.PULSA_SECRET || "" };
  const sig = digest(process.env.PULSA_SIGN_ALGO || "sha256|hex", render(process.env.PULSA_SIGN_TEMPLATE || "{{memberId}}|{{ts}}|{{secret}}", ctx));

  const upstream = await axios.get(`${BASE}${PATH}`, {
    params: { memberID: ctx.memberId, ts, sign: sig },
    timeout: 10000, validateStatus: () => true
  });
  res.status(upstream.status).json(upstream.data);
});

export default router;
