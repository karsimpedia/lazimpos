"use client";
import useSWR from "swr";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL!;
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Fisik() {
  const { data, isLoading, error, mutate } = useSWR(`${API}/produk-fisik?page=1&limit=50`, fetcher);
  const [form, setForm] = useState({ code: "", name: "", categoryId: "", costPrice: 0, sellPrice: 0 });

  const submit = async (e: any) => {
    e.preventDefault();
    const r = await fetch(`${API}/produk-fisik`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (r.ok) { setForm({ code: "", name: "", categoryId: "", costPrice: 0, sellPrice: 0 }); mutate(); }
    else alert("Gagal menambah produk");
  };

  return (
    <div>
      <h2>Produk Fisik (DB Lokal)</h2>

      <form onSubmit={submit} style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="Kode" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
          <input placeholder="Nama" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Category ID" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="number" placeholder="HPP" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: parseInt(e.target.value||"0") })} />
          <input type="number" placeholder="Harga jual" value={form.sellPrice} onChange={e => setForm({ ...form, sellPrice: parseInt(e.target.value||"0") })} />
        </div>
        <button type="submit">Tambah</button>
      </form>

      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error memuat</p>}
      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th align="left">Kode</th>
            <th align="left">Nama</th>
            <th align="right">HPP</th>
            <th align="right">Harga</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((p: any) => (
            <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
              <td>{p.code}</td>
              <td>{p.name}</td>
              <td align="right">{p.costPrice}</td>
              <td align="right">{p.sellPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 8, color: "#666" }}>Tip: isi `categoryId` pakai ID kategori dari DB (seed contoh tidak membuat kategori kedua).</p>
    </div>
  );
}
