import crypto from "crypto";

export function render(tpl: string, ctx: Record<string,string>) {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, k) => ctx[k] ?? "");
}

export function digest(algo: string, s: string) {
  const [hash, enc] = (algo || "sha256|hex").split("|");
  const d = crypto.createHash(hash as any).update(s).digest();
  if (enc === "base64") return d.toString("base64");
  if (enc === "base64url") return d.toString("base64url");
  return d.toString("hex");
}
