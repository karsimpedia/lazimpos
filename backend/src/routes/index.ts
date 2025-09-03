import { Router } from "express";
import products from "./products.js";
import balance from "./balance.js";
import transactions from "./transactions.js";
import callback from "./callback.js";
import physical from "./produk-fisik.js";
import stockAdjust from "./stock-adjust.js";
import purchaseReceive from "./purchase-receive.js";

const r = Router();
r.use(products);
r.use(balance);
r.use(transactions);
r.use(physical);
r.use(stockAdjust);
r.use(purchaseReceive);

export default r;
