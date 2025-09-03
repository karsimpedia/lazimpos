import axios from "axios";
import { redis } from "../config/redis.js";
import { digest, render } from "../utils/crypto.js";

const BASE = process.env.PULSA_BASE_URL!;
const PATH = process.env.PULSA_PRODUCTS_PATH || "/produk";
const TTL  = parseInt(process.env.PRODUCTS_CACHE_TTL || "60", 10);

type SupplierProduct = {
  code: string;
  name: string;
  nominal?: number;
  price?: number;
  type?: string;
  category?: string;
  status?: string;
};

export async function fetchSupplierProducts(force = false): Promise<SupplierProduct[]> {
  const cacheKey = "supplier:products:v1";
  if (!force) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const ts = String(Math.floor(Date.now()/1000));
  const ctx = {
    memberId: process.env.PULSA_MEMBER_ID || "",
    secret: process.env.PULSA_SECRET || "",
    ts
  };
  const tpl = process.env.PULSA_SIGN_TEMPLATE || "{{memberId}}|{{ts}}|{{secret}}";
  const sign = digest(process.env.PULSA_SIGN_ALGO || "sha256|hex", render(tpl, ctx));

  const { data, status } = await axios.get(`${BASE}${PATH}`, {
    params: { memberID: ctx.memberId, ts, sign },
    timeout: 15000, validateStatus: () => true
  });
  if (status >= 500) throw new Error("SUPPLIER_DOWN");
  if (!Array.isArray(data?.products)) throw new Error("INVALID_SUPPLIER_RESPONSE");

  const list: SupplierProduct[] = data.products.map((p: any) => ({
    code: String(p.code ?? p.kode ?? ""),
    name: String(p.name ?? p.nama ?? ""),
    nominal: p.nominal != null ? Number(p.nominal) : undefined,
    price:   p.price   != null ? Number(p.price)   : undefined,
    type: String(p.type ?? p.jenis ?? p.kategori ?? "PULSA").toUpperCase(),
    category: p.category ?? p.kelompok ?? null,
    status: String(p.status ?? "ACTIVE").toUpperCase()
  }));

  await redis.set(cacheKey, JSON.stringify(list), "EX", TTL);
  return list;
}
