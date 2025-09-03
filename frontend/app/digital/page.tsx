"use client";
import useSWR from "swr";

const API = process.env.NEXT_PUBLIC_API_BASE_URL!;
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DigitalProducts() {
  const { data, isLoading, error, mutate } = useSWR(`${API}/produk?page=1&limit=50`, fetcher);

  return (
    <div>
      <h2>Produk Digital (via Server Pulsa)</h2>
      <button onClick={() => mutate()} style={{ marginBottom: 12 }}>Refresh</button>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error memuat</p>}
      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th align="left">Kode</th>
            <th align="left">Nama</th>
            <th align="right">Nominal</th>
            <th align="right">Harga</th>
            <th align="left">Tipe</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((p: any) => (
            <tr key={p.code} style={{ borderTop: "1px solid #eee" }}>
              <td>{p.code}</td>
              <td>{p.name}</td>
              <td align="right">{p.nominal ?? "-"}</td>
              <td align="right">{p.sellPrice ?? "-"}</td>
              <td>{p.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
