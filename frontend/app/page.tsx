import Link from "next/link";

export default function Home() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1>Dashboard</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/digital" style={{ padding: 8, border: "1px solid #ddd", borderRadius: 8 }}>Produk Digital</Link>
        <Link href="/fisik" style={{ padding: 8, border: "1px solid #ddd", borderRadius: 8 }}>Produk Fisik</Link>
      </div>
    </div>
  );
}
